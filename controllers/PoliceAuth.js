
const Police = require("../models/Police.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")

 const policeLogin = async (req, res) => {
  try {
    const { policeId, password } = req.body;

    // 1. Validate input
    if (!policeId || !password) {
      return res.status(400).json({
        success: false,
        message: "Police ID and password are required"
      });
    }

    // 2. Find police officer
    const police = await Police.findOne({ policeId });

    if (!police) {
      return res.status(404).json({
        success: false,
        message: "Police account not found"
      });
    }

    // 3. Check active status
    if (!police.isActive) {
      return res.status(403).json({
        success: false,
        message: "Police account is deactivated"
      });
    }

    // 4. Compare password
    const isMatch = await bcrypt.compare(password, police.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // 5. Generate JWT
    const token = jwt.sign(
      {
        _id: police._id,
        role: police.role,              // POLICE / SUPERIOR / JUDICIARY
        stationCode: police.stationCode
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // 6. Update last login
    police.lastLogin = new Date();
    await police.save();

    // 7. Response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      police: {
        id: police._id,
        policeId: police.policeId,
        name: police.name,
        role: police.role,
        stationName: police.stationName,
        rank: police.rank
      }
    });

  } catch (error) {
    console.error("Police login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
};



const registerPolice = async (req, res) => {
  try {
    const {
      policeId,
      name,
      email,
      password,
      rank,
      stationName,
      stationCode,
      phone,
      contactNumber,
      role = "POLICE" // default role
    } = req.body;

    // Check if policeId or email already exists
    const existing = await Police.findOne({
      $or: [{ policeId }, { email }]
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Police with this ID or email already exists"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create police
    const police = new Police({
      policeId,
      name,
      email,
      password: hashedPassword,
      rank,
      stationName,
      stationCode,
      phone,
      role,
      contactNumber
    });

    await police.save();

    return res.status(201).json({
      success: true,
      message: "Police registered successfully",
      police: {
        id: police._id,
        policeId: police.policeId,
        name: police.name,
        role: police.role,
        rank: police.rank,
        stationName: police.stationName
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {policeLogin,registerPolice}