const express = require("express");
const router = express.Router();
const moment = require("moment");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const requireAuth = require("../Middlewares/authMiddleware");

const Budget = require("../BudgetPrediction/Budgetschema");
const PersonalDetails = require("../Models/PersonalDetailSignup");
const InsightsCache = require("../Models/caching/budgetinsights");

require("dotenv").config();

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY2);

// Fallback dummy insights
const dummyInsights = {
  point1: { title: "Track Essential Costs", description: "Prioritize tracking necessary spending like food, rent, and transport." },
  point2: { title: "Cut Discretionary Spending", description: "Limit luxury and entertainment expenses in tight months." },
  point3: { title: "Build an Emergency Fund", description: "Set aside some money for emergencies using profits from better months." },
  point4: { title: "Avoid New Loans", description: "If profit is dropping, avoid acquiring new debt and focus on stability." },
  point5: { title: "Refinance If Possible", description: "Check if any existing loans can be refinanced to reduce monthly outgo." },
  point6: { title: "Invest in Recurring Deposits", description: "In profit months, park extra cash in RDs or short-term FDs." },
  point7: { title: "Use Budgeting Tools", description: "Apps or spreadsheets can help better track trends and savings." },
  point8: { title: "Avoid Impulse Buys", description: "Plan purchases with a checklist to avoid overspending." },
  point9: { title: "Monitor Monthly Changes", description: "Keep an eye on sectors showing major variance and investigate." },
  point10: { title: "Seek Expert Advice", description: "If losses continue, consult a financial planner or credit advisor." }
};

router.post("/budget/insights", requireAuth, async (req, res) => {
  const userId = req.userId;
  const today = moment().format("YYYY-MM-DD");

  try {
    const cached = await InsightsCache.findOne({ userId, date: today });

    if (cached && (cached.status === 200 || cached.status === 201)) {
      const lastUpdated = moment(cached.updatedAt || cached.createdAt);
      const hoursSinceLast = moment().diff(lastUpdated, "hours");
      if (hoursSinceLast < 24) {
        return res.status(200).json(cached.insights);
      }
    }

    const budgets = await Budget.find({ userId }).sort({ createdAt: 1 });
    if (!budgets || budgets.length === 0) {
      await InsightsCache.findOneAndUpdate(
        { userId, date: today },
        { status: 404 },
        { upsert: true }
      );
      return res.status(404).json({ error: "No budget data found." });
    }

    const currentBudget = budgets[budgets.length - 1];
    const userDetails = await PersonalDetails.findById(userId, {
      "personalDetails.Preferred_Languages": 1,
    });

    const language = userDetails?.personalDetails?.Preferred_Languages || "English";

    const expenditureHistory = currentBudget.lastMonthExpenditureHistory || [];
    const last2Expenditures = expenditureHistory.slice(-2);

    const expenditureText = last2Expenditures.map((monthData, idx) => {
      const label = idx === 0 ? "Second Last Month" : "Last Month";
      const sectors = Object.entries(monthData || {})
        .map(([sector, value]) => `  - ${sector}: ₹${value}`)
        .join("\n");
      return `${label}:\n${sectors}`;
    }).join("\n\n");

    const prompt = `
You are a Budget advisor AI. Based on the last two months' data below, give some investment opportunities and also suggest improvements to manage budget like if growth is decreasing suggest like I should lend money from loans or withdraw from savings, and if I am in profit then suggest where to invest.

Generate exactly 10 insights in the language "${language}".

Expenditures for the last 2 months:
${expenditureText}

Respond only in this strict JSON format with no extra text:
{
  "point1": { "title": "First insight", "description": "..." },
  "point2": { "title": "Second insight", "description": "..." },
  ...
  "point10": { "title": "Tenth insight", "description": "..." }
}`.trim();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    try {
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      const insights = JSON.parse(cleaned);

      await InsightsCache.findOneAndUpdate(
        { userId, date: today },
        { insights, status: 200 },
        { upsert: true }
      );

      return res.status(200).json(insights);
    } catch (parseError) {
      console.error("Parsing error:", parseError.message || parseError);

      if (!cached) {
        await InsightsCache.create({
          userId,
          date: today,
          insights: dummyInsights,
          status: 201
        });
      }

      return res.status(200).json(cached?.insights || dummyInsights);
    }

  } catch (error) {
    console.error("Gemini error:", error.message || error);

    const cached = await InsightsCache.findOne({ userId, date: today });

    if (!cached) {
      await InsightsCache.create({
        userId,
        date: today,
        insights: dummyInsights,
        status: 201
      });
    }

    return res.status(200).json(cached?.insights || dummyInsights);
  }
});

module.exports = router;
