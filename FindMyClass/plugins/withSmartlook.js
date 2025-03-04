const withSmartlook = (config) => {
    if (!config.ios) config.ios = {};
    if (!config.android) config.android = {};
  
    // Setup for iOS
    if (!config.ios.infoPlist) config.ios.infoPlist = {};
    config.ios.infoPlist.NSCameraUsageDescription = 
      'Smartlook uses the camera to record screen for app analytics.';
    config.ios.infoPlist.NSMicrophoneUsageDescription = 
      'Smartlook uses the microphone to record screen for app analytics.';
  
    return config;
  };
  
  module.exports = withSmartlook;