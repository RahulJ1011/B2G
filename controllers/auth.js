const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, stationId } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "Email already exists" });

        const hash = await bcrypt.hash(password, 10);

        const user = new User({ name, email, passwordHash: hash, role, stationId });
        await user.save();

        res.json({ message: "User registered successfully", userId: user._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) return res.status(401).json({ message: "Invalid password" });

        const token = jwt.sign({ _id: user._id, role: user.role, stationId: user.stationId }, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, role: user.role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
