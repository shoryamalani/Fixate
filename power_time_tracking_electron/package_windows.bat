:: Can't run this file directly, you have to copy the commands and paste them into the terminal
:: Run from react_app folder
npm install --force
npm run build
cd ..\power_time_tracking_electron\
npm install --force
npm run package-win
npm run create-installer-win
npm run make