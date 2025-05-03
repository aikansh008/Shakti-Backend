const bcrypt = require('bcrypt');
const PersonalDetails = require('../Models/PersonalDetailSignup');
const tempUsers= require("../tempUserStore");
const {v4: uuidv4}= require('uuid');

const signupUser = async (req, res) => {
  try {
    // Destructure the data correctly based on the incoming request body
    const {
      personalDetails: { Full_Name,Email, Preferred_Languages},
      professionalDetails: { Business_Experience, Educational_Qualifications },
      passwordDetails: { Password, Create_Password }
    } = req.body;

    // Check if all fields are present
    if (!Full_Name||!Email || !Preferred_Languages || !Business_Experience || !Educational_Qualifications || !Create_Password || !Password) {
      return res.status(400).json({ message: "All fields are required!" });
    }
    if (!Email.includes('@')) {
      return res.status(400).json({ message: "Invalid email address." });
    }
    // Step 1: Passwords match check
    if (Create_Password !== Password) {
      return res.status(400).json({ message: "Passwords do not match!" });
    }

    // Step 2: Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(Create_Password, saltRounds);

//     // Step 3: Create new user
//     const newUser = new PersonalDetails({
//       personalDetails: {
//         Full_Name,
//         Email,
//         Preferred_Languages
//       },
//       professionalDetails: {
//         Business_Experience,
//         Educational_Qualifications
//       },
//       passwordDetails: {
//         Password: hashedPassword
//       }
//     });

//     // Step 4: Save to DB
//     const savedUser = await newUser.save();
// res.status(201).json({ message: "Step 1 complete", userId: savedUser._id });

// Save Temporary.
const sessionId= uuidv4();
tempUsers.set(sessionId,{
  personalDetails: {
          Full_Name,
          Email,
          Preferred_Languages
        },
  professionalDetails: {
          Business_Experience,
          Educational_Qualifications
        },
  passwordDetails: {
          HashedPassword: hashedPassword
        }
      });
      res.status(200).json({ message: "Form 1 saved", sessionId });

  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Server error!" });
  }
};

module.exports = { signupUser };
