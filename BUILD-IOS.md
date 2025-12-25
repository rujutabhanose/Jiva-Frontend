# Building iOS App with Styling

## Current Issue
There's a permission error preventing automatic build. Here's how to build manually:

## Option 1: Build in Xcode (Recommended)

1. **Open Xcode Project:**
   ```bash
   cd mobile
   open ios/jivaplants.xcodeproj
   ```

2. **Install CocoaPods Dependencies:**
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **In Xcode:**
   - Select a simulator (e.g., iPhone 15) from the device dropdown
   - Click the Play button (▶️) or press `Cmd + R`
   - Wait for the build to complete
   - The app will launch on the simulator with full styling

## Option 2: Fix Permissions and Rebuild

If you want to fix the permission issue:

1. **Fix node_modules permissions:**
   ```bash
   cd mobile
   sudo chmod -R u+r node_modules
   ```

2. **Remove incomplete iOS directory:**
   ```bash
   rm -rf ios
   ```

3. **Rebuild:**
   ```bash
   ./node_modules/.bin/expo run:ios
   ```

## Option 3: Use Expo Go (No Styling)

If you just want to test functionality (without NativeWind styles):

```bash
cd mobile
npm start
```

Then open Expo Go on your simulator and connect to the dev server.

**Note:** NativeWind v4 styles will NOT work in Expo Go - you need a development build.

## Quick Fix Script

Run this script to fix permissions and build:

```bash
cd mobile
./fix-permissions-and-build.sh
```

## What You'll See After Building

Once the app builds and launches, you should see:
- ✅ Cream/white backgrounds (#F7F4EC)
- ✅ Green buttons with proper styling
- ✅ Rounded cards with borders
- ✅ Proper spacing and padding
- ✅ Styled typography
- ✅ Green accent colors throughout

