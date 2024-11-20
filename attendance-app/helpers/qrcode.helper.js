const path = require("path");
const QRCode = require("qrcode");

const generateQRCode = async (uuid, code) => {
  const data = `${code},${uuid}`;
  console.info(data);
  return await QRCode.toDataURL(data, { errorCorrectionLevel: "H" });
};

module.exports = {
  generateQRCode,
};
