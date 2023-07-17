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
    appDirectory: path.join('out', 'Fixate'),
    authors: 'Fixate Team',
    noMsi: true,
    outputDirectory: path.join('out', 'windows-installer'),
    exe: 'Fixate.exe',
    setupExe: `fixate-windows-installer-1.9.13.exe`,
    setupIcon: path.join('./src', 'assets', 'icon.ico')
  })
}