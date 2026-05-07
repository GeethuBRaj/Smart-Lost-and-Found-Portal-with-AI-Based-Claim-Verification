const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  claimant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  verificationAnswers: [{ question: String, answer: String }],
  aiVerdict: {
    score: { type: Number },
    passed: { type: Boolean },
    reasoning: { type: String },
    flagged: { type: Boolean, default: false }
  },
  additionalNote: { type: String },
  status: {
    type: String,
    enum: ['pending', 'ai_approved', 'ai_rejected', 'admin_approved', 'admin_rejected'],
    default: 'pending'
  },
  adminNote: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Claim', claimSchema);