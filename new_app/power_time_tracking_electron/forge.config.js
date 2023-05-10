require('dotenv').config();
const path = require('path');
const fs = require('fs');

var archName = process.env.ARCH;
console.log(archName);
module.exports = {
  packagerConfig: {
    icon: "./src/assets/icon.ico",
    
    overwrite: true,
    extendInfo: {
      NSAppleScriptEnabled: true,
      NSAppleEventsUsageDescription: "Applescript is needed to get tab urls of websites."
    },
    osxSign: {
      "identity": "Developer ID Application: Clearpoint Management LLC (6KK9M46VM2)",
      "hardenedRuntime": true,
      "gatekeeper-assess": false,
      "entitlements": "entitlements.plist",
      "entitlements-inherit": "entitlements.plist",
      "provisioningProfile": "powertimetrackingembed.provisionprofile",
      "signature-flags": "library",
      "embedded-binaries": [
        "./Resources/src/python/bin/python3.9",
        "./Resources/src/python/lib/python3.9/lib-dynload/xxlimited.cpython-39-darwin.so",
        "./Resources/src/python/lib/python3.9/lib-dynload/_testcapi.cpython-39-darwin.so"
      ]
    },
    osxNotarize: {
      "appleId": process.env.APPLEID,
      "appleIdPassword": process.env.APPLEIDPASS,
      "tool":"notarytool",
      // "appPath": `out/PowerTimeTracking-darwin-${archName}/PowerTimeTracking.app`,
      "appPath":"/Applications/PowerTimeTracking.app",
      "appBundleId": "com.electron.powertimetracking",
      "teamId": "6KK9M46VM2",
    }

  },
  makers: [{
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "PowerTimeTracking"
      }
    },
    // {
    //   name: "@electron-forge/maker-zip",
    //   // platforms: [
    //   //   "darwin","posix"
    //   // ]
    // },
    {
      name: "@electron-forge/maker-pkg",
      config: {
        "identity": "Developer ID Installer: Clearpoint Management LLC (6KK9M46VM2)",
        "identity-validation": true,
        "install-location": "/Applications",
        "scripts": "src/scripts",
        "identifier": "com.electron.powertimetracking",
        "isRelocatable": false,
      }
    },
    {
      name: "@electron-forge/maker-deb",
      config: {}
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {}
    }
  ],hooks: {
    packageAfterCopy: async (config, buildPath, electronVersion, platform, arch) => {
      var src = path.join(__dirname, '../react_app/build/');
      var dst = buildPath;
      fs.cpSync(src, dst, {recursive: true});
    }
  }
}