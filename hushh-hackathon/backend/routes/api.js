const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AppPermission = require('../models/AppPermission');
const ActivityLog = require('../models/ActivityLog');

// Auth: Store user after login
router.post('/users', async (req, res) => {
    try {
        const { name, email, firebaseId } = req.body;
        let user = await User.findOne({ firebaseId });
        if (!user) {
            user = new User({ name, email, firebaseId });
            await user.save();
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User: Update Coins (Add/Deduct)
router.post('/users/update-coins', async (req, res) => {
    try {
        const { firebaseId, amount } = req.body;
        const user = await User.findOne({ firebaseId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.hushhCoins += amount;
        await user.save();
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User: Get Balance & Profile
router.get('/users/profile', async (req, res) => {
    try {
        const { firebaseId } = req.query;
        const user = await User.findOne({ firebaseId });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Permissions: Get all permissions for a user
router.get('/permissions', async (req, res) => {
    try {
        const { firebaseId } = req.query;
        const user = await User.findOne({ firebaseId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const permissions = await AppPermission.find({ userId: user._id });
        res.status(200).json(permissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Permissions: Create or update permission
router.post('/permissions', async (req, res) => {
    try {
        const { firebaseId, appName, dataShared, riskLevel, expiryDate } = req.body;
        const user = await User.findOne({ firebaseId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        let permission = await AppPermission.findOne({ userId: user._id, appName });
        if (permission) {
            if (dataShared) permission.dataShared = dataShared;
            if (riskLevel) permission.riskLevel = riskLevel;
            if (expiryDate) permission.expiryDate = expiryDate;
            permission.status = 'Active';
            await permission.save();
        } else {
            permission = new AppPermission({
                userId: user._id,
                appName,
                dataShared,
                riskLevel,
                expiryDate
            });
            await permission.save();
        }
        res.status(200).json(permission);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Permissions: Revoke all
router.put('/permissions/revoke-all', async (req, res) => {
    try {
        const { firebaseId } = req.body;
        const user = await User.findOne({ firebaseId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        await AppPermission.updateMany({ userId: user._id }, { status: 'Expired' });
        res.status(200).json({ message: 'All permissions revoked' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Activity: Get logs
router.get('/activity', async (req, res) => {
    try {
        const { firebaseId } = req.query;
        const user = await User.findOne({ firebaseId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const logs = await ActivityLog.find({ userId: user._id }).sort({ timestamp: -1 });
        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Activity: Create log
router.post('/activity', async (req, res) => {
    try {
        const { firebaseId, appName, appId, action } = req.body;
        const user = await User.findOne({ firebaseId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const log = new ActivityLog({ userId: user._id, appName, appId, action });
        await log.save();
        res.status(200).json(log);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
