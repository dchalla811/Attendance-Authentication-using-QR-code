const prisma = require("../prisma");
const { generateId } = require("../helpers/common.helper");
const { parse } = require("dotenv");
const getByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
};

const getById = async (id) => {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  });
};

const getStudentByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: {
      email: email,
      roleId: 3,
    },
    include: {
      student: true,
    },
  });
};

const getStudentById = async (id) => {
  return await prisma.user.findUnique({
    where: {
      id,
      roleId: 3,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      roleId: true,
      student: {
        select: {
          id: true,
          studentId: true,
        },
      },
    },
  });
};

const createUser = async (data) => {
  if (await getByEmail(data.email)) {
    return null;
  }

  await prisma.$transaction(async (tx) => {
    const userData =
      data.roleId == 2
        ? {
            ...data,
            roleId: parseInt(data.roleId),
            instructor: {
              create: {},
            },
          }
        : {
            ...data,
            roleId: parseInt(data.roleId),
            student: {
              create: {},
            },
          };

    const user = await tx.user.create({
      data: userData,
      include: {
        student: true,
        instructor: true,
      },
    });

    switch (user.roleId) {
      case 2:
        await tx.instructor.update({
          where: {
            userId: user.id,
          },
          data: {
            instructorId: user.instructor[0].id.toString(),
          },
        });
        break;
      case 3:
        await tx.student.update({
          where: {
            userId: user.id,
          },
          data: {
            studentId: user.student[0].id.toString(),
          },
        });
        break;
    }
  });

  return await getByEmail(data.email);
};

const updateUser = async ({ id, fullName, email, password, roleId }) => {
  return await prisma.user.update({
    where: {
      id: parseInt(id),
    },
    data: {
      fullName,
      email,
      password,
      roleId: parseInt(roleId),
    },
  });
};

const deleteUserById = async (id) => {
  return await prisma.user.delete({
    where: {
      id,
    },
  });
};

const createInstructors = async (instructors) => {
  const users = [];
  instructors.forEach(async (instructor) => {
    users.push({
      fullName: `${instructor["Instructor FirstName"]} ${instructor["Instructor LastName"]}`,
      email: `ins${instructor["InstructorID"]}@att.app`,
      password: `123456`,
      roleId: 2,
      instructor: {
        create: {
          instructorId: instructor["InstructorID"],
        },
      },
    });
  });

  await prisma.$transaction(async (tx) => {
    for (const user of users) {
      await tx.user.create({
        data: user,
      });
    }
  });
};

const createStudents = async (students) => {
  const users = [];

  students.forEach(async (student) => {
    users.push({
      fullName: `${student["Student FirstName"]} ${student["Student LastName"]}`,
      email: `stu${student["StudentID"]}@att.app`,
      password: "123456",
      roleId: 3,
      student: {
        create: {
          studentId: student["StudentID"],
          courses: {
            create: [
              {
                courseId: parseInt(student["CourseID"]),
              },
            ],
          },
        },
      },
    });
  });
  return await prisma.$transaction(async (tx) => {
    for (const user of users) {
      await tx.user.create({
        data: user,
      });
    }
  });
};

module.exports = {
  getByEmail,
  getById,
  getStudentByEmail,
  getStudentById,
  createUser,
  updateUser,
  deleteUserById,
  createInstructors,
  createStudents,
};
