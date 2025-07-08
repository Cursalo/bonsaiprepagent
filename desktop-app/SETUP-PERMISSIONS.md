# Bonsai SAT Assistant - Permission Setup Guide

## Required: Screen Recording Permission

The app needs Screen Recording permission to read SAT questions from your screen.

### Step-by-Step Setup:

1. **Install the App**: Install Bonsai SAT Assistant from the .dmg file

2. **Launch the App**: The app will automatically detect missing permissions

3. **Grant Permission**:
   - The app will show a dialog and open System Preferences
   - Go to: **System Preferences > Privacy & Security > Screen Recording**
   - Check the box next to **"Bonsai SAT Assistant"**

4. **Restart the App**: Close and reopen Bonsai SAT Assistant

### Manual Setup (if needed):

If the automatic setup doesn't work:

1. Open **System Preferences**
2. Click **Privacy & Security**
3. Click **Screen Recording** in the left sidebar
4. Click the **lock icon** (bottom left) and enter your password
5. Check the box next to **"Bonsai SAT Assistant"**
6. Restart the app

### Testing:

1. Open Bonsai SAT Assistant
2. Click **"Test Screen Capture"** button
3. You should see: ✅ "Screen capture test completed successfully!"

### Troubleshooting:

- **"Failed to test screen capture"** = Permission not granted
- **App shows red error message** = Permission issue
- **No questions detected** = Permission granted but OCR needs tuning

### Why This Permission is Required:

The app needs to read text from your screen to:
- Detect SAT questions in Bluebook
- Provide AI assistance with the actual questions
- Maintain practice mode safety (no assistance during real exams)

**Note**: The app only reads text content and never records or stores screenshots.