const mongoose = require('mongoose');
const StationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  address: { type: String },
  officers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Station', StationSchema);
