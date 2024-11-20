const prisma = require("../prisma");

const getStudentsCount = async () => {
  return await prisma.student.count();
};

const getAllStudents = async () => {
  return await prisma.student.findMany({
    include: {
      user: true,
    },
  });
};

const getStudentById = async (id) => {
  return await prisma.student.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      user: true,
      courses: {
        include: {
          course: {
            include: {
              subject: true,
              instructor: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

const getStudentsByCourse = async (courseId) => {
  return await prisma.student.findMany({
    where: {
      courses: {
        some: {
          courseId,
        },
      },
    },
    include: {
      user: true,
    },
  });
};

const dropCourse = async (studentId, courseId) => {
  await prisma.studentCourse.delete({
    where: {
      studentId_courseId: {
        studentId: parseInt(studentId),
        courseId: parseInt(courseId),
      },
    },
  });

  await prisma.attendance.deleteMany({
    where: {
      studentId: parseInt(studentId),
      courseId: parseInt(courseId),
    },
  });
};

module.exports = {
  getStudentsCount,
  getAllStudents,
  getStudentById,
  getStudentsByCourse,
  dropCourse,
};
