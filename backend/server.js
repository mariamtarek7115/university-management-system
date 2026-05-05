const express = require("express");
const cors = require("cors");
const communityRoutes = require("./routes/communityRoutes");
const { ensureCommunitySeedData } = require("./data/communityStore");
const facilitiesRoutes = require("./routes/facilitiesRoutes");
const { ensureFacilitiesSeedData } = require("./data/facilitiesStore");
const staffRoutes = require("./routes/staffRoutes");
const { ensureStaffSeedData } = require("./data/staffStore");
const curriculumRoutes = require("./routes/curriculumRoutes");
const { ensureCurriculumSeedData } = require("./data/curriculumStore");

const app = express();

const connectDB = require("./config/db");

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/community", communityRoutes);
app.use("/api/facilities", facilitiesRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/curriculum", curriculumRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("Server is running");
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    const databaseConnected = await connectDB();
    if (databaseConnected) {
        await ensureCommunitySeedData();
        await ensureFacilitiesSeedData();
        await ensureStaffSeedData();
        await ensureCurriculumSeedData();
    } else {
        console.log("MongoDB connection is unavailable. Community persistence will not work until the database reconnects.");
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();