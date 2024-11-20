const createError = require("http-errors");
const { Ajv } = require("ajv");
const { convertTimeTo12Hours } = require("../../helpers/common.helper");
const { getHeaderData } = require("../../helpers/request.helper");
const {
  getCourseByInstructor,
  createClass,
  getCourseClass,
  endClass,
} = require("../../models/course.model");
const { getInstructorById } = require("../../models/instructor.model");
const {
  getStudentsByCourse,
  getStudentById,
} = require("../../models/student.model");
const { generateQRCode } = require("../../helpers/qrcode.helper");
const { markAbsentStudents } = require("../../models/attendance.model");

const index = async (req, res, next) => {
  const header = await getHeaderData(req);
  const instructor = await getInstructorById(header.id);

  res.render("instructor/index", {
    title: instructor.user.fullName,
    header,
    data: { instructor },
  });
};

const instructorCourse = async (req, res, next) => {
  const header = await getHeaderData(req);
  const course = await getCourseByInstructor(header.id, req.params.id);

  if (!course) {
    return next(createError(404, "Course not found."));
  }

  const students = await getStudentsByCourse(course.id);

  course.classStartTime = convertTimeTo12Hours(course.classStartTime);
  course.classEndTime = convertTimeTo12Hours(course.classEndTime);

  res.render("instructor/course", {
    title: course.subject.name,
    header,
    data: { course, students },
  });
};

const courseStudents = async (req, res, next) => {
  const header = await getHeaderData(req);
  const student = await getStudentById(req.params.id);

  if (!student) {
    return next(createError(404, "Student not found."));
  }

  res.render("instructor/student", {
    title: student.user.fullName,
    header,
    data: { student },
  });
};

const startClass = async (req, res, next) => {
  const header = await getHeaderData(req);
  const course = await getCourseByInstructor(header.id, req.body.courseId);

  if (!course) {
    return next(createError(404, "Course not found."));
  }

  const courseClass = await createClass(header.id, course.id);

  if (!courseClass) {
    return next(createError(400, "Failed to start class."));
  }

  res.redirect(`/instructor/classes/${courseClass.id}`);
};

const finishClass = async (req, res, next) => {
  const header = await getHeaderData(req);
  const courseClass = await endClass(header.id, req.body.classId);

  if (!courseClass) {
    return next(createError(400, "Failed to start class."));
  }

  res.redirect("/instructor");
};

const classDetail = async (req, res, next) => {
  const header = await getHeaderData(req);
  const courseClass = await getCourseClass(header.id, req.params.id);

  const codeData = await generateQRCode(courseClass.uuid, courseClass.code);

  res.render("instructor/course-class", {
    title: courseClass.course.subject.name,
    header,
    data: { ...courseClass, codeData },
  });
};

module.exports = {
  instructorIndex: index,
  instructorCourse,
  courseStudents,
  startClass,
  finishClass,
  classDetail,
};
