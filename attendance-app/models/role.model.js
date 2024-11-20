const prisma = require("../prisma");

const getRoleName = async (roleId) => {
  const role = await prisma.role.findUnique({
    where: {
      id: roleId,
    },
  });
  return role.name;
};

const getAllRoles = async () => {
  return await prisma.role.findMany({
    where: {
      id: {
        not: 1,
      },
    },
  });
};

module.exports = {
  getRoleName,
  getAllRoles,
};
