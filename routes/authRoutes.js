const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Register Page
router.get("/register", (req, res) => {
    res.render("register");
});

// Register User
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Basic validation
        if (!name || !email || !password || !role) {
            return res.send("All fields are required");
        }

        if (password.length < 6) {
            return res.send("Password must be at least 6 characters");
        }

        // Check existing email
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.send("Email already registered");
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            role
        });

        await user.save();

        res.send("Registration successful");

    } catch (err) {
        console.log(err);
        res.send("Something went wrong");
    }
});

module.exports = router;