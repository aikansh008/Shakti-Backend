const mongoose = require('mongoose');

const PersonalDetailsSchema = new mongoose.Schema({
  personalDetails: {
    Full_Name: {
      type: String,
      required: true
    },
    Email: {
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

// ✅ Prevent OverwriteModelError:
const PersonalDetails = mongoose.models.PersonalDetails || mongoose.model('PersonalDetails', PersonalDetailsSchema);

module.exports = PersonalDetails;
