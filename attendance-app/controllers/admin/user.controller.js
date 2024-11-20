const createError = require("http-errors");
const { Ajv } = require("ajv");
const { getHeaderData } = require("../../helpers/request.helper");
const { getAllRoles } = require("../../models/role.model");
const {
  getAllUsers,
  createUser,
  getById,
  updateUser,
  deleteUserById,
  createInstructors,
  createStudents,
} = require("../../models/user.model");
const { parseCSV } = require("../../helpers/csv.helper");
const { create } = require("qrcode");

const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);

const schema = {
  type: "object",
  properties: {
    id: {
      type: "string",
      pattern: "^[1-9]\\d*$",
      errorMessage: "User id is required.",
    },
    fullName: {
      type: "string",
      minLength: 6,
      errorMessage: "Full name is required.",
    },
    email: {
      type: "string",
      minLength: 5,
      errorMessage: "Email is required.",
    },
    password: {
      type: "string",
      minLength: 6,
      errorMessage: "Password is required.",
    },
    roleId: {
      type: "string",
      pattern: "^[1-9]\\d*$",
      errorMessage: "User role is required.",
    },
  },
  required: ["fullName", "email", "password", "roleId"],
  additionalProperties: false,
};

const usersView = async (req, res, next) => {
  if (req.params.id) {
    const user = await getById(parseInt(req.params.id));
    if (!user) {
      return next(createError(404, "User not found."));
    }

    const header = await getHeaderData(req);
    return res.render("admin/view-user", {
      title: user.fullName,
      header,
      data: { user },
    });
  }

  return next(createError(400, "Bad Request."));
};

const addUser = async (req, res, next) => {
  const header = await getHeaderData(req);

  if (req.method === "GET") {
    const roleId = req.params.role && req.params.role === "instructor" ? 2 : 3;

    return res.render("admin/user-form", {
      title: roleId === 2 ? "Add Instructor" : "Add Student",
      header,
      defaults: { roleId },
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
      const newUser = await createUser(req.body);
      if (newUser) {
        return res.redirect(
          newUser.roleId === 2 ? "/admin/instructors" : "/admin/students"
        );
      }
      errors.push("User already exists.");
    } catch (error) {
      console.log(error);
      errors.push("An error occured while creating user.");
    }
  }

  res.render("admin/user-form", {
    title: "Add User",
    header,
    defaults: req.body,
    errors,
  });
};

const editUser = async (req, res, next) => {
  const header = await getHeaderData(req);

  if (req.method === "GET" && req.params.id) {
    const { id, fullName, email, roleId } = await getById(
      parseInt(req.params.id)
    );

    return res.render("admin/user-form", {
      title: "Add User",
      header,
      defaults: { id, fullName, email, roleId },
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
      const newUser = await updateUser(req.body);
      if (newUser) {
        return res.redirect(
          newUser.roleId === 2 ? "/admin/instructors" : "/admin/students"
        );
      }
      errors.push("Unable to update user.");
    } catch (error) {
      console.log(error);
      errors.push("An error occured while updating user.");
    }
  }

  res.render("admin/user-form", {
    title: "Add User",
    header,
    defaults: req.body,
    errors,
  });
};

const deleteUser = async (req, res, next) => {
  if (!req.body.id) {
    return next(createError(400, "Bad Request."));
  }

  const user = await getById(parseInt(req.body.id));
  if (!user) {
    return next(createError(404, "User not found."));
  }

  await deleteUserById(user.id);

  return user.roleId === 2
    ? res.redirect("/admin/instructors")
    : res.redirect("/admin/students");
};

const importInstructors = async (req, res, next) => {
  console.log(req.file);

  if (!req.file) {
    return res
      .status(400)
      .json({ message: "An error occured while uploading file." });
  }

  try {
    const instructors = await parseCSV(req.file);
    await createInstructors(instructors);
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ message: "An error occured while processing file." });
  }

  return res.json({ file: req.file, message: "File uploaded successfully." });
};

const importStudents = async (req, res, next) => {
  console.log(req.file);

  if (!req.file) {
    return res
      .status(400)
      .json({ message: "An error occured while uploading file." });
  }

  try {
    const students = await parseCSV(req.file);
    await createStudents(students);
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ message: "An error occured while processing file." });
  }

  return res.json({ file: req.file, message: "File uploaded successfully." });
};

module.exports = {
  usersView,
  addUser,
  editUser,
  deleteUser,
  importInstructors,
  importStudents,
};
