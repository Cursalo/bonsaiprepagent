# 🚀 Bonsai SAT Assistant - Installation Guide

## 📦 **Step 1: Use the DMG Installer (NOT the app bundle)**

You were trying to open the app bundle directly, which won't work. Use the proper installer instead:

### ✅ **Correct Method:**

#### For Apple Silicon Macs (M1/M2/M3) - **RECOMMENDED**
```bash
open "/Users/gerardo/Downloads/Bonsai Main/bonsai-sat-tutor/desktop-app/dist/Bonsai SAT Assistant-1.0.0-arm64.dmg"
```

#### For Intel Macs
```bash
open "/Users/gerardo/Downloads/Bonsai Main/bonsai-sat-tutor/desktop-app/dist/Bonsai SAT Assistant-1.0.0.dmg"
```

### ❌ **Incorrect Method (What you tried):**
```bash
# DON'T DO THIS - This is the raw app bundle, not the installer
/Users/gerardo/Downloads/Bonsai Main/bonsai-sat-tutor/desktop-app/dist/mac-arm64/Electron.app
```

## 📋 **Step 2: Installation Process**

1. **Open the DMG file** (it should mount as a disk image)
2. **Drag "Bonsai SAT Assistant"** to the Applications folder
3. **Eject the DMG** after copying
4. **Launch from Applications** folder or Launchpad

## 🔧 **Step 3: First Launch**

### If you see a security warning:
```bash
# Right-click the app in Applications folder
# Select "Open" from context menu
# Click "Open" in the security dialog
```

### Alternative method:
```bash
# Remove quarantine attribute
sudo xattr -rd com.apple.quarantine "/Applications/Bonsai SAT Assistant.app"
```

## 📝 **Step 4: Check Logs for Debugging**

I've added comprehensive logging to help debug any issues:

### Log Locations:
```
~/Library/Logs/Bonsai SAT Assistant/
├── app.log          # Main application log
└── errors.log       # Error-only log
```

### View Logs:
```bash
# View main log
tail -f ~/Library/Logs/Bonsai\ SAT\ Assistant/app.log

# View errors only
tail -f ~/Library/Logs/Bonsai\ SAT\ Assistant/errors.log

# Open log directory in Finder
open ~/Library/Logs/Bonsai\ SAT\ Assistant/
```

## 🧪 **Step 5: Test Installation**

After installation, you should see:

1. **App in Applications folder**: `/Applications/Bonsai SAT Assistant.app`
2. **System tray icon**: 🌱 icon in menu bar
3. **Main window**: Opens when you launch the app
4. **Log files**: Created in `~/Library/Logs/Bonsai SAT Assistant/`

## 🔍 **Step 6: Debug Launch Issues**

If the app doesn't start properly:

### Check Console for errors:
```bash
# Open Console.app and filter for "Bonsai"
# Or check the log files we created
```

### Manual launch with debugging:
```bash
# Launch from terminal to see errors
/Applications/Bonsai\ SAT\ Assistant.app/Contents/MacOS/Bonsai\ SAT\ Assistant

# Or use the development version
cd "/Users/gerardo/Downloads/Bonsai Main/bonsai-sat-tutor/desktop-app"
npm run dev
```

## ⚙️ **Step 7: Configure API Keys**

Once the app is running:

1. **Open Settings tab** in the app
2. **Add your OpenAI API key**: `sk-...`
3. **Test the connection**
4. **Add Dashboard token** (optional): From your Vercel app

Or use the setup script:
```bash
cd "/Users/gerardo/Downloads/Bonsai Main/bonsai-sat-tutor/desktop-app"
./scripts/setup.sh
```

## 🔧 **Troubleshooting**

### Issue: "App can't be opened"
**Solution**: Right-click → Open, or remove quarantine

### Issue: "No such file or directory"
**Solution**: Use the DMG installer, not the app bundle

### Issue: App launches but no interface
**Solution**: Check the system tray for 🌱 icon, double-click it

### Issue: API calls fail
**Solution**: Add valid OpenAI API key in Settings

### Issue: Bluebook not detected
**Solution**: Grant screen recording permissions in System Preferences

## 📊 **Success Indicators**

When properly installed, you should see logs like:
```
📝 [INFO] Bonsai SAT Desktop: Initializing...
✅ [SUCCESS] Main window loaded successfully
✅ [SUCCESS] System tray created
📝 [INFO] Initializing core components...
✅ [SUCCESS] Bonsai SAT Desktop: Ready!
```

## 🎯 **Next Steps**

1. **Install using DMG** (not app bundle)
2. **Check logs** for any errors
3. **Configure API keys**
4. **Test with Bluebook practice sessions**

---

**Need help?** Check the log files first, then share the error logs for debugging! 🌱