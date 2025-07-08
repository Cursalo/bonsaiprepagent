// Screen Capture Module
// Simplified screen capture using Electron APIs

const { desktopCapturer } = require('electron');

class ScreenCapture {
  constructor() {
    this.sources = [];
  }

  async initialize() {
    console.log('📸 ScreenCapture: Initializing...');
    try {
      await this.refreshSources();
      console.log('✅ ScreenCapture: Initialized successfully');
    } catch (error) {
      console.error('❌ ScreenCapture: Initialization failed:', error);
      throw error;
    }
  }

  async refreshSources() {
    try {
      this.sources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
        thumbnailSize: { width: 1920, height: 1080 }
      });
    } catch (error) {
      console.error('Failed to refresh screen sources:', error);
      throw error;
    }
  }

  async captureScreen(screenIndex = 0) {
    try {
      await this.refreshSources();
      
      const screenSources = this.sources.filter(source => source.id.startsWith('screen'));
      
      if (screenSources.length === 0) {
        throw new Error('No screen sources available');
      }
      
      const targetScreen = screenSources[screenIndex] || screenSources[0];
      return targetScreen.thumbnail.toPNG();
      
    } catch (error) {
      console.error('Screen capture failed:', error);
      return null;
    }
  }

  async captureWindow(windowName) {
    try {
      await this.refreshSources();
      
      const windowSources = this.sources.filter(source => 
        source.name.toLowerCase().includes(windowName.toLowerCase())
      );
      
      if (windowSources.length === 0) {
        console.log(`No window found matching: ${windowName}`);
        return null;
      }
      
      const targetWindow = windowSources[0];
      return targetWindow.thumbnail.toPNG();
      
    } catch (error) {
      console.error('Window capture failed:', error);
      return null;
    }
  }

  getAvailableSources() {
    return this.sources.map(source => ({
      id: source.id,
      name: source.name,
      type: source.id.startsWith('screen') ? 'screen' : 'window'
    }));
  }
}

module.exports = ScreenCapture;