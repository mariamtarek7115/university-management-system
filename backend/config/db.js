const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb+srv://mariamtarek7144_db_user:Test123@cluster0.csfvlyr.mongodb.net/?appName=Cluster0";

        console.log("Connecting to MongoDB...");

        await mongoose.connect(mongoUri);

        console.log("MongoDB Atlas connected");
        return true;
    } catch (error) {
        console.log("DB ERROR:", error);
        return false;
    }
};

module.exports = connectDB;