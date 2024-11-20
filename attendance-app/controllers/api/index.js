const { Ajv } = require("ajv");
const { getStudentByEmail } = require("../../models/user.model");
const { compareHash } = require("../../helpers/crypto.helper");
const { generateToken } = require("../../helpers/jwt.helper");
const {
  getStudentCourses,
  getCourseClassByCode,
  isStudentEnrolledInCourse,
} = require("../../models/course.model");
const { AttendanceStatus } = require("@prisma/client");
const {
  markAttendance,
  getStudentAttendanceByCourse,
} = require("../../models/attendance.model");

const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);

const authSchema = {
  type: "object",
  properties: {
    email: {
      type: "string",
      errorMessage: "Email is required.",
    },
    password: {
      type: "string",
      minLength: 6,
      errorMessage: "Password is required.",
    },
  },
  required: ["email", "password"],
  additionalProperties: false,
};

const auth = async (req, res, next) => {
  const validate = ajv.compile(authSchema);
  const valid = validate(req.body);
  const errors = [];
  if (validate.errors) {
    for (i = 0; i < validate.errors.length; i++) {
      errors[i] = validate.errors[i].message;
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const user = await getStudentByEmail(req.body.email);

  if (user) {
    if (user.roleId === 3) {
      if (await compareHash(req.body.password, user.password)) {
        const token = await generateToken({ sub: user.id }, "3h");
        delete user.password;

        const result = { ...user, ...user.student[0] };
        delete result.student;

        return res.status(200).json({ token, user: result });
      }
    } else {
      errors.push("Use web portal to login.");
      return res.status(401).json({ errors });
    }
  }

  errors.push("Invalid email or password.");
  res.status(400).json({ errors });
};

const studentCourses = async (req, res, next) => {
  const courses = await getStudentCourses(req.user.student.id);
  res.status(200).json(courses);
};

const markCourseAttendance = async (req, res, next) => {
  if (!req.body.code) {
    return res.status(400).json({ message: "Code is required." });
  }

  const courseClass = await getCourseClassByCode(req.body.code);
  if (!courseClass) {
    return res.status(400).json({ message: "Invalid code." });
  }

  const isEnrolledInCourse = await isStudentEnrolledInCourse(
    req.user.student.id,
    courseClass.courseId
  );

  if (!isEnrolledInCourse) {
    return res
      .status(400)
      .json({ message: "You are not enrolled in this course." });
  }

  // check if current time 10 minutes past the class start time
  const classStartTime = new Date(courseClass.startedAt);
  const currentTime = new Date();
  const diff = Math.floor(Math.abs(currentTime - classStartTime) / 60000);
  const status = diff <= 10 ? AttendanceStatus.PRESENT : AttendanceStatus.LATE;
  const attendance = await markAttendance(
    courseClass.courseId,
    req.user.student.id,
    courseClass.id,
    status
  );

  if (!attendance) {
    return res.status(400).json({ message: "Failed to mark attendance." });
  }

  res.status(200).json({ message: "Attendance marked." });
};

const courseAttendance = async (req, res, next) => {
  if (!req.params.id) {
    return res.status(400).json({ message: "Course ID is required." });
  }

  const courseId = parseInt(req.params.id);
  const isEnrolledInCourse = await isStudentEnrolledInCourse(
    req.user.student.id,
    courseId
  );

  if (!isEnrolledInCourse) {
    return res
      .status(400)
      .json({ message: "You are not enrolled in this course." });
  }

  const attendance = await getStudentAttendanceByCourse(
    req.user.student.id,
    req.params.id
  );
  res.status(200).json(attendance);
};

module.exports = {
  auth,
  studentCourses,
  courseAttendance,
  markCourseAttendance,
};
