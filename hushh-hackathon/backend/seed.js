require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const AppPermission = require('./models/AppPermission');
const ActivityLog = require('./models/ActivityLog');

const MONGODB_URI = process.env.MONGODB_URI;

const seedData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for seeding...");

        const users = await User.find({});
        if (users.length === 0) {
            console.error("No users found! Please log in first.");
            process.exit(1);
        }

        for (const user of users) {
            console.log(`Seeding data for user: ${user.name} (${user.email})`);

            // Clear existing data for this user
            await AppPermission.deleteMany({ userId: user._id });
            await ActivityLog.deleteMany({ userId: user._id });

            // Diverse permissions
            const permissions = [
                {
                    userId: user._id,
                    appName: "HealthifyMe",
                    dataShared: ["Weight", "Blood Pressure", "Sleep"],
                    riskLevel: "High",
                    status: "Active",
                    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
                },
                {
                    userId: user._id,
                    appName: "Zomato",
                    dataShared: ["Location", "Order History"],
                    riskLevel: "Medium",
                    status: "Active",
                    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                },
                {
                    userId: user._id,
                    appName: "Hushh Wallet",
                    dataShared: ["Transaction Metadata"],
                    riskLevel: "Low",
                    status: "Active",
                    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                },
                {
                    userId: user._id,
                    appName: "Flashlight App",
                    dataShared: ["Contacts", "Location"],
                    riskLevel: "High",
                    status: "Active",
                    expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
                },
                {
                    userId: user._id,
                    appName: "Old Messenger",
                    dataShared: ["SMS Proxy"],
                    riskLevel: "High",
                    status: "Expired",
                    expiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
                }
            ];
            await AppPermission.insertMany(permissions);

            // Diverse logs
            const logs = [
                { userId: user._id, appName: "HealthifyMe", action: "Vital Signs Accessed", timestamp: new Date() },
                { userId: user._id, appName: "Zomato", action: "Location Tracked", timestamp: new Date(Date.now() - 7200000) },
                { userId: user._id, appName: "Flashlight App", action: "Contact List Exported", timestamp: new Date(Date.now() - 14400000) },
                { userId: user._id, appName: "System", action: "Risk Audit Completed", timestamp: new Date(Date.now() - 86400000) }
            ];
            await ActivityLog.insertMany(logs);
        }

        console.log("Seeding complete for ALL users!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
};

seedData();
