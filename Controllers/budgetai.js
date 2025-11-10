const express = require("express");
const router = express.Router();
const moment = require("moment");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Budget = require("../BudgetPrediction/Budgetschema");
const requireAuth = require("../Middlewares/authMiddleware");
const Redis = require("ioredis");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY4);

// const redis = new Redis({
//   host: '172.17.0.1',
//   port: 6379
// });
let redis;
if (process.env.REDIS_URL) {
  // Production: Render provides REDIS_URL
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    retryStrategy(times) {
      if (times > 3) {
        console.warn('⚠️ Redis connection failed, continuing without cache');
        return null;
      }
      return Math.min(times * 100, 2000);
    }
  });
}
else {
  
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) {
        console.warn('⚠️ Redis connection failed, continuing without cache');
        return null;
      }
      return Math.min(times * 100, 2000);
    }
  });
}

redis.on('error', (err) => {
  console.warn('⚠️ Redis error:', err.message);
});

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});
router.get("/business/insights", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const redisKey = `insights:${userId}`;

    // 1. Check if insights are already cached
    const cachedInsights = await redis.get(redisKey);
    if (cachedInsights) {
      return res.json(JSON.parse(cachedInsights));
    }

    // 2. Fetch data from DB
    const budgets = await Budget.find({ userId });
    if (!budgets || budgets.length === 0) {
      return res.status(404).json({ error: "No budget data found." });
    }

    const currentBudget = budgets[0];
    const allProfits = currentBudget.profits || [];
    const last6Profits = allProfits.slice(-6);

    const currentMonth = moment();
    const profitData = last6Profits.map((profit, index) => {
      const month = moment(currentMonth).subtract(last6Profits.length - 1 - index, "months");
      return { month: month.format("MMMM YYYY"), value: profit };
    });

    const profitText = profitData.map(p => `${p.month}: ₹${p.value}`).join("\n");

    const expenditureHistory = currentBudget.lastMonthExpenditureHistory || [];
    const last2Expenditures = expenditureHistory.slice(-2);

    const expenditureText = last2Expenditures.map((monthData, idx) => {
      const monthLabel = idx === 0 ? "Second Last Month" : "Last Month";
      const sectors = Object.entries(monthData || {})
        .map(([sector, value]) => `  - ${sector}: ₹${value}`)
        .join("\n");
      return `${monthLabel}:\n${sectors}`;
    }).join("\n\n");

    const prompt = `
You are a financial advisor AI. Based on the business data below, generate exactly 10 insights as suggestions.

Profits of the last 6 months:
${profitText}

Expenditures for the last 2 months:
${expenditureText}

Respond only in this strict JSON format with no extra text in 10 points:
Required JSON Format:
{
  "point1": "First insight here",
  "point2": "Second insight here",
  "point3": "Third insight here",
  "point4": "Fourth insight here",
  "point5": "Fifth insight here",
  "point6": "Sixth insight here",
  "point7": "Seventh insight here",
  "point8": "Eighth insight here",
  "point9": "Ninth insight here",
  "point10": "Tenth insight here"
}
`.trim();

    // 3. Generate content using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    let insights;
    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      insights = JSON.parse(cleaned);
    } catch (err) {
      console.error("Parsing error:", err);
      return res.status(500).json({ error: "Failed to parse AI response." });
    }

    // 4. Save to Redis with 24-hour TTL (86400 seconds)
    await redis.set(redisKey, JSON.stringify(insights), 'EX', 86400);

    res.json(insights);

  } catch (error) {
    console.error("Gemini error:", error.message || error);
    res.status(500).json({ error: "Gemini AI error" });
  }
});

module.exports = router;
