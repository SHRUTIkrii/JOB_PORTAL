const express = require("express");
const Job = require("../models/job");
const Application = require("../models/application");

const router = express.Router();


// =====================================================
// POST JOB PAGE
// =====================================================

router.get("/post-job", (req, res) => {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    if (req.session.role !== "recruiter") {
        return res.send("Access denied");
    }

    res.render("recruiter/post-job");

});


// =====================================================
// POST A JOB
// =====================================================

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


// =====================================================
// ALL JOBS
// =====================================================

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


// =====================================================
// EDIT JOB PAGE
// =====================================================

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
            return res.send(
                "Job not found or you are not allowed to edit this job"
            );
        }


        res.render("recruiter/edit-job", {
            job: job
        });


    } catch (err) {

        console.log(err);

        res.send("Something went wrong");

    }

});


// =====================================================
// UPDATE JOB
// =====================================================

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
            return res.send(
                "Job not found or you are not allowed to edit this job"
            );
        }


        res.redirect("/recruiter");


    } catch (err) {

        console.log(err);

        res.send("Something went wrong");

    }

});


// =====================================================
// DELETE JOB
// =====================================================

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
            return res.send(
                "Job not found or you are not allowed to delete this job"
            );
        }


        res.redirect("/recruiter");


    } catch (err) {

        console.log(err);

        res.send("Something went wrong");

    }

});


// =====================================================
// APPLY FOR JOB
// =====================================================

router.get("/apply/:id", async (req, res) => {

    try {

        if (!req.session.userId) {
            return res.redirect("/login");
        }

        if (req.session.role !== "jobseeker") {
            return res.send("Only jobseekers can apply for jobs");
        }


        const job = await Job.findById(req.params.id);


        if (!job) {
            return res.send("Job not found");
        }


        const existingApplication = await Application.findOne({

            job: req.params.id,
            applicant: req.session.userId

        });


        if (existingApplication) {
            return res.send("You have already applied for this job");
        }


        const application = new Application({

            job: req.params.id,
            applicant: req.session.userId

        });


        await application.save();


        res.redirect("/my-applications");


    } catch (err) {

        console.log(err);

        res.send("Something went wrong");

    }

});


// =====================================================
// MY APPLICATIONS
// =====================================================

router.get("/my-applications", async (req, res) => {

    try {

        if (!req.session.userId) {
            return res.redirect("/login");
        }

        if (req.session.role !== "jobseeker") {
            return res.send("Access denied");
        }


        const applications = await Application
            .find({
                applicant: req.session.userId
            })
            .populate("job");


        res.render("my-applications", {
            applications: applications
        });


    } catch (err) {

        console.log(err);

        res.send("Something went wrong");

    }

});


// =====================================================
// RECRUITER - VIEW APPLICANTS
// =====================================================

router.get("/applicants/:jobId", async (req, res) => {

    try {

        if (!req.session.userId) {
            return res.redirect("/login");
        }

        if (req.session.role !== "recruiter") {
            return res.send("Access denied");
        }


        const job = await Job.findOne({

            _id: req.params.jobId,
            recruiter: req.session.userId

        });


        if (!job) {
            return res.send(
                "Job not found or you are not allowed to view applicants"
            );
        }


        const applications = await Application
            .find({
                job: req.params.jobId
            })
            .populate("applicant");


        res.render("recruiter/applicants", {

            job: job,
            applications: applications

        });


    } catch (err) {

        console.log(err);

        res.send("Something went wrong");

    }

});


module.exports = router;