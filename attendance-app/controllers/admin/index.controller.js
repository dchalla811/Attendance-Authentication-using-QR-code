const { getHeaderData } = require("../../helpers/request.helper");
const { getCoursesCount } = require("../../models/course.model");
const { getInstructorsCount } = require("../../models/instructor.model");
const { getStudentsCount } = require("../../models/student.model");
const { getSubjectsCount } = require("../../models/subjects.model");

const index = async (req, res, next) => {
  const header = await getHeaderData(req);
  const subjects = await getSubjectsCount();
  const courses = await getCoursesCount();
  const instructors = await getInstructorsCount();
  const students = await getStudentsCount();

  res.render("admin/index", {
    title: "Dashboard",
    header,
    data: { subjects, courses, students, instructors },
  });
};

module.exports = {
  index,
};
