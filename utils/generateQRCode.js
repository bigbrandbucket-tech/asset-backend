const QRCode = require('qrcode');

async function generateQrCode(assetId) {
  const qrUrl = `https://meplogistix.vercel.app/scan?id=${assetId}`;
  const qrCodeDataUrl = await QRCode.toDataURL(qrUrl); 
  return qrCodeDataUrl;
}

module.exports = generateQrCode;
