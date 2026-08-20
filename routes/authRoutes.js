const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Job = require("../models/job");

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

        req.session.userId = user._id;
        req.session.role = user.role;
        console.log("SESSION:", req.session);

        // Role based redirect
        if (user.role === "jobseeker") {
            return res.redirect("/jobseeker");
        }

        if (user.role === "recruiter") {
            return res.redirect("/recruiter");
        }

        res.send("Invalid role");

    } catch (err) {
        console.log(err);
        res.send("Something went wrong");
    }
});

// Job Seeker Dashboard
router.get("/jobseeker", (req, res) => {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    if (req.session.role !== "jobseeker") {
        return res.send("Access denied");
    }

    res.render("jobseeker");
});

// Recruiter Dashboard
router.get("/recruiter", async (req, res) => {

    try {

        console.log("RECRUITER SESSION:", req.session);


        if (!req.session.userId) {
            return res.redirect("/login");
        }


        if (req.session.role !== "recruiter") {
            return res.send("Access denied");
        }


        const jobs = await Job.find({
            recruiter: req.session.userId
        });


        res.render("recruiter/dashboard", {
            jobs: jobs
        });


    } catch (err) {

        console.log(err);

        res.send("Something went wrong");

    }

});

// Logout
router.get("/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.send("Logout failed");
        }

        res.redirect("/");
    });

});

module.exports = router;