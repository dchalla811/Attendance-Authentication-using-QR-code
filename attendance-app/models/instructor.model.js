const {
  convertTimeTo12Hours,
  extractTime,
} = require("../helpers/common.helper");
const prisma = require("../prisma");

const getInstructorsCount = async () => {
  return await prisma.instructor.count();
};

const getAllInstructors = async () => {
  return await prisma.instructor.findMany({
    include: {
      user: true,
    },
  });
};

const getInstructorByUserId = async (userId) => {
  return await prisma.instructor.findFirst({
    where: {
      userId: userId,
    },
  });
};

const getInstructorById = async (id) => {
  const instructor = await prisma.instructor.findUnique({
    where: {
      id: typeof id === "number" ? id : parseInt(id),
    },
    include: {
      user: true,
      courses: {
        include: {
          subject: true,
        },
      },
    },
  });

  if (instructor) {
    for (let course of instructor.courses) {
      course.classStartTime = convertTimeTo12Hours(
        extractTime(course.classStartTime)
      );
      course.classEndTime = convertTimeTo12Hours(
        extractTime(course.classEndTime)
      );
    }
  }

  return instructor;
};

module.exports = {
  getInstructorsCount,
  getAllInstructors,
  getInstructorByUserId,
  getInstructorById,
};
