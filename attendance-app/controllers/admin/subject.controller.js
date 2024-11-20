const createError = require("http-errors");
const { Ajv } = require("ajv");
const { getHeaderData } = require("../../helpers/request.helper");
const {
  getAllSubjects,
  createSubject,
  updateSubject,
  getSubject,
  deleteSubjectById,
} = require("../../models/subjects.model");

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
    name: {
      type: "string",
      minLength: 2,
      errorMessage: "Course name is required.",
    },
    code: {
      type: "string",
      minLength: 5,
      errorMessage: "Course code is required.",
    },
    creditHours: {
      type: "string",
      pattern: "^[1-9]\\d*$",
      minimum: 1,
      errorMessage: "Credit hourse are required.",
    },
  },
  required: ["name", "code", "creditHours"],
  additionalProperties: false,
};

const subjectsView = async (req, res, next) => {
  const header = await getHeaderData(req);
  const courses = await getAllSubjects();

  res.render("admin/subjects", {
    title: "Subjects",
    header,
    data: { courses },
  });
};

const addSubject = async (req, res, next) => {
  const header = await getHeaderData(req);
  if (req.method === "GET") {
    return res.render("admin/subject-form", { title: "Add Subject", header });
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
      const course = await createSubject(req.body);
      if (course) {
        return res.redirect("/admin/subjects");
      }
      errors.push("Course already exists.");
    } catch (error) {
      errors.push("An error occured while creating course.");
    }
  }

  return res.render("admin/subject-form", {
    title: "Add Subject",
    header,
    defaults: req.body,
    errors,
  });
};

const editSubject = async (req, res, next) => {
  const header = await getHeaderData(req);
  if (req.method === "GET" && req.params.id) {
    const { id, name, code, creditHours } = await getSubject(
      parseInt(req.params.id)
    );

    return res.render("admin/subject-form", {
      title: "Edit Subject",
      header,
      defaults: { id, name, code, creditHours },
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
      const course = await updateSubject(req.body);
      if (course) {
        return res.redirect("/admin/subjects");
      }
      errors.push("Unable to update course.");
    } catch (error) {
      errors.push("An error occured while updating course.");
    }
  }

  return res.render("admin/subject-form", {
    title: "Edit Subject",
    header,
    defaults: req.body,
    errors,
  });
};

const deleteSubject = async (req, res, next) => {
  if (!req.body.id) {
    return next(createError(400, "Subject ID is required."));
  }

  try {
    await deleteSubjectById(req.body.id);
  } catch (error) {
    console.log(error);
  }

  res.redirect("/admin/subjects");
};

module.exports = {
  subjectsView,
  addSubject,
  editSubject,
  deleteSubject,
};
