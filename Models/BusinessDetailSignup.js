const mongoose = require('mongoose');

const BusinessIdeaDetailsSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  ideaDetails: {
    Business_Name: {
      type: String,
      required: true
    },
    Business_Sector: {
      type: String,
      required: true
    },
    Business_Location: {
      type: String,
      required: true
    },
    Idea_Description: {
      type: String,
      required: true
    },
    Target_Market: {
      type: String,
      required: true
    },
    Unique_Selling_Proposition: {
      type: String,
      required: true
    }
  },
  financialPlan: {
    Estimated_Startup_Cost: {
      type: Number,
      required: true
    },
    Funding_Required: {
      type: Number,
      required: true
    },
    Expected_Revenue_First_Year: {
      type: Number,
      required: true
    }
  },
  operationalPlan: {
    Team_Size: {
      type: Number,
      required: true
    },
    Resources_Required: {
      type: String,
      required: true
    },
    Timeline_To_Launch: {
      type: String,
      required: true
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('BusinessIdeaDetails', BusinessIdeaDetailsSchema);
