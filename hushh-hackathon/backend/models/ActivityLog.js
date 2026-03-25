const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appId: { type: mongoose.Schema.Types.ObjectId, ref: 'AppPermission' },
    appName: { type: String, required: true },
    action: { type: String, required: true }, // shared, revoked, accessed
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
