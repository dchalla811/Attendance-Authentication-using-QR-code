const prisma = require("../prisma");
const { roles, users, subjects } = require("./data");

const createRoles = async () => {
  const noOfRoles = await prisma.role.count();
  if (noOfRoles == 0) {
    roles.forEach(async (role) => {
      await prisma.role.create({
        data: role,
      });
    });
  }
};

const createSubjects = async () => {
  const noOfSubjects = await prisma.subject.count();
  if (noOfSubjects == 0) {
    subjects.forEach(async (subject) => {
      await prisma.subject.create({
        data: subject,
      });
    });
  }
};

const createUsers = async () => {
  const noOfUsers = await prisma.user.count();
  if (noOfUsers == 0) {
    users.forEach(async (data) => {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data,
          include: {
            student: true,
            instructor: true,
          },
        });
      });
    });
  }
};

const main = async () => {
  // Create roles.
  await createRoles();

  // Create subjects.
  await createSubjects();

  // Create users.
  await createUsers();
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
