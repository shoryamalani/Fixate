require('dotenv').config();
const path = require('path');
const fs = require('fs');
const archName = process.arch === 'arm64' ? 'arm64' : 'x64';
// get the product path and name
const productName = require('./package.json').productName;
const productPath = path.join(__dirname, 'out', `${productName}-darwin-${archName}`, `${productName}.app`);

module.exports = {
  packagerConfig: {
    icon: "./src/assets/icon.ico",
    osxUniversal: { // config options for `@electron/universal`
      x64ArchFiles: '*' // replace with any relevant glob pattern
    },
    "ignore": [".out","requirements.txt","package_intel_and_arm"],
    "appBundleId": "com.fixate.macos",
    "extraResource": [
      "./src/python",
    ],
    
    overwrite: true,
    extendInfo: {
      NSAppleScriptEnabled: true,
      NSAppleEventsUsageDescription: "Applescript is needed to get tab urls of websites."
    },
    // osxSign: {}
    // osxSign: {
    //   "identity": "Developer ID Application: Clearpoint Management LLC (6KK9M46VM2)",
    //   "hardenedRuntime": true,
    //   "gatekeeper-assess": false,
    //   "entitlements": "entitlements.plist",
    //   "entitlements-inherit": "entitlements.plist",
    //   "provisioningProfile": "fixateapp.provisionprofile",
    //   // "signature-flags": "library",
    //   "binaries": [
    //     "./src/python/bin/python3.9",
    //     "./src/python/bin/python3",
    //     // "./Resources/src/python/lib/python3.9/lib-dynload/xxlimited.cpython-39-darwin.so",
    //     // "./Resources/src/python/lib/python3.9/lib-dynload/_testcapi.cpython-39-darwin.so"
    //     // "./Resources/src/python/bin/flask",
    //     // "./Resources/src/python/bin/gunicorn",
    //     // "./Resources/src/python/bin/dotenv",
    //     // "./Resources/src/python/bin/normalizer",
    //     // "./Resources/src/python/bin/pip",
    //     // "./Resources/src/python/bin/pip3",
    //   ]
    // },
    // osxNotarize: {
    //   "appleId": process.env.APPLEID,
    //   "appleIdPassword": process.env.APPLEIDPASS,
    //   "tool":"notarytool",
    //   // "appPath": `out/Fixate-darwin-arm64/Fixate.app`,
    //   // "appPath":"/Applications/Fixate.app",
    //   // 'appPath': productPath,
    //   // "appBundleId": "com.fixate.macos",
    //   "teamId": "6KK9M46VM2",
    // }

  },
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "shoryamalani",
          name: "Fixate",
        },
        authToken: process.env.GITHUB_TOKEN,
        prerelease: true,
        draft: true,
        tagPrefix: "v",
      }
    }
  ],
  makers: [{
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "Fixate"
      }
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: [
        "darwin"
      ],
    },
    // {
    //   name: "@electron-forge/maker-pkg",
    //   config: {
    //     "identity": "Developer ID Installer: Clearpoint Management LLC (6KK9M46VM2)",
    //     "identity-validation": true,
    //     "install-location": "/Applications",
    //     "scripts": "src/scripts",
    //     "identifier": "com.fixate.macos",
    //     "isRelocatable": false,
    //   }
    // },
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
    },
    // postPackage: require("./src/notarize.js"),
  }
}