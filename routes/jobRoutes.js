const express = require("express");
const Job = require("../models/job");

const router = express.Router();

// Post Job Page
router.get("/post-job", (req, res) => {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    if (req.session.role !== "recruiter") {
        return res.send("Access denied");
    }

    res.render("post-job");
});

// Post Job
router.post("/post-job", async (req, res) => {

    try {

        if (!req.session.userId) {
            return res.redirect("/login");
        }

        if (req.session.role !== "recruiter") {
            return res.send("Access denied");
        }

        const {
            title,
            company,
            location,
            salary,
            description
        } = req.body;

        if (!title || !company || !location || !salary || !description) {
            return res.send("All fields are required");
        }

        const job = new Job({
            title,
            company,
            location,
            salary,
            description,
            recruiter: req.session.userId
        });

        await job.save();

        res.redirect("/jobs");

    } catch (err) {

        console.log(err);
        res.send("Something went wrong");

    }
});

// All Jobs
router.get("/jobs", async (req, res) => {

    try {

        const jobs = await Job.find().populate("recruiter");

        res.render("jobs", {
            jobs: jobs
        });

    } catch (err) {

        console.log(err);
        res.send("Something went wrong");

    }
});

module.exports = router;