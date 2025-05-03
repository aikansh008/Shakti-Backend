const FinancialDetails = require('../Models/FinancialDetailSignup');

const signup2User = async (req, res) => {
  try {
    const {
      userId,
      incomeDetails: { Primary_Monthly_Income, Additional_Monthly_Income },
      assetDetails: { Gold_Asset_amount, Gold_Asset_App_Value, Land_Asset_Area, Land_Asset_App_Value },
      existingloanDetails: { Monthly_Payment }
    } = req.body;

    // Check if all fields are present
    if (!userId || !Primary_Monthly_Income || !Additional_Monthly_Income || !Gold_Asset_amount || !Gold_Asset_App_Value || !Land_Asset_Area || !Land_Asset_App_Value || !Monthly_Payment) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const new2User = new FinancialDetails({
      userId, // ✅ Link to Form 1 user
      incomeDetails: {
        Primary_Monthly_Income,
        Additional_Monthly_Income
      },
      assetDetails: {
        Gold_Asset_amount,
        Gold_Asset_App_Value,
        Land_Asset_Area,
        Land_Asset_App_Value
      },
      existingloanDetails: {
        Monthly_Payment
      }
    });

    await new2User.save();
    res.status(201).json({ message: "Step 2 complete, financial details saved." });

  } catch (err) {
    console.error("Signup2 Error:", err);
    res.status(500).json({ message: "Server error!" });
  }
};

module.exports = { signup2User };
