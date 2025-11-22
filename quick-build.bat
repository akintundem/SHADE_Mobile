@echo off
echo =======================================
echo Quick Build and Install Production Mode
echo =======================================
echo.

echo Step 1: Stopping Metro (if running)...
taskkill /F /IM node.exe 2>nul

echo Step 2: Creating production bundle...
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

echo.
echo Step 3: Connecting to device...
adb connect 192.168.1.243:5555

echo Step 4: Building and installing app...
npx react-native run-android

echo.
echo ✅ App installed! Your changes are now live on your device.
echo To make more changes, just run this script again.
pause