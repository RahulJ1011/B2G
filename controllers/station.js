const Station = require('../models/PoliceStation');
const User = require('../models/User');

// Create Station
exports.createStation = async (req, res) => {
    try {
        const { name, location, address } = req.body;
        const station = new Station({ name, location, address });
        await station.save();
        res.json({ message: "Station created", station });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


exports.getStations = async (req, res) => {
    try {
        const stations = await Station.find().populate('officers', 'name email role');
        res.json({ stations });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
