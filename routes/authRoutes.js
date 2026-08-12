const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

// Home Page
router.get("/", (req, res) => {
    res.render("index");
});

// Register Page
router.get("/register", (req, res) => {
    res.render("register");
});

// Login Page
router.get("/login", (req, res) => {
    res.render("login");
});

// Register User
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.send("All fields are required");
        }

        if (password.length < 6) {
            return res.send("Password must be at least 6 characters");
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.send("Email already registered");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await user.save();

        res.send("Registration successful");

    } catch (err) {
        console.log(err);
        res.send("Something went wrong");
    }
});

// Login User
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.send("Invalid email or password");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.send("Invalid email or password");
        }

        res.send("Login successful");

    } catch (err) {
        console.log(err);
        res.send("Something went wrong");
    }
});

module.exports = router;