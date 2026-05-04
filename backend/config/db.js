const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        console.log("Connecting to MongoDB...");  // 👈 ADD THIS

        await mongoose.connect(
            "mongodb+srv://mariamtarek7144_db_user:Test123@cluster0.csfvlyr.mongodb.net/?appName=Cluster0"
        );

        console.log("MongoDB Atlas connected");
    } catch (error) {
        console.log("DB ERROR:", error);  // 👈 IMPORTANT
        process.exit(1);
    }
};

module.exports = connectDB;