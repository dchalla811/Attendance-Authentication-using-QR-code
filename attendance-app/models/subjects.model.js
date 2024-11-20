const prisma = require("../prisma");

const getSubjectsCount = async () => {
  return await prisma.subject.count();
};

const getAllSubjects = async () => {
  return await prisma.subject.findMany();
};

const createSubject = async ({ name, code, creditHours }) => {
  return await prisma.subject.create({
    data: {
      name,
      code,
      creditHours: parseInt(creditHours),
    },
  });
};

const updateSubject = async ({ id, name, code, creditHours }) => {
  return await prisma.subject.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      code,
      creditHours: parseInt(creditHours),
    },
  });
};

const getSubject = async (id) => {
  return await prisma.subject.findUnique({
    where: {
      id,
    },
  });
};

const deleteSubjectById = async (id) => {
  return await prisma.subject.delete({
    where: {
      id: parseInt(id),
    },
  });
};

module.exports = {
  getSubjectsCount,
  getAllSubjects,
  createSubject,
  updateSubject,
  getSubject,
  deleteSubjectById,
};
