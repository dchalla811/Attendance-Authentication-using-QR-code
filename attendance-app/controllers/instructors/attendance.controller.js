const { Ajv } = require("ajv");
const createError = require("http-errors");
const { AttendanceStatus } = require("@prisma/client");
const { isValidDateTime, extractDate } = require("../../helpers/common.helper");
const { getHeaderData } = require("../../helpers/request.helper");
const {
  getAttendanceByCourse,
  getAttendanceById,
  updateAttendance,
} = require("../../models/attendance.model");
const {
  isInstructorAssignedToCourse,
  getCourseByInstructor,
} = require("../../models/course.model");
const { default: def } = require("ajv/dist/vocabularies/discriminator");
const { error } = require("ajv/dist/vocabularies/applicator/dependencies");

const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);

const schema = {
  type: "object",
  properties: {
    status: {
      type: "string",
      errorMessage: "Status is required.",
    },
    id: {
      type: "string",
      pattern: "^[0-9]\\d*$",
      errorMessage: "Invalid attendance ID.",
    },
    date: {
      type: "string",
      errorMessage: "Date is required.",
    },
  },
  required: ["status", "id", "date"],
  additionalProperties: false,
};

const attendanceView = async (req, res, next) => {
  const header = await getHeaderData(req);

  if (!req.params.id) {
    return next(createError(404, "Course not found."));
  }

  const isCourseAssignedToInstructor = await isInstructorAssignedToCourse(
    header.id,
    req.params.id
  );

  if (!isCourseAssignedToInstructor) {
    return next(createError(401, "Unauthorized access."));
  }

  const date = isValidDateTime(req.query.date)
    ? new Date(req.query.date)
    : new Date();
  const course = await getCourseByInstructor(header.id, req.params.id);
  const attendance = await getAttendanceByCourse(req.params.id, date);

  res.render("instructor/attendance", {
    title: "Attendance",
    header,
    data: { attendance, course },
    defaults: { date: extractDate(date) },
  });
};

const attendanceForm = async (req, res, next) => {
  const header = await getHeaderData(req);

  if (req.method === "GET" && !req.params.id) {
    return next(createError(404, "Course not found."));
  }

  const attendanceId = req.params.id || req.body.id;
  const attendance = await getAttendanceById(attendanceId);

  if (!attendance) {
    return next(createError(404, "Attendance not found."));
  }

  const isCourseAssignedToInstructor = await isInstructorAssignedToCourse(
    header.id,
    attendance.courseId
  );

  if (!isCourseAssignedToInstructor) {
    return next(createError(401, "Unauthorized access."));
  }

  const errors = [];
  if (req.method === "POST") {
    const validate = ajv.compile(schema);
    const valid = validate(req.body);

    if (!valid) {
      validate.errors.map((error) => {
        errors.push(error.message);
      });
    }

    if (valid) {
      try {
        const result = await updateAttendance(req.body);
        if (result) {
          return res.redirect(
            `/instructor/courses/${attendance.courseId}/attendance?date=${req.body.date}`
          );
        }
        errors.push("Failed to update attendance.");
      } catch (error) {
        console.log(error);
        errors.push("Failed to update attendance.");
      }
    }
  }

  const statuses = [
    {
      value: AttendanceStatus.PRESENT,
      label: "Present",
    },
    {
      value: AttendanceStatus.ABSENT,
      label: "Absent",
    },
    {
      value: AttendanceStatus.LATE,
      label: "Late",
    },
  ];

  res.render("instructor/attendance-form", {
    title: "Attendance Form",
    header,
    data: {
      statuses,
    },
    defaults: {
      status: attendance.status,
      id: attendance.id,
      date: req.query.date,
    },
    errors,
  });
};

module.exports = {
  attendanceView,
  attendanceForm,
};
