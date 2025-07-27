const express = require("express");
const router = express.Router();
const moment = require("moment");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Budget = require("../BudgetPrediction/Budgetschema");
const Task = require("../Models/Task/task");
const Post = require("../Models/community/PostSchema"); 
const PersonalDetails = require("../Models/PersonalDetailSignup");
const requireAuth = require("../Middlewares/authMiddleware");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.get("/progress/insights", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;

    const userDetails = await PersonalDetails.findById(userId, {
          "personalDetails.Preferred_Languages": 1,
        });
        const language = userDetails?.personalDetails?.Preferred_Languages || "English";
        const budgets = await Budget.find({ userId }).sort({ createdAt: 1 });
    if (!budgets || budgets.length === 0) {
      return res.status(404).json({ error: "No budget data found." });
    }

    const currentBudget = budgets[budgets.length - 1];
    const allProfits = currentBudget.profits || [];
    const last6Profits = allProfits.slice(-6);

    // Format profit data
    const currentMonth = moment();
    const profitData = last6Profits.map((profit, index) => {
      const month = moment(currentMonth).subtract(last6Profits.length - 1 - index, "months");
      return `${month.format("MMMM YYYY")}: ₹${profit}`;
    }).join("\n");

    // ✅ Task check for today
    const startOfDay = moment().startOf('day').toDate();
    const endOfDay = moment().endOf('day').toDate();
    const todayTasks = await Task.find({
      userId,
      startDate: { $lte: endOfDay },
      endDate: { $gte: startOfDay },
    });
    const todayTaskSummary = todayTasks.length > 0
      ? `You have ${todayTasks.length} task(s) scheduled for today.`
      : `You have no tasks scheduled for today.`;

    // ✅ Recent post check (last 3 days)
    const threeDaysAgo = moment().subtract(3, 'days').toDate();
    const recentPosts = await Post.find({ createdAt: { $gte: threeDaysAgo } });
    const postSummary = recentPosts.length > 0
      ? `There are ${recentPosts.length} new post(s) in the community in the last 3 days.`
      : `No recent posts in the community.`

    // 🔥 AI Prompt
    const prompt = `
You are a business analyst AI. Based on the user's data like profit data and todays's task if any and post iof posted in recent 7 days and provide insights on all the three topics , provide exactly 10 personalized suggestions for productivity and business strategy. Use the data below.

Profits of the last 6 months:
${profitData}

Today's Task Summary:
${todayTaskSummary}

Community Post Activity:
${postSummary}

in the language "${language}".
Respond only in this strict JSON format with no extra text:
{
  "point1": {
    "title": "First insight here",
    "description": "Detailed description of the first insight"
  },
  "point2": {
    "title": "Second insight here",
    "description": "Detailed description of the second insight"
  },
  "point3": {
    "title": "Third insight here",
    "description": "Detailed description of the third insight"
  },
  "point4": {
    "title": "Fourth insight here",
    "description": "Detailed description of the fourth insight"
  },
  "point5": {
    "title": "Fifth insight here",
    "description": "Detailed description of the fifth insight"
  },
  "point6": {
    "title": "Sixth insight here",
    "description": "Detailed description of the sixth insight"
  },
  "point7": {
    "title": "Seventh insight here",
    "description": "Detailed description of the seventh insight"
  },
  "point8": {
    "title": "Eighth insight here",
    "description": "Detailed description of the eighth insight"
  },
  "point9": {
    "title": "Ninth insight here",
    "description": "Detailed description of the ninth insight"
  },
  "point10": {
    "title": "Tenth insight here",
    "description": "Detailed description of the tenth insight"
  }
}
`.trim();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    let insights;
    try {
      const cleaned = rawText.replace(/```json|```/g, "").trim();
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
