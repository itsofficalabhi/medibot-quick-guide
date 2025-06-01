
const { ZegoExpressEngine } = require('zego-express-engine-webrtc');

const zegoConfig = {
  appID: parseInt(process.env.ZEGO_APP_ID),
  serverSecret: process.env.ZEGO_SERVER_SECRET,
};

const initializeZego = () => {
  try {
    const zg = new ZegoExpressEngine(zegoConfig.appID, zegoConfig.serverSecret);
    console.log('ZegoCloud initialized successfully');
    return zg;
  } catch (error) {
    console.error('Failed to initialize ZegoCloud:', error);
    throw error;
  }
};

module.exports = { initializeZego };
