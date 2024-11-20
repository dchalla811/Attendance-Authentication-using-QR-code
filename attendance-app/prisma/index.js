const { PrismaClient } = require("@prisma/client");
const { hashString } = require("../helpers/crypto.helper");

const getClient = () => {
  /*return new PrismaClient({
    log: [
      {
        emit: "event",
        level: "query",
      },
    ],
  });*/
  return new PrismaClient();
};

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = getClient();
} else {
  if (!global.prisma) {
    global.prisma = getClient();
  }
  prisma = global.prisma;
}

/*prisma.$on("query", (e) => {
  if (e.params.model !== "Session") {
    console.log("Query: " + e.query);
    console.log("Params: " + e.params);
    console.log("Duration: " + e.duration + "ms");
  }
});*/

prisma.$use(async (params, next) => {
  if (params.model === "User") {
    if (params.action === "create" || params.action === "update") {
      if (params.args.data.password) {
        params.args.data.password = await hashString(params.args.data.password);
      }
    }
  }

  return next(params);
});

module.exports = prisma;
