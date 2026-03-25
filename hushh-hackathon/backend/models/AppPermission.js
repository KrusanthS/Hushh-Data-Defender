const mongoose = require('mongoose');

const AppPermissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appName: { type: String, required: true },
    dataShared: [{ type: String }],
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    status: { type: String, enum: ['Active', 'Expired'], default: 'Active' },
    expiryDate: { type: Date }
});

module.exports = mongoose.model('AppPermission', AppPermissionSchema);
