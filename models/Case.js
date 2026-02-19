const mongoose = require("mongoose");

const SeveritySchema = new mongoose.Schema({
    label: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], required: true },
    score_estimate: Number,
    confidence: Number,
    label_probabilities: Object,
    model_used: String,
    recommendation: String
}, { _id: false });

const SLASchema = new mongoose.Schema({
    hours: { type: Number, required: true },
    deadline: { type: Date, required: true },
    breached: { type: Boolean, default: false }
}, { _id: false });

const CaseSchema = new mongoose.Schema({
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reporter_name: String,

    crime_type: String,
    location: String,
    description: String,
    incident_datetime: Date,

    severity: SeveritySchema,

    current_authority: {
        type: String,
        enum: ["POLICE", "SUPERIOR", "JUDICIARY"],
        default: "POLICE"
    },
        
    sla: SLASchema,
    assignedPolice: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Police"
},

policeAction: {
  acceptedAt: Date,
  attendedAt: Date,
  remarks: String,
  actionTaken: String
},

    status: {
        type: String,
        enum: ["PENDING", "IN_PROGRESS", "RESOLVED"],
        default: "PENDING"
    },

    confirmed_by_citizen: { type: Boolean, default: false },
    confirmed_by_police: { type: Boolean, default: false },
    escalationCount: { type: Number, default: 0 }, // track how many times it escalated

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Case", CaseSchema);
