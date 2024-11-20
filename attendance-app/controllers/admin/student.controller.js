const createError = require("http-errors");
const { Ajv } = require("ajv");
const { getHeaderData } = require("../../helpers/request.helper");
const { getAllCourses, enrollStudent } = require("../../models/course.model");
const {
  getAllStudents,
  getStudentById,
  dropCourse,
} = require("../../models/student.model");

const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);

const schema = {
  type: "object",
  properties: {
    studentId: {
      type: "string",
      errorMessage: "Student is required.",
    },
    courseId: {
      type: "string",
      pattern: "^[1-9]\\d*$",
      errorMessage: "Course is required.",
    },
  },
  required: ["studentId", "courseId"],
  additionalProperties: false,
};

const studentsView = async (req, res, next) => {
  const header = await getHeaderData(req);
  const students = await getAllStudents();

  res.render("admin/students", {
    title: "Students",
    header,
    data: { students },
  });
};

const studentView = async (req, res, next) => {
  const header = await getHeaderData(req);
  const student = await getStudentById(req.params.id);

  if (!student) {
    return next(createError(404, "Student not found."));
  }

  res.render("admin/student", {
    title: student.user.fullName,
    header,
    data: { student },
  });
};

const enrollStudentInCourse = async (req, res, next) => {
  const header = await getHeaderData(req);
  const courses = await getAllCourses();

  if (req.method === "GET") {
    return res.render("admin/enroll-course", {
      title: "Enroll Student",
      header,
      data: { courses },
      defaults: { studentId: req.params.id },
    });
  }

  const validate = ajv.compile(schema);
  const valid = validate(req.body);
  const errors = [];
  if (validate.errors) {
    for (i = 0; i < validate.errors.length; i++) {
      errors[i] = validate.errors[i].message;
    }
  }

  if (valid) {
    try {
      const result = await enrollStudent(req.body);
      if (result) {
        return res.redirect(`/admin/students/${result.studentId}`);
      }
      errors.push("Student already enrolled in course.");
    } catch (error) {
      console.error(error);
      errors.push("Student already enrolled in course.");
    }
  }

  res.render("admin/enroll-course", {
    title: "Enroll Student",
    header,
    data: { courses },
    defaults: { ...req.body, courseId: parseInt(req.body.courseId) },
    errors,
  });
};

const dropStudentCourse = async (req, res, next) => {
  if (!req.body.studentId || !req.body.courseId) {
    return next(createError(400, "Bad Request."));
  }

  await dropCourse(req.body.studentId, req.body.courseId);

  res.redirect(`/admin/students/${req.body.studentId}`);
};

const importStudentsView = async (req, res, next) => {
  const header = await getHeaderData(req);

  res.render("admin/students-import", {
    title: "Import Students",
    header,
  });
};

module.exports = {
  studentsView,
  studentView,
  enrollStudentInCourse,
  dropStudentCourse,
  importStudentsView,
};
