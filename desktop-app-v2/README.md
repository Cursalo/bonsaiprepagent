# Bonsai SAT Tutor v2 - Advanced Desktop Application

Revolutionary Glass-inspired SAT tutoring assistant with advanced AI and behavior tracking.

## 🌟 Features

### Core Capabilities
- **Glass-inspired Interface**: Floating assistant that stays out of your way
- **Advanced AI Integration**: GPT-4 powered tutoring with contextual awareness
- **Behavior Tracking**: Monitors study patterns and predicts when you need help
- **Proactive Assistance**: Offers help before you get stuck
- **Screen Analysis**: Understands what you're working on
- **Question Detection**: Automatically identifies SAT questions on screen

### Advanced Features
- **Multi-modal AI**: Analyzes text, images, and behavior patterns
- **Predictive Help**: Machine learning-based struggle detection
- **Session Analytics**: Detailed insights into your study habits
- **Cross-platform**: Works on macOS, Windows, and Linux
- **Web API Integration**: Connects to advanced cloud-based AI services

## 🚀 Installation

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ (for OCR functionality)
- OpenAI API key

### Quick Install

```bash
# Navigate to desktop app directory
cd desktop-app-v2

# Install dependencies
npm install

# Start development version
npm run dev

# Build for production
npm run build
```

### Dependencies Installation

The app requires several native dependencies for advanced features:

```bash
# Install screenshot capability
npm install screenshot-desktop

# Install image processing
npm install sharp

# Install OCR for question detection
npm install tesseract.js

# Install automation (optional, for advanced features)
npm install robotjs

# Install WebSocket support
npm install ws
```

Note: Some dependencies may require additional system libraries. See troubleshooting section if you encounter build issues.

## ⚙️ Configuration

### First Run Setup

1. **API Key Configuration**
   - Click the settings gear icon in the chat interface
   - Enter your OpenAI API key
   - Enable desired features (proactive help, behavior tracking, etc.)

2. **Permissions**
   - Grant screen recording permissions for question detection
   - Allow accessibility permissions for behavior tracking (macOS)
   - Enable camera/microphone if using advanced features

### Advanced Settings

- **Proactive Help**: AI automatically offers assistance when struggling
- **Behavior Tracking**: Monitors mouse movements, typing patterns, idle time
- **Screenshot Analysis**: Analyzes screen content to understand context
- **Web API Integration**: Connects to cloud services for enhanced features

## 🎯 Usage

### Basic Usage

1. **Floating Assistant**: The green bonsai button stays visible on your screen
2. **Quick Access**: Click the button or use Cmd+Shift+B to open chat
3. **Natural Interaction**: Type questions, paste problems, or describe concepts
4. **Smart Responses**: AI provides hints, explanations, or full solutions

### Advanced Workflows

1. **Screen Analysis**
   - Click "Analyze Screen" in the chat interface
   - AI examines your current screen and offers relevant help
   - Works with any SAT content (Khan Academy, practice tests, textbooks)

2. **Proactive Assistance**
   - AI monitors your behavior patterns
   - Detects when you're struggling (long pauses, repetitive actions)
   - Offers help automatically before you ask

3. **Behavioral Insights**
   - Click "My Progress" to see learning analytics
   - Track study time, help requests, and improvement areas
   - Personalized recommendations for study habits

### Quick Actions

- **Hint**: Subtle guidance without giving away the answer
- **Explanation**: Deep dive into the underlying concept
- **Step-by-Step**: Complete solution walkthrough
- **Practice**: Generate similar problems for reinforcement

## 🔧 Troubleshooting

### Common Issues

**App Won't Start**
- Ensure Node.js 16+ is installed
- Run `npm install` to install dependencies
- Check for permission issues on macOS/Windows

**Screenshot Features Not Working**
- Grant screen recording permissions in System Preferences (macOS)
- Run as administrator on Windows if needed
- Some corporate firewalls may block screen capture

**AI Responses Slow/Failing**
- Check internet connection
- Verify OpenAI API key is correct and has credits
- Try switching to local fallback mode in settings

**Behavior Tracking Issues**
- Grant accessibility permissions on macOS
- Disable antivirus software that might block mouse/keyboard monitoring
- Check privacy settings on Windows

### Performance Optimization

- **High CPU Usage**: Disable behavior tracking if not needed
- **Memory Issues**: Clear conversation history periodically
- **Battery Drain**: Reduce screenshot frequency in settings

## 🔒 Privacy & Security

### Data Handling
- All behavior data stored locally on your device
- Screen captures processed locally, not stored permanently
- API communications encrypted with OpenAI/cloud services
- No personal information shared without consent

### Permissions Required
- **Screen Recording**: For question detection and screen analysis
- **Accessibility**: For behavior pattern monitoring
- **Internet**: For AI API communication
- **File System**: For local data storage and conversation history

## 🏗️ Architecture

### Components

1. **Main Process** (`main.js`)
   - Electron app lifecycle management
   - Window creation and IPC handling
   - System integration and permissions

2. **Behavior Tracker** (`behavior-tracker.js`)
   - Mouse/keyboard monitoring
   - Pattern recognition and analysis
   - Struggle detection algorithms

3. **AI Service** (`advanced-ai-service.js`)
   - Web API integration
   - Local OpenAI fallback
   - Request queue management

4. **UI Components**
   - Floating button (always-visible assistant)
   - Chat interface (main interaction window)
   - Settings and configuration panels

### Data Flow

```
User Action → Behavior Tracker → Pattern Analysis → AI Service → Response
     ↓              ↓                    ↓             ↓
Screen Capture → OCR → Question Detection → Context → Enhanced Response
```

## 🛠️ Development

### Building from Source

```bash
# Clone repository
git clone <repository-url>
cd bonsai-sat-tutor/desktop-app-v2

# Install dependencies
npm install

# Development mode
npm run dev

# Build for all platforms
npm run build-all

# Platform-specific builds
npm run build-mac
npm run build-windows
npm run build-linux
```

### Project Structure

```
desktop-app-v2/
├── src/
│   ├── main.js                 # Main Electron process
│   ├── preload.js             # Security bridge
│   ├── behavior-tracker.js    # Behavior analysis
│   ├── advanced-ai-service.js # AI integration
│   ├── floating-button.html   # Always-visible UI
│   └── chat-interface.html    # Main chat UI
├── assets/
│   └── icon.png               # App icon
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

### API Integration

The app integrates with the web application's API endpoints:

- `POST /api/ai/advanced-chat` - Enhanced AI responses
- `POST /api/ai/track-behavior` - Behavior data sync
- `GET /api/ai/behavior-prediction/{userId}` - ML predictions
- `POST /api/ai/analyze-screenshot` - Image analysis

## 📈 Analytics & Insights

### Session Tracking
- Study duration and patterns
- Question types and difficulty
- Help request frequency
- Struggle indicators and interventions

### Learning Analytics
- Progress over time
- Strengths and improvement areas
- Optimal study session length
- Personalized recommendations

## 🤝 Contributing

### Reporting Issues
- Use GitHub issues for bug reports
- Include system information and error logs
- Describe steps to reproduce the problem

### Feature Requests
- Suggest new AI capabilities
- Propose UI/UX improvements
- Request additional analytics features

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Electron framework
- Tesseract.js for OCR
- Sharp for image processing
- All beta testers and contributors

---

**Version 2.0.0** - Revolutionary AI-powered SAT tutoring with Glass-inspired contextual awareness.