const express = require("express");
const {
  protectedRoute,
  adminRoute,
} = require("../middlewares/routes.middleware");
const { index } = require("../controllers/admin/index.controller");
const {
  subjectsView,
  addSubject,
  editSubject,
  deleteSubject,
} = require("../controllers/admin/subject.controller");
const {
  addUser,
  editUser,
  deleteUser,
  importInstructors,
  importStudents,
} = require("../controllers/admin/user.controller");
const {
  instructorsView,
  instructorView,
  importInstructorsView,
} = require("../controllers/admin/instructor.controller");
const {
  studentsView,
  studentView,
  enrollStudentInCourse,
  dropStudentCourse,
  importStudentsView,
} = require("../controllers/admin/student.controller");
const {
  coursesView,
  courseView,
  addCourse,
  editCourse,
  deleteCourse,
  importCoursesView,
  importCourses,
  markComplete,
} = require("../controllers/admin/course.controller");
const { upload } = require("../middlewares/upload.middleware");

const router = express.Router();

router.use(protectedRoute, adminRoute);

router.get("/", index);
router.get("/subjects", subjectsView);
router.get("/subjects/add", addSubject);
router.post("/subjects/add", addSubject);
router.get("/subjects/edit/:id", editSubject);
router.post("/subjects/edit", editSubject);
router.post("/subjects/delete", deleteSubject);
router.get("/users/add/:role", addUser);
router.post("/users/add", addUser);
router.get("/users/edit/:id", editUser);
router.post("/users/edit", editUser);
router.post("/users/delete", deleteUser);
router.get("/users/import/instructors", importInstructorsView);
router.get("/users/import/students", importStudentsView);
router.get("/instructors", instructorsView);
router.get("/instructors/:id", instructorView);
router.get("/students", studentsView);
router.get("/students/:id", studentView);
router.get("/students/enroll-course/:id", enrollStudentInCourse);
router.post("/students/enroll-course", enrollStudentInCourse);
router.post("/students/drop-course", dropStudentCourse);
router.get("/courses", coursesView);
router.get("/courses/add", addCourse);
router.post("/courses/add", addCourse);
router.get("/courses/edit/:id", editCourse);
router.post("/courses/edit", editCourse);
router.post("/courses/delete", deleteCourse);
router.get("/courses/view/:id", courseView);
router.post("/courses/markComplete", markComplete);
router.get("/courses/import", importCoursesView);

router.post(
  "/users/import/instructors",
  upload.single("file"),
  importInstructors
);
router.post("/users/import/students", upload.single("file"), importStudents);
router.post("/courses/import", upload.single("file"), importCourses);

module.exports = router;
