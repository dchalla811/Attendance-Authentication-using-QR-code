const createError = require("http-errors");
const { getHeaderData } = require("../../helpers/request.helper");
const {
  getAllInstructors,
  getInstructorById,
} = require("../../models/instructor.model");

const instructorsView = async (req, res, next) => {
  const header = await getHeaderData(req);
  const instructors = await getAllInstructors();

  res.render("admin/instructors", {
    title: "Instructors",
    header,
    data: { instructors },
  });
};

const instructorView = async (req, res, next) => {
  const header = await getHeaderData(req);
  const instructor = await getInstructorById(req.params.id);

  if (!instructor) {
    return next(createError(404, "Instructor not found."));
  }

  res.render("admin/instructor", {
    title: instructor.user.fullName,
    header,
    data: { instructor },
  });
};

const importInstructorsView = async (req, res, next) => {
  const header = await getHeaderData(req);

  res.render("admin/instructors-import", {
    title: "Import Instructors",
    header,
  });
};

module.exports = {
  instructorsView,
  instructorView,
  importInstructorsView,
};
