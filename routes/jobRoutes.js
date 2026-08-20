const express = require("express");
const Job = require("../models/job");

const router = express.Router();


// ===============================
// POST JOB PAGE
// ===============================

router.get("/post-job", (req, res) => {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    if (req.session.role !== "recruiter") {
        return res.send("Access denied");
    }

    res.render("recruiter/post-job");

});


// ===============================
// POST A JOB
// ===============================

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
            skills,
            description
        } = req.body;


        if (
            !title ||
            !company ||
            !location ||
            !salary ||
            !skills ||
            !description
        ) {
            return res.send("All fields are required");
        }


        const job = new Job({

            title: title,
            company: company,
            location: location,
            salary: salary,
            skills: skills,
            description: description,

            recruiter: req.session.userId

        });


        await job.save();


        res.redirect("/recruiter");

    } catch (err) {

        console.log(err);

        res.send("Something went wrong");

    }

});


// ===============================
// ALL JOBS
// ===============================

router.get("/jobs", async (req, res) => {

    try {

        const jobs = await Job
            .find()
            .populate("recruiter");

        res.render("jobs", {
            jobs: jobs
        });

    } catch (err) {

        console.log(err);

        res.send("Something went wrong");

    }

});


// ===============================
// EDIT JOB PAGE
// ===============================

router.get("/edit-job/:id", async (req, res) => {

    try {

        if (!req.session.userId) {
            return res.redirect("/login");
        }

        if (req.session.role !== "recruiter") {
            return res.send("Access denied");
        }


        const job = await Job.findOne({
            _id: req.params.id,
            recruiter: req.session.userId
        });


        if (!job) {
            return res.send("Job not found or you are not allowed to edit this job");
        }


        res.render("recruiter/edit-job", {
            job: job
        });


    } catch (err) {

        console.log(err);

        res.send("Something went wrong");

    }

});


// ===============================
// UPDATE JOB
// ===============================

router.post("/edit-job/:id", async (req, res) => {

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
            skills,
            description
        } = req.body;


        if (
            !title ||
            !company ||
            !location ||
            !salary ||
            !skills ||
            !description
        ) {
            return res.send("All fields are required");
        }


        const job = await Job.findOneAndUpdate(

            {
                _id: req.params.id,
                recruiter: req.session.userId
            },

            {
                title: title,
                company: company,
                location: location,
                salary: salary,
                skills: skills,
                description: description
            },

            {
                new: true
            }

        );


        if (!job) {
            return res.send("Job not found or you are not allowed to edit this job");
        }


        res.redirect("/recruiter");


    } catch (err) {

        console.log(err);

        res.send("Something went wrong");

    }

});


// ===============================
// DELETE JOB
// ===============================

router.get("/delete-job/:id", async (req, res) => {

    try {

        if (!req.session.userId) {
            return res.redirect("/login");
        }

        if (req.session.role !== "recruiter") {
            return res.send("Access denied");
        }


        const job = await Job.findOneAndDelete({

            _id: req.params.id,

            recruiter: req.session.userId

        });


        if (!job) {
            return res.send("Job not found or you are not allowed to delete this job");
        }


        res.redirect("/recruiter");


    } catch (err) {

        console.log(err);

        res.send("Something went wrong");

    }

});


module.exports = router;