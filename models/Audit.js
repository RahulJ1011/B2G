const AuditSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String },
  note: { type: String },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AuditLog', AuditSchema);
