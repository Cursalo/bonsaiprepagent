# Bonsai SAT Desktop Assistant

A companion desktop application that integrates with Bluebook (College Board's digital SAT platform) to provide AI-powered SAT prep assistance during practice sessions.

## 🌟 Key Features

### 🔍 **Smart Bluebook Integration**
- **Automatic Detection**: Monitors when Bluebook is active and detects SAT questions
- **Practice Mode Only**: Automatically disables during actual exams to maintain integrity
- **Real-time OCR**: Extracts question text from Bluebook interface
- **Subject Recognition**: Identifies Math, Reading, and Writing questions

### 🤖 **AI-Powered Assistance**
- **Contextual Hints**: Get smart hints without revealing answers
- **Concept Explanations**: Understand the underlying concepts being tested
- **Step-by-step Solutions**: Guided problem-solving approach
- **Adaptive Learning**: Personalized help based on your progress

### 🎯 **Glass-Style Overlay**
- **Non-intrusive Design**: Floating overlay that doesn't interfere with Bluebook
- **Always on Top**: Easy access when you need help
- **Draggable Interface**: Position anywhere on your screen
- **Quick Hide**: Instantly hide when not needed

### 📊 **Dashboard Integration**
- **Progress Tracking**: Syncs your practice sessions to the web dashboard
- **Performance Analytics**: Detailed insights into your SAT prep journey
- **Study Plans**: Personalized recommendations based on your practice
- **Cross-platform Sync**: Access your data from web, mobile, or desktop

## 🚀 Installation

### Prerequisites
- macOS 10.15+ / Windows 10+ / Ubuntu 18.04+
- Node.js 16+ (for development)
- Bluebook application installed

### Quick Install
1. Download the latest release from our website
2. Install the desktop app
3. Launch and configure your API key
4. Start practicing with Bluebook!

### Development Setup
```bash
# Clone the repository
git clone https://github.com/bonsai-education/sat-assistant
cd sat-assistant/desktop-app

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

## 🎯 How It Works

### 1. **Bluebook Detection**
The app continuously monitors your system to detect when Bluebook is active. It uses:
- Window title analysis
- Application process monitoring
- Practice vs test mode detection

### 2. **Question Recognition**
When a SAT question is detected:
- Screen capture of the Bluebook window
- OCR (Optical Character Recognition) to extract text
- AI analysis to identify question type and subject
- Pattern matching for SAT-specific question formats

### 3. **AI Assistance**
For each detected question:
- Contextual analysis using GPT-4
- Subject-specific hint generation
- Progressive difficulty assistance
- Educational explanations without revealing answers

### 4. **Ethical Safeguards**
- **Practice Only**: Automatically disables during actual SAT exams
- **No Cheating**: Provides educational support, not direct answers
- **Transparent Operation**: All features clearly visible to users
- **Compliance**: Follows College Board guidelines for test prep tools

## 🛠️ Configuration

### Initial Setup
1. **API Key**: Configure your OpenAI API key for AI features
2. **Dashboard Account**: Link to your Bonsai web account
3. **Overlay Position**: Set preferred location for the assistant
4. **Monitoring Settings**: Enable/disable automatic detection

### Settings Options
- **Auto-detect Questions**: Automatically start helping when questions appear
- **Sound Notifications**: Audio alerts for new questions
- **Overlay Opacity**: Adjust visibility of the assistant
- **Quick Shortcuts**: Customize keyboard shortcuts
- **Analytics**: Enable/disable usage tracking

## 🔒 Privacy & Security

### Data Handling
- **Local Processing**: OCR and question detection happen on your device
- **Encrypted Storage**: API keys and settings stored securely
- **Optional Analytics**: Usage data only sent if you opt in
- **No Recording**: Screenshots are processed immediately, not stored

### Compliance
- **FERPA Compliant**: Educational privacy standards
- **College Board Guidelines**: Follows official test prep tool guidelines
- **Open Source**: Transparent codebase for security review
- **Regular Audits**: Security assessments and updates

## 🎮 Usage

### Getting Started
1. **Launch Bluebook**: Open your SAT practice test
2. **Start Assistant**: The Bonsai assistant will auto-detect Bluebook
3. **Practice Normally**: Work through questions as usual
4. **Get Help**: Click the floating bubble when you need assistance

### Available Help Types
- **💡 Hints**: Gentle nudges in the right direction
- **🧠 Concepts**: Explanation of the underlying topic
- **📝 Solutions**: Step-by-step problem solving
- **🔄 Similar**: Practice with related questions

### Keyboard Shortcuts
- `Cmd/Ctrl + Shift + B`: Toggle overlay visibility
- `Cmd/Ctrl + Shift + H`: Quick help for current question
- `Cmd/Ctrl + Shift + M`: Toggle monitoring on/off

## 📊 Dashboard Integration

### Sync Features
- **Session Tracking**: Automatic upload of practice sessions
- **Progress Analytics**: Visual progress charts and insights
- **Study Recommendations**: AI-powered study plan suggestions
- **Performance Trends**: Track improvement over time

### Web Dashboard Access
Visit [bonsaiprepagent.vercel.app](https://bonsaiprepagent.vercel.app) to:
- View detailed analytics
- Access study materials
- Manage subscription
- Export progress reports

## 🔧 Troubleshooting

### Common Issues

**Assistant not detecting Bluebook**
- Ensure Bluebook is in practice mode (not test mode)
- Check screen permissions in System Preferences
- Restart the assistant application

**OCR not reading questions correctly**
- Ensure good screen resolution and lighting
- Try repositioning the Bluebook window
- Check for the latest app updates

**Overlay not appearing**
- Verify overlay is enabled in settings
- Check if overlay is positioned off-screen
- Reset overlay position in settings

**API errors**
- Verify OpenAI API key is correctly configured
- Check internet connection
- Ensure sufficient API credits

### System Requirements
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB for app installation
- **CPU**: Intel Core i5 / AMD Ryzen 5 or equivalent
- **Screen**: 1280x720 minimum resolution

### Support
- **Help Center**: [help.bonsaiprepagent.com](https://help.bonsaiprepagent.com)
- **Email Support**: support@bonsaiprepagent.com
- **Community**: Join our Discord server
- **Documentation**: Full API docs and guides

## 🚀 Development

### Architecture
```
Desktop App (Electron)
├── Main Process (Node.js)
│   ├── Bluebook Monitor
│   ├── OCR Engine
│   ├── Question Detector
│   └── Dashboard Sync
├── Renderer Process (HTML/CSS/JS)
│   ├── Main Interface
│   ├── Settings Panel
│   └── Overlay Window
└── Preload Scripts
    ├── IPC Communication
    └── Security Context
```

### Key Components
- **BluebookMonitor**: Detects Bluebook application and practice mode
- **ScreenCapture**: Captures screenshots for OCR processing
- **QuestionDetector**: AI-powered question analysis and classification
- **OverlayRenderer**: Glass-style floating interface
- **DashboardSync**: Syncs data with web dashboard

### Building
```bash
# Build for all platforms
npm run build

# Platform-specific builds
npm run build-mac    # macOS
npm run build-win    # Windows
npm run build-linux  # Linux

# Development build
npm run pack
```

### Testing
```bash
# Run unit tests
npm test

# Test OCR functionality
npm run test:ocr

# Test Bluebook detection
npm run test:monitor

# Integration tests
npm run test:integration
```

## 📈 Roadmap

### Upcoming Features
- **Voice Commands**: Hands-free assistance
- **Mobile Companion**: iOS/Android app integration
- **Advanced Analytics**: ML-powered insights
- **Collaborative Study**: Share sessions with tutors
- **Offline Mode**: Basic assistance without internet

### Version History
- **v1.0.0**: Initial release with Bluebook integration
- **v1.1.0**: Enhanced OCR and better question detection
- **v1.2.0**: Dashboard sync and analytics
- **v1.3.0**: Glass-style overlay redesign

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Style
- ESLint configuration for JavaScript
- Prettier for code formatting
- Conventional commits for commit messages
- JSDoc for function documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **College Board**: For the Bluebook digital SAT platform
- **OpenAI**: For providing the AI capabilities
- **Tesseract.js**: For OCR functionality
- **Electron**: For cross-platform desktop app framework
- **Our Users**: For feedback and support in building this tool

---

**Made with 🌱 by Bonsai Education Technologies**

*Helping students grow their SAT potential through intelligent, ethical assistance.*