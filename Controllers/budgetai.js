const express = require("express");
const router = express.Router();
const moment = require("moment");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Budget = require("../BudgetPrediction/Budgetschema");
const requireAuth = require("../Middlewares/authMiddleware");
const InsightsCache = require("../Models/caching/businessinsightscache");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY1);

// Dummy fallback insight
const dummyInsights = {
  "point1": "A consistent decline in profits over the observed period indicates potential issues in market demand or internal operations.",
  "point2": "Examine any recent operational changes, such as staffing, process adjustments, or cost structures, that may have negatively impacted profitability.",
  "point3": "Review customer feedback and satisfaction metrics to detect potential dissatisfaction leading to decreased sales.",
  "point4": "Investigate external market conditions, including competitor activities or economic trends, that could be affecting revenue.",
  "point5": "Analyze sales channel performance to identify if any specific channel underperformed during the period.",
  "point6": "Check for increasing operational costs, such as raw material prices, rent, or logistics, that may be eating into profits.",
  "point7": "Evaluate marketing effectiveness—poor targeting or reduced visibility might be causing lower customer engagement.",
  "point8": "Assess product or service relevance—there may be a need for innovation or diversification to regain market interest.",
  "point9": "Look into inventory management—excess stock or stockouts can hurt profitability and customer satisfaction.",
  "point10": "Implement regular performance reviews and build an early warning system to detect declining profit trends before they escalate."
};

router.get("/business/insights", requireAuth, async (req, res) => {
  const userId = req.userId;
  const today = moment().format("YYYY-MM-DD");

  try {
    const existingCache = await InsightsCache.findOne({ userId, date: today });

    // If already cached and valid
    if (existingCache && existingCache.status === 200||cached.status===201 ) {
      return res.status(200).json(existingCache.insights);
    }

    // If failed previously, retry only if more than 24 hours passed
    if (existingCache && existingCache.status !== 200 || existingCache.status !== 201) {
      const lastUpdated = moment(existingCache.updatedAt || existingCache.createdAt);
      if (moment().diff(lastUpdated, "hours") < 24) {
        return res.status(200).json(dummyInsights);
      }
    }

    const budgets = await Budget.find({ userId });
    if (!budgets || budgets.length === 0) {
      await InsightsCache.findOneAndUpdate(
        { userId, date: today },
        { status: 404 },
        { upsert: true }
      );
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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const rawText = response.text();
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      const insights = JSON.parse(cleaned);

      // Save good result
      await InsightsCache.findOneAndUpdate(
        { userId, date: today },
        { insights, status: 200 },
        { upsert: true }
      );

      return res.status(200).json(insights);
    } catch (parseError) {
      // Save dummy with failed status
      await InsightsCache.findOneAndUpdate(
        { userId, date: today },
        { insights: dummyInsights, status: "failed" }, // don't update time
        { upsert: true }
      );

      return res.status(200).json(dummyInsights);
    }

  } catch (error) {
    console.error("Gemini error:", error.message || error);

    const isRateLimit = error.message?.includes("429") || error.message?.includes("503");

    if (isRateLimit) {
      // Save dummy with failed status
      await InsightsCache.findOneAndUpdate(
        { userId, date: today },
        { insights: dummyInsights, status: "failed" },
        { upsert: true }
      );
      return res.status(200).json(dummyInsights);
    }

    // Generic error
    await InsightsCache.findOneAndUpdate(
      { userId, date: today },
      { status: 500 },
      { upsert: true }
    );

    return res.status(500).json({ error: "Gemini AI error" });
  }
});

module.exports = router;
