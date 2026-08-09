const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require("./routes/authRoutes");
app.use("/", authRoutes);
app.set("view engine", "ejs");

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("MongoDB Connected");

        app.listen(3000, () => {
            console.log("Server running on port 3000");
        });
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err);
    });