const { Semester } = require("@prisma/client");
const prisma = require("../prisma");
const {
  convertTimeTo12Hours,
  extractDate,
  extractTime,
  dateToISOString,
  generatePin,
  getTime,
} = require("../helpers/common.helper");
const { and } = require("ajv/dist/compile/codegen");
const { markAbsentStudents } = require("./attendance.model");

const getCoursesCount = async () => {
  return await prisma.course.count();
};

const getAllCourses = async () => {
  const courses = await prisma.course.findMany({
    where: {
      isCompleted: false,
    },
    include: {
      subject: true,
      instructor: {
        include: {
          user: true,
        },
      },
    },
  });

  const list = [];
  for (const course of courses) {
    course.classStartTime = extractTime(course.classStartTime);
    course.classEndTime = extractTime(course.classEndTime);

    course.classStartTime = convertTimeTo12Hours(course.classStartTime);
    course.classEndTime = convertTimeTo12Hours(course.classEndTime);

    list.push(course);
  }

  return list;
};

const getCourse = async (id) => {
  const course = await prisma.course.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      subject: true,
      instructor: {
        include: {
          user: true,
        },
      },
    },
  });

  if (course) {
    course.classStartTime = extractTime(course.classStartTime);
    course.classEndTime = extractTime(course.classEndTime);
  }

  return course;
};

const createOrUpdateCourse = async (data) => {
  const subjectId = parseInt(data.subjectId);
  const instructorId = parseInt(data.instructorId);
  const semester = data.semester;
  const year = parseInt(data.year);

  const startTime = new Date();
  startTime.setHours(data.classStartTime.split(":")[0]);
  startTime.setMinutes(data.classStartTime.split(":")[1]);
  startTime.setSeconds(0);
  startTime.setMilliseconds(0);

  const endTime = new Date();
  endTime.setHours(data.classEndTime.split(":")[0]);
  endTime.setMinutes(data.classEndTime.split(":")[1]);
  endTime.setSeconds(0);
  endTime.setMilliseconds(0);

  const classStartTime = startTime.toISOString();
  const classEndTime = endTime.toISOString();

  return await prisma.course.upsert({
    where: {
      id: parseInt(data.id || 0),
    },
    update: {
      subjectId,
      instructorId,
      semester,
      year,
      classStartTime,
      classEndTime,
    },
    create: {
      subjectId,
      instructorId,
      semester,
      year,
      classStartTime,
      classEndTime,
    },
  });
};

const createCourses = async (data) => {
  const subjects = [];
  data.forEach((element) => {
    subjects.push({
      subject: {
        name: element["Course Name"].trim(),
        code: element["Course CRN"].trim(),
        creditHours: parseInt(element["Course Credit Hours"].trim()),
      },
      course: {
        semester: element["Semester"].trim(),
        year: parseInt(element["Year"].trim()),
        classStartTime: getTime(element["Start Time"].trim()),
        classEndTime: getTime(element["End Time"].trim()),
      },
    });
  });

  return await prisma.$transaction(async (tx) => {
    for (const subject of subjects) {
      let existing = await tx.subject.findFirst({
        where: {
          code: subject.subject.code,
        },
      });

      if (!existing) {
        existing = await tx.subject.create({
          data: {
            name: subject.subject.name,
            code: subject.subject.code,
            creditHours: subject.subject.creditHours,
          },
        });
      }

      await tx.course.create({
        data: {
          subjectId: existing.id,
          semester: subject.course.semester,
          year: subject.course.year,
          classStartTime: subject.course.classStartTime,
          classEndTime: subject.course.classEndTime,
        },
      });
    }
  });
};

const enrollStudent = async (data) => {
  return await prisma.studentCourse.create({
    data: {
      studentId: parseInt(data.studentId),
      courseId: parseInt(data.courseId),
    },
  });
};

const assignInstructor = async (data) => {
  return await prisma.instructorCourse.create({
    data: {
      instructorId: data.instructorId,
      courseId: parseInt(data.courseId),
    },
  });
};

const getCourseByInstructor = async (instructorId, courseId) => {
  const course = await prisma.course.findUnique({
    where: {
      id: parseInt(courseId),
      instructorId,
    },
    include: {
      subject: true,
      instructor: {
        include: {
          user: true,
        },
      },
    },
  });

  if (course) {
    course.classStartTime = extractTime(course.classStartTime);
    course.classEndTime = extractTime(course.classEndTime);
  }

  return course;
};

const getStudentCourses = async (id) => {
  return await prisma.studentCourse.findMany({
    where: {
      studentId: id,
      course: {
        isCompleted: false,
      },
    },
    select: {
      studentId: true,
      course: {
        select: {
          id: true,
          semester: true,
          year: true,
          classStartTime: true,
          classEndTime: true,
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          instructor: {
            select: {
              id: true,
              user: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

const deleteCourseById = async (id) => {
  return await prisma.course.delete({
    where: {
      id: parseInt(id),
    },
  });
};

const markCourseCompleted = async (id) => {
  return await prisma.course.update({
    where: {
      id: parseInt(id),
    },
    data: {
      isCompleted: true,
    },
  });
};

const createClass = async (instructorId, courseId) => {
  const courseClass = await prisma.courseClass.findFirst({
    where: {
      courseId: courseId,
      createdBy: instructorId,
      endedAt: null,
    },
  });

  if (courseClass) {
    return courseClass;
  }

  try {
    const date = new Date();
    const result = await prisma.courseClass.create({
      data: {
        courseId,
        createdBy: instructorId,
        code: generatePin(),
      },
    });

    await markAbsentStudents(courseId, result.id);

    return result;
  } catch (error) {
    console.error(error);
  }

  return null;
};

const endClass = async (instructorId, classId) => {
  return await prisma.courseClass.update({
    where: {
      id: parseInt(classId),
      createdBy: instructorId,
    },
    data: {
      endedAt: new Date(),
    },
  });
};

const getCourseClass = async (instructorId, classId) => {
  return await prisma.courseClass.update({
    where: {
      id: parseInt(classId),
      createdBy: instructorId,
    },
    data: {
      code: generatePin(),
    },
    include: {
      course: {
        include: {
          subject: true,
        },
      },
    },
  });
};

const getCourseClassByCode = async (code) => {
  const parts = code.split(",");

  if (parts.length != 2) {
    return null;
  }

  return await prisma.courseClass.findFirst({
    where: {
      AND: {
        code: parts[0],
        uuid: parts[1],
      },
    },
  });
};

const isStudentEnrolledInCourse = async (studentId, courseId) => {
  const studentCourse = await prisma.studentCourse.findFirst({
    where: {
      AND: {
        studentId,
        courseId,
      },
    },
  });
  return studentCourse ? true : false;
};

const isInstructorAssignedToCourse = async (instructorId, courseId) => {
  const course = await prisma.course.findFirst({
    where: {
      AND: {
        instructorId,
        id: parseInt(courseId),
      },
    },
  });
  return course ? true : false;
};

const getSemesters = async () => {
  return [Semester.FALL, Semester.SPRING, Semester.SUMMER];
};

const getYears = async () => {
  const year = parseInt(new Date().getFullYear());
  return [year, year + 1, year + 2];
};

module.exports = {
  getCoursesCount,
  getAllCourses,
  getCourse,
  createOrUpdateCourse,
  createCourses,
  enrollStudent,
  assignInstructor,
  getCourseByInstructor,
  getStudentCourses,
  deleteCourseById,
  markCourseCompleted,
  createClass,
  endClass,
  getCourseClass,
  getCourseClassByCode,
  isStudentEnrolledInCourse,
  isInstructorAssignedToCourse,
  getSemesters,
  getYears,
};
