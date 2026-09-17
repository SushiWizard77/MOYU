const mongoose = require("mongoose");

const readinessScoreSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    overall: { type: Number, default: 0, min: 0, max: 100 },
    categories: {
      coding: { type: Number, default: 0, min: 0, max: 100 },
      aptitude: { type: Number, default: 0, min: 0, max: 100 },
      dbms: { type: Number, default: 0, min: 0, max: 100 },
      os: { type: Number, default: 0, min: 0, max: 100 },
      cn: { type: Number, default: 0, min: 0, max: 100 },
      oop: { type: Number, default: 0, min: 0, max: 100 },
      technical: { type: Number, default: 0, min: 0, max: 100 },
      hrInterview: { type: Number, default: 0, min: 0, max: 100 },
      communication: { type: Number, default: 0, min: 0, max: 100 },
      resume: { type: Number, default: 0, min: 0, max: 100 },
    },
    history: [
      {
        overall: Number,
        recordedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReadinessScore", readinessScoreSchema);
