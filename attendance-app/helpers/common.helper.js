const moment = require("moment");

const generateId = (roleId, id) => {
  const prefix = roleId === 2 ? "INS" : "STU";
  const year = new Date().getYear();
  const padding = roleId === 2 ? 3 : 5;
  const paddedId = id.toString().padStart(padding, "0");
  return `${prefix}${year}${paddedId}`;
};

const generatePin = () => {
  const finstDigit = Math.floor(Math.random() * 9) + 1;
  const otherDigits = Math.floor(1000 + Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `${finstDigit.toString()}${otherDigits}`;
};

const isValidDateTime = (dateTime) => {
  if (!dateTime) {
    return false;
  }

  return moment(dateTime).isValid();
};

const convertTimeTo12Hours = (time) => {
  return moment(time, "HH:mm:ss").format("hh:mm A");
};

const formatDateTime = (dateTime, format) => {
  const fmt = format || "YYYY-MM-DD HH:mm:ss";
  return moment(dateTime).format(fmt);
};

const extractDate = (date) => {
  return date.toISOString().split("T")[0];
};

const extractTime = (time) => {
  return time.toTimeString().split(" ")[0];
};

const dateToISOString = (date) => {
  return new Date(date).toISOString();
};

const getTime = (time) => {
  const split = time.split(":");
  const date = new Date();
  date.setHours(parseInt(split[0]), parseInt(split[1]), 0);
  return date.toISOString();
};

module.exports = {
  generateId,
  generatePin,
  isValidDateTime,
  convertTimeTo12Hours,
  formatDateTime,
  extractDate,
  extractTime,
  dateToISOString,
  getTime,
};
