const express = require("express");
const {
  auth,
  studentCourses,
  courseAttendance,
  markCourseAttendance,
} = require("../../controllers/api");
const { apiMiddleware } = require("../../middlewares/api.middleware");
const router = express.Router();

/* GET users listing. */
router.use(apiMiddleware);

router.post("/auth", auth);
router.get("/courses", studentCourses);
router.get("/courses/:id/attendance", courseAttendance);
router.post("/mark-attendance", markCourseAttendance);

module.exports = router;
