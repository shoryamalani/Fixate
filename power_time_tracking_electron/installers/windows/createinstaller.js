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
  const outPath = path.join('out')
  
  console.log(path.join(outPath, 'Fixate-win32-x64'))

  return Promise.resolve({
    appDirectory: path.join('out', 'Fixate-win32-x64'),
    authors: 'Fixate Team',
    noMsi: true,
    outputDirectory: path.join('out', 'windows-installer'),
    exe: 'Fixate-win32-x64.exe',
    setupExe: `fixate-windows-installer-0.9.11.exe`,
    setupIcon: path.join('./src', 'assets', 'icon.ico')
  })
}