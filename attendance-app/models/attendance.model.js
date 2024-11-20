const { AttendanceStatus } = require("@prisma/client");
const prisma = require("../prisma");
const {
  convertTimeTo12Hours,
  extractTime,
  extractDate,
} = require("../helpers/common.helper");

const markAttendance = async (courseId, studentId, courseClassId, status) => {
  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      courseId,
      studentId,
      courseClassId,
    },
  });

  if (existingAttendance && existingAttendance.status !== status) {
    return await prisma.attendance.update({
      where: {
        id: existingAttendance.id,
      },
      data: {
        time: new Date(),
        status,
      },
    });
  }

  return null;
};

const markAbsentStudents = async (courseId, courseClassId) => {
  const now = new Date();
  const students = await prisma.studentCourse.findMany({
    where: {
      courseId,
    },
  });

  const data = [];

  students.map((student) => {
    data.push({
      courseId,
      studentId: student.studentId,
      courseClassId,
      time: now,
      status: AttendanceStatus.ABSENT,
    });
  });

  await prisma.attendance.createMany({
    data,
  });
};

const getStudentAttendanceByCourse = async (studentId, courseId) => {
  return await prisma.attendance.findMany({
    where: {
      courseId: parseInt(courseId),
      studentId,
    },
    select: {
      id: true,
      status: true,
      time: true,
      courseClass: {
        select: {
          startedAt: true,
        },
      },
    },
  });
};

const getAttendanceByCourse = async (courseId, date) => {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const attendance = await prisma.attendance.findMany({
    where: {
      AND: {
        courseId: parseInt(courseId),
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    },
    include: {
      student: {
        include: {
          user: true,
        },
      },
      courseClass: true,
    },
  });

  const data = [];

  attendance.map((item) => {
    item.date = extractDate(item.courseClass.startedAt);
    item.time = convertTimeTo12Hours(extractTime(item.time));
    data.push(item);
  });

  return data;
};

const getAttendanceById = async (id) => {
  return await prisma.attendance.findUnique({
    where: {
      id: parseInt(id),
    },
  });
};

const updateAttendance = async (data) => {
  return await prisma.attendance.update({
    where: {
      id: parseInt(data.id),
    },
    data: {
      status: data.status,
    },
  });
};

module.exports = {
  markAttendance,
  markAbsentStudents,
  getAttendanceByCourse,
  getStudentAttendanceByCourse,
  getAttendanceById,
  updateAttendance,
};
