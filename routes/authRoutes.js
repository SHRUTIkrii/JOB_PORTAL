const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    const user = new User({
        name,
        email,
        password,
        role
    });

    await user.save();

    res.send("Registration successful");
});

module.exports = router;