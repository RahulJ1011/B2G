const mongoose = require("mongoose")

const policeSchema = new mongoose.Schema(
  {
    policeId: {
      type: String,
      required: true,
      unique: true
    },

    name: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["POLICE", "SUPERIOR", "JUDICIARY"],
      default: "POLICE"
    },

    stationName: {
      type: String,
      required: true
    },

    stationCode: {
      type: String,
      required: true
    },

    jurisdiction: {
      type: [String], // area / district codes
      required: true
    },

    rank: {
      type: String,
      enum: ["INSPECTOR", "SI", "DSP", "SP"],
      required: true
    },

    contactNumber: {
      type: String,
      required: true
    },

    email: {
      type: String
    },

    password: {
      type: String,
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    },

    assignedCases: [
      {
        caseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Case"
        },
        assignedAt: Date,
        slaDeadline: Date,
        status: {
          type: String,
          enum: ["PENDING", "ACCEPTED", "ATTENDED", "FAILED"],
          default: "PENDING"
        }
      }
    ],

    slaFailures: {
      type: Number,
      default: 0
    },

    lastLogin: Date
  },
  { timestamps: true }
);
module.exports = mongoose.model('Police', policeSchema);


