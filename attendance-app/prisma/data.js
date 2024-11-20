const { Semester } = require("@prisma/client");

const getTime = (hours, minutes) => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

const roles = [
  {
    id: 1,
    name: "Admin",
  },
  {
    id: 2,
    name: "Instrutor",
  },
  {
    id: 3,
    name: "Student",
  },
];

const users = [
  {
    id: 1,
    fullName: "Super Admin",
    email: "admin@att.app",
    password: "123456",
    roleId: 1,
  },
];

const subjects = [];

module.exports = {
  roles,
  users,
  subjects,
};
