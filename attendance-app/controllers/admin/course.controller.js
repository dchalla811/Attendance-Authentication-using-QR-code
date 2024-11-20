const createError = require("http-errors");
const { Ajv } = require("ajv");
const { getHeaderData } = require("../../helpers/request.helper");
const {
  getAllCourses,
  getCourse,
  createOrUpdateCourse,
  getSemesters,
  getYears,
  deleteCourseById,
  createCourses,
  markCourseCompleted,
} = require("../../models/course.model");
const { getAllSubjects } = require("../../models/subjects.model");
const e = require("express");
const { convertTimeTo12Hours } = require("../../helpers/common.helper");
const { getAllInstructors } = require("../../models/instructor.model");
const { getStudentsByCourse } = require("../../models/student.model");
const { parseCSV } = require("../../helpers/csv.helper");

const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);

const schema = {
  type: "object",
  properties: {
    id: {
      type: "string",
      pattern: "^[1-9]\\d*$",
      errorMessage: "Course id is required.",
    },
    subjectId: {
      type: "string",
      pattern: "^[1-9]\\d*$",
      errorMessage: "Subject is required.",
    },
    instructorId: {
      type: "string",
      errorMessage: "Instructor is required.",
    },
    semester: {
      type: "string",
      enum: ["FALL", "SPRING", "SUMMER"],
      errorMessage: "Semester is required.",
    },
    year: {
      type: "string",
      pattern: "^[0-9]{4}$",
      errorMessage: "Year is required.",
    },
    classStartTime: {
      type: "string",
      pattern: "^\\d{2}:\\d{2}(:\\d{2})?$",
      errorMessage: "Class start time is required.",
    },
    classEndTime: {
      type: "string",
      pattern: "^\\d{2}:\\d{2}(:\\d{2})?$",
      errorMessage: "Class end time is required.",
    },
  },
  required: [
    "subjectId",
    "instructorId",
    "semester",
    "year",
    "classStartTime",
    "classEndTime",
  ],
  additionalProperties: false,
};

const coursesView = async (req, res, next) => {
  const header = await getHeaderData(req);
  const courses = await getAllCourses();

  res.render("admin/courses", {
    title: "Courses",
    header,
    data: {
      courses,
    },
  });
};

const courseView = async (req, res, next) => {
  const header = await getHeaderData(req);
  const course = await getCourse(req.params.id);

  if (!course) {
    return next(createError(404, "Course not found."));
  }

  const students = await getStudentsByCourse(course.id);

  course.classStartTime = convertTimeTo12Hours(course.classStartTime);
  course.classEndTime = convertTimeTo12Hours(course.classEndTime);

  return res.render("admin/course", {
    title: course.subject.name,
    header,
    data: { course, students },
  });
};

const addCourse = async (req, res, next) => {
  const header = await getHeaderData(req);
  const subjects = await getAllSubjects();
  const semesters = await getSemesters();
  const years = await getYears();
  const instructors = await getAllInstructors();

  if (req.method === "GET") {
    return res.render("admin/course-form", {
      title: "Add Course",
      header,
      data: { subjects, semesters, years, instructors },
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
      const course = await createOrUpdateCourse(req.body);
      if (course) {
        return res.redirect("/admin/courses");
      }
      errors.push("Course already exists.");
    } catch (error) {
      console.error(error);
      errors.push("An error occured while creating course.");
    }
  }

  res.render("admin/course-form", {
    title: "Add Course",
    header,
    data: { subjects, semesters, years, instructors },
    defaults: {
      ...req.body,
      subjectId: parseInt(req.body.subjectId),
      instructorId: parseInt(req.body.instructorId),
    },
    errors,
  });
};

const editCourse = async (req, res, next) => {
  const header = await getHeaderData(req);
  const subjects = await getAllSubjects();
  const semesters = await getSemesters();
  const years = await getYears();
  const instructors = await getAllInstructors();

  if (req.method === "GET" && req.params.id) {
    const course = await getCourse(req.params.id);

    return res.render("admin/course-form", {
      title: "Edit Course",
      header,
      data: { subjects, semesters, years, instructors },
      defaults: { ...course },
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
      const course = await createOrUpdateCourse(req.body);
      if (course) {
        return res.redirect("/admin/courses");
      }
      errors.push("Course already exists.");
    } catch (error) {
      console.error(error);
      errors.push("An error occured while creating course.");
    }
  }

  res.render("admin/course-form", {
    title: "Edit Course",
    header,
    data: { subjects, semesters, years, instructors },
    defaults: {
      ...req.body,
      subjectId: parseInt(req.body.subjectId),
      instructorId: parseInt(req.body.instructorId),
    },
    errors,
  });
};

const deleteCourse = async (req, res, next) => {
  if (!req.body.id) {
    return next(createError(400, "Course Id is required."));
  }

  try {
    await deleteCourseById(req.body.id);
  } catch (error) {
    console.error(error);
  }

  res.redirect("/admin/courses");
};

const markComplete = async (req, res, next) => {
  if (!req.body.id) {
    return next(createError(400, "Course Id is required."));
  }

  try {
    await markCourseCompleted(req.body.id);
  } catch (error) {
    console.error(error);
  }

  res.redirect("/admin/courses");
};

const importCoursesView = async (req, res, next) => {
  const header = await getHeaderData(req);

  res.render("admin/courses-import", {
    title: "Import Courses",
    header,
  });
};

const importCourses = async (req, res, next) => {
  console.log(req.file);

  if (!req.file) {
    return res
      .status(400)
      .json({ message: "An error occured while uploading file." });
  }

  try {
    const courses = await parseCSV(req.file);
    await createCourses(courses);
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ message: "An error occured while processing file." });
  }

  res.status(200).json({ message: "Courses imported successfully." });
};

module.exports = {
  coursesView,
  courseView,
  addCourse,
  editCourse,
  deleteCourse,
  importCoursesView,
  importCourses,
  markComplete,
};
