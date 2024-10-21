//const addCourse = require('../controllers/courses.js');

const express = require('express');
const multer = require('multer');

const router = express.Router();
const upload = require("../middlewares/multer");



router.post("/uploads", upload.single("file"), (req, res) => {
    res.json({status: "success"});
});


module.exports = router;