const express = require("express");
const router = express.Router();
const moment = require("moment");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Budget = require("../BudgetPrediction/Budgetschema");
const requireAuth = require("../Middlewares/authMiddleware");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.get("/business/insights", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
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

    res.json(insights);

  } catch (error) {
    console.error("Gemini error:", error.message || error);
    res.status(500).json({ error: "Gemini AI error" });
  }
});

module.exports = router;
