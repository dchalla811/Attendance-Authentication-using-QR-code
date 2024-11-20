const express = require("express");
const {
  protectedRoute,
  instructorRoute,
} = require("../middlewares/routes.middleware");
const {
  instructorIndex,
  instructorCourse,
  courseStudents,
  startClass,
  classDetail,
  finishClass,
} = require("../controllers/instructors/index.controller");
const {
  attendanceView,
  attendanceForm,
} = require("../controllers/instructors/attendance.controller");

const router = express.Router();

router.use(protectedRoute, instructorRoute);

router.get("/", instructorIndex);
router.get("/courses/:id", instructorCourse);
router.get("/students/:id", courseStudents);
router.post("/start-class", startClass);
router.post("/end-class", finishClass);
router.get("/classes/:id", classDetail);
router.get("/courses/:id/attendance", attendanceView);
router.get("/courses/attendance/:id", attendanceForm);
router.post("/courses/attendance", attendanceForm);

module.exports = router;
