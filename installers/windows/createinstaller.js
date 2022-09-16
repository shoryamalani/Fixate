const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
  .then(createWindowsInstaller)
  .catch((error) => {
    console.error(error.message || error)
    process.exit(1)
  })

function getInstallerConfig () {
  console.log('creating windows installer')
  const rootPath = path.join('./')
  const outPath = path.join(rootPath, 'out')

  return Promise.resolve({
    appDirectory: path.join(outPath, 'PowerTimeTracking-win32-x64/'),
    authors: 'Shorya Malani',
    noMsi: true,
    outputDirectory: path.join(outPath, 'windows-installer'),
    exe: 'PowerTimeTracking.exe',
    setupExe: `PowerTimeTrackingAppInstaller.exe`,
    setupIcon: path.join('./src', 'assets', 'icon.ico')
  })
}