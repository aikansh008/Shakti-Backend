const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const PersonalDetails = require("../Models/PersonalDetailSignup");
const Budget = require("../BudgetPrediction/Budgetschema");
const requireAuth = require("../Middlewares/authMiddleware");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.get("/budget/insights", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;

    // Fetch user's budgets and sort by creation time
    const budgets = await Budget.find({ userId }).sort({ createdAt: 1 });
    if (!budgets || budgets.length === 0) {
      return res.status(404).json({ error: "No budget data found." });
    }
    const currentBudget = budgets[budgets.length - 1];

    // Fetch preferred language from PersonalDetails
    const userDetails = await PersonalDetails.findById(userId, {
      "personalDetails.Preferred_Languages": 1,
    });
    const language = userDetails?.personalDetails?.Preferred_Languages || "English";

    // Prepare expenditure text from last two months
    const expenditureHistory = currentBudget.lastMonthExpenditureHistory || [];
    const last2Expenditures = expenditureHistory.slice(-2);

    const expenditureText = last2Expenditures
      .map((monthData, idx) => {
        const monthLabel = idx === 0 ? "Second Last Month" : "Last Month";
        const sectors = Object.entries(monthData || {})
          .map(([sector, value]) => `  - ${sector}: ₹${value}`)
          .join("\n");
        return `${monthLabel}:\n${sectors}`;
      })
      .join("\n\n");

    // Construct Gemini prompt
    const prompt = `
You are a Budget advisor AI. Based on the last two months' data below, give some investment opportunities and also suggest improvements to manage budget like if growth is decreasing suggest like i should lend money from loans or i should withdarwa money from my savings and if i am in profit then suggest to invest the saved mo. Generate exactly 10 insights in the language "${language}".

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

    // Send prompt to Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    // Parse JSON safely
    let insights;
    try {
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      insights = JSON.parse(cleaned);
    } catch (err) {
      console.error("Parsing error:", err);
      return res.status(500).json({ error: "Failed to parse AI response." });
    }

    // Return insights to frontend
    res.json(insights);
  } catch (error) {
    console.error("Gemini error:", error.message || error);
    res.status(500).json({ error: "Gemini AI error" });
  }
});

module.exports = router;
