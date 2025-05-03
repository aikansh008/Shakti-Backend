const mongoose = require('mongoose');

const PersonalDetailsSchema = new mongoose.Schema({
  personalDetails: {
    Full_Name: {
      type: String,
      required: true
    },
    Preferred_Languages: {
      type: String,
      required: true
    }
  },

  professionalDetails: {
    Business_Experience: {
      type: String,
      required: true
    },
    Educational_Qualifications: {
      type: String,
      required: true
    }
  },

  passwordDetails: {
    Password: {
      type: String,
      required: true
    }
  }

}, { timestamps: true });

module.exports = mongoose.model('PersonalDetails', PersonalDetailsSchema);
