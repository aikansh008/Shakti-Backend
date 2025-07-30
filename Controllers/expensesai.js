const express = require("express");
const router = express.Router();
const moment = require("moment");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const PersonalDetails = require("../Models/PersonalDetailSignup");
const Budget = require("../BudgetPrediction/Budgetschema");
const requireAuth = require("../Middlewares/authMiddleware");
const InsightsCache = require("../Models/caching/budgetinsights");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY2);

// Dummy fallback response
const dummyInsights = {
  "point1": { "title": "Monitor Essential Expenses", "description": "Focus on reducing spending in non-essential areas." },
  "point2": { "title": "Avoid Unnecessary Loans", "description": "If growth is slowing, explore saving adjustments before taking loans." },
  "point3": { "title": "Optimize Subscriptions", "description": "Review monthly subscriptions to eliminate unused services." },
  "point4": { "title": "Increase Emergency Savings", "description": "Set aside at least 10% of income for emergencies if budget allows." },
  "point5": { "title": "Consider Mutual Funds", "description": "Invest surplus in low-risk mutual funds or SIPs." },
  "point6": { "title": "Track Seasonal Spikes", "description": "Plan for seasonal increases in spending like school or festival months." },
  "point7": { "title": "Prioritize High-Interest Debts", "description": "Pay off high-interest loans quickly to free up monthly cash flow." },
  "point8": { "title": "Use Cashback Credit Cards", "description": "If spending is consistent, use reward-based cards wisely." },
  "point9": { "title": "Automate Bill Payments", "description": "Avoid late fees by automating recurring monthly bills." },
  "point10": { "title": "Reinvest Savings", "description": "Profit months should include re-investment into fixed deposits or PPF." }
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
  "point3": { "title": "Third insight", "description": "..." },
  "point4": { "title": "Fourth insight", "description": "..." },
  "point5": { "title": "Fifth insight", "description": "..." },
  "point6": { "title": "Sixth insight", "description": "..." },
  "point7": { "title": "Seventh insight", "description": "..." },
  "point8": { "title": "Eighth insight", "description": "..." },
  "point9": { "title": "Ninth insight", "description": "..." },
  "point10": { "title": "Tenth insight", "description": "..." }
}
`.trim();

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

      await InsightsCache.findOneAndUpdate(
        { userId, date: today },
        { insights: dummyInsights, status: 201 },
        { upsert: true, timestamps: false }
      );

      return res.status(200).json(dummyInsights);
    }

  } catch (error) {
    console.error("Gemini error:", error.message || error);

    await InsightsCache.findOneAndUpdate(
      { userId, date: today },
      { insights: dummyInsights, status: 201 },
      { upsert: true, timestamps: false }
    );

    return res.status(200).json(dummyInsights);
  }
});

module.exports = router;
