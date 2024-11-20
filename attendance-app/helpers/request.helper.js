const {
  getInstructorById,
  getInstructorByUserId,
} = require("../models/instructor.model");
const { getRoleName } = require("../models/role.model");

const getHeaderData = async (req) => {
  const { id, fullName, roleId } = req.user;
  const role = await getRoleName(roleId);
  if (roleId === 2) {
    const instructor = await getInstructorByUserId(id);
    if (instructor) {
      return {
        fullName,
        roleId,
        role,
        id: instructor.id,
        instructorId: instructor.instructorId,
      };
    }
  }

  return {
    fullName,
    roleId,
    role,
  };
};

module.exports = {
  getHeaderData,
};
