// Bluebook Application Monitor
// Detects when Bluebook is running and monitors for SAT questions

const { EventEmitter } = require('events');
const { screen, nativeImage } = require('electron');
const Tesseract = require('tesseract.js');

class BluebookMonitor extends EventEmitter {
  constructor() {
    super();
    this.isMonitoring = false;
    this.monitorInterval = null;
    this.lastQuestionHash = null;
    this.lastQuestionText = '';
    this.questionStableCount = 0;
    this.bluebookWindow = null;
    this.ocrWorker = null;
    this.lastImageHash = null;
  }

  async start() {
    console.log('🔍 BluebookMonitor: Starting...');
    
    if (this.isMonitoring) {
      console.log('Already monitoring');
      return;
    }

    // Initialize OCR worker
    await this.initializeOCR();
    
    // Start monitoring loop
    this.isMonitoring = true;
    this.monitorInterval = setInterval(() => {
      this.checkBluebookStatus();
    }, 500); // Check every 500ms for real-time response
    
    console.log('✅ BluebookMonitor: Started successfully');
  }

  async stop() {
    console.log('⏹️ BluebookMonitor: Stopping...');
    
    this.isMonitoring = false;
    
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    
    if (this.ocrWorker) {
      await this.ocrWorker.terminate();
      this.ocrWorker = null;
    }
    
    console.log('✅ BluebookMonitor: Stopped');
  }

  async initializeOCR() {
    console.log('🔤 Initializing enhanced OCR worker...');
    
    this.ocrWorker = await Tesseract.createWorker({
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
      errorHandler: (err) => {
        console.error('OCR Error:', err);
      }
    });
    
    await this.ocrWorker.loadLanguage('eng');
    await this.ocrWorker.initialize('eng');
    
    // Enhanced parameters for SAT question recognition
    await this.ocrWorker.setParameters({
      // Character whitelist optimized for SAT content
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?()[]{}:;"-\' +=×÷√²³°%$@#&*/<>~`^|\\_ \n\r\t',
      
      // Page segmentation for mixed text blocks
      tessedit_pageseg_mode: Tesseract.PSM.AUTO,
      
      // OCR Engine Mode for better accuracy
      tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
      
      // Preserve whitespace for better question formatting
      preserve_interword_spaces: '1',
      
      // Improve accuracy for formatted text
      user_defined_dpi: '300'
    });
    
    console.log('✅ Enhanced OCR worker ready with optimized parameters');
  }

  async checkBluebookStatus() {
    try {
      // ALWAYS analyze screen for now - we'll detect questions regardless of app
      console.log('🔍 Analyzing screen for questions...');
      
      // For now, always assume practice mode and scan for content
      const isPracticeMode = true;
      
      if (isPracticeMode) {
        // Capture and analyze current screen regardless of specific app
        await this.analyzeCurrentScreen();
        this.emit('practiceMode', true);
        this.emit('bluebookStatus', true); // Always emit positive status for debugging
      }
      
    } catch (error) {
      console.error('BluebookMonitor: Error checking status:', error);
    }
  }

  async checkForBluebookProcess() {
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      // Check for specific Bluebook application processes
      const bluebookChecks = [
        'ps aux | grep -i "Bluebook" | grep -v grep',
        'ps aux | grep -i "College Board" | grep -v grep',
        'ps aux | grep -i "Digital SAT" | grep -v grep',
        'lsof -c Bluebook 2>/dev/null | head -1',
        'osascript -e "tell application \\"System Events\\" to get name of every process whose name contains \\"Bluebook\\""'
      ];
      
      for (const check of bluebookChecks) {
        try {
          const { stdout } = await execAsync(check);
          if (stdout.trim()) {
            console.log('🎯 Bluebook application confirmed:', stdout.substring(0, 100));
            return true;
          }
        } catch (e) {
          // Continue to next check
        }
      }
      
      // Check for window titles that might indicate Bluebook
      try {
        const { stdout } = await execAsync('osascript -e "tell application \\"System Events\\" to get {name, title} of every window of every process"');
        if (stdout.toLowerCase().includes('bluebook') || 
            stdout.toLowerCase().includes('college board') ||
            stdout.toLowerCase().includes('digital sat')) {
          console.log('📋 Bluebook window detected via window titles');
          return true;
        }
      } catch (e) {
        // Continue
      }
      
      console.log('🔍 No Bluebook application detected');
      return false;
      
    } catch (error) {
      console.log('🔍 Error checking for Bluebook:', error.message);
      return false;
    }
  }

  detectPracticeMode(window) {
    if (!window || !window.title) {
      return false;
    }
    
    const title = window.title.toLowerCase();
    
    // Practice mode indicators
    const practiceIndicators = [
      'practice',
      'test preview',
      'sample',
      'demo',
      'tutorial'
    ];
    
    // Test mode indicators (actual exam)
    const testIndicators = [
      'test session',
      'exam in progress',
      'official test',
      'proctored'
    ];
    
    // Check for test mode first (more restrictive)
    if (testIndicators.some(indicator => title.includes(indicator))) {
      return false; // Test mode - no assistance allowed
    }
    
    // Check for practice mode
    if (practiceIndicators.some(indicator => title.includes(indicator))) {
      return true; // Practice mode - assistance allowed
    }
    
    // Default to practice mode for safety
    return true;
  }

  async analyzeCurrentScreen() {
    try {
      // Capture screenshot
      const screenshot_data = await this.captureWindowScreenshot();
      
      if (!screenshot_data) {
        console.log('⚠️ No screenshot data captured');
        return;
      }
      
      console.log('🔍 Processing screenshot with OCR...');
      
      // Save debug screenshot if enabled
      await this.saveDebugScreenshot(screenshot_data, '-captured');
      
      // Extract text using OCR with enhanced preprocessing
      const { data: { text, confidence } } = await this.ocrWorker.recognize(screenshot_data);
      
      // Preprocess the extracted text for better analysis
      const processedText = this.preprocessOCRText(text);
      
      console.log(`📝 OCR extracted ${text.length} characters (confidence: ${confidence || 'unknown'})`);
      console.log('📄 Raw OCR Text:', text.substring(0, 150) + '...');
      console.log('🔧 Processed Text:', processedText.substring(0, 150) + '...');
      
      // Emit OCR status with better information
      this.emit('liveStatus', {
        scanTime: new Date().toLocaleTimeString(),
        ocrText: processedText.substring(0, 100) + (processedText.length > 100 ? '...' : ''),
        status: 'analyzing',
        textLength: processedText.length,
        confidence: confidence || 0,
        rawLength: text.length
      });
      
      if (!processedText || processedText.trim().length < 20) {
        console.log('⚠️ Not enough meaningful text extracted for analysis');
        this.emit('liveStatus', {
          scanTime: new Date().toLocaleTimeString(),
          status: 'ready',
          message: 'Insufficient text content'
        });
        return;
      }
      
      // Smart change detection using processed text
      const textHash = this.hashString(processedText);
      const isSignificantChange = this.detectSignificantChange(processedText, textHash);
      
      if (!isSignificantChange) {
        return;
      }
      
      this.lastQuestionHash = textHash;
      this.lastQuestionText = processedText;
      
      // Analyze the processed text for question patterns
      const questionData = this.analyzeQuestionText(processedText);
      
      console.log('🔍 Question analysis result:', {
        isQuestion: questionData.isQuestion,
        subject: questionData.subject,
        textLength: questionData.text.length,
        questionScore: questionData.questionScore || 'unknown',
        textPreview: questionData.text.substring(0, 100) + '...'
      });
      
      if (questionData.isQuestion) {
        console.log('📝 NEW QUESTION DETECTED - TRIGGERING OVERLAY:', questionData.subject);
        console.log('📄 Question text:', questionData.text.substring(0, 200));
        this.emit('questionDetected', questionData);
        return questionData; // Return the question data for force capture
      } else {
        console.log('ℹ️ No valid question pattern found');
        console.log('📄 Rejected text:', processedText.substring(0, 100));
        // Still emit the data for manual review
        this.emit('questionDetected', {
          ...questionData,
          isQuestion: true, // Force it to be treated as a question
          manualCapture: true
        });
        return questionData;
      }
      
    } catch (error) {
      console.error('BluebookMonitor: Error analyzing screen:', error);
    }
  }

  async captureWindowScreenshot() {
    try {
      const { desktopCapturer, systemPreferences } = require('electron');
      
      // Get all available sources with higher resolution for better OCR
      const sources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
        thumbnailSize: { width: 2560, height: 1600 }, // Higher resolution for better OCR
        fetchWindowIcons: false
      });
      
      console.log(`📸 Found ${sources.length} capture sources`);
      
      // Emit live status
      this.emit('liveStatus', {
        scanTime: new Date().toLocaleTimeString(),
        sourcesFound: sources.length,
        status: 'capturing'
      });
      
      // Enhanced Bluebook window detection
      let targetSource = null;
      
      // Priority 1: Exact Bluebook matches
      targetSource = sources.find(source => {
        const name = source.name.toLowerCase();
        return name.includes('bluebook') || 
               name.includes('college board') ||
               name.includes('bluebook exams');  // From your screenshot
      });
      
      // Priority 2: Test-related windows
      if (!targetSource) {
        targetSource = sources.find(source => {
          const name = source.name.toLowerCase();
          return (name.includes('test') && name.includes('digital')) ||
                 name.includes('sat') ||
                 name.includes('exam');
        });
      }
      
      // Priority 3: Look for windows with question content indicators
      if (!targetSource) {
        targetSource = sources.find(source => {
          const name = source.name.toLowerCase();
          return name.includes('question') ||
                 name.includes('practice') ||
                 name.includes('section');
        });
      }
      
      // Priority 4: Use primary screen as fallback
      if (!targetSource) {
        targetSource = sources.find(source => source.id.startsWith('screen:0'));
        console.log('📺 Using primary screen capture as fallback');
      }
      
      if (targetSource) {
        console.log(`🎯 Capturing: ${targetSource.name} (${targetSource.display_id || 'window'})`);
        
        // Get the screenshot with enhanced quality
        let screenshot = targetSource.thumbnail;
        
        // Convert to PNG for better OCR processing
        const pngData = screenshot.toPNG();
        console.log(`📷 Screenshot captured: ${pngData.length} bytes, ${screenshot.getSize().width}x${screenshot.getSize().height}`);
        
        return pngData;
      }
      
      console.warn('⚠️ No suitable capture source found');
      return null;
      
    } catch (error) {
      console.error('Screenshot capture error:', error);
      this.emit('liveStatus', {
        scanTime: new Date().toLocaleTimeString(),
        status: 'error',
        error: error.message
      });
      return null;
    }
  }

  analyzeQuestionText(text) {
    const cleanText = text.trim();
    
    // Enhanced SAT question patterns with better accuracy for Bluebook interface
    const questionPatterns = [
      // Bluebook-specific patterns from the screenshot
      /section\s+\d+:\s*math\s*questions?/i,
      /section\s+\d+:\s*(reading|writing|math)/i,
      /this\s+is\s+a\s+test\s+preview/i,
      /check\s+your\s+work/i,
      /next\s+when\s+you'?re\s+ready/i,
      /unanswered|for\s+review/i,
      
      // Explicit SAT question indicators
      /question\s+\d+\s+of\s+\d+/i,
      /which\s+(choice|answer|option)\s+(best|correctly)/i,
      /which\s+of\s+the\s+following/i,
      /based\s+on\s+(the\s+)?(passage|text|graph|table)/i,
      /according\s+to\s+(the\s+)?(passage|author|text)/i,
      
      // Reading comprehension patterns
      /the\s+(author|passage|text)\s+(suggests?|indicates?|implies?)/i,
      /it\s+can\s+be\s+(inferred|concluded)\s+(from|that)/i,
      /the\s+(main|primary)\s+(purpose|idea|theme)/i,
      /in\s+(line|lines)\s+\d+/i,
      /paragraph\s+\d+/i,
      
      // Math-specific patterns
      /if\s+[a-z]\s*[=<>]/i,
      /solve\s+for\s+[a-z]/i,
      /find\s+the\s+(value|solution)/i,
      /what\s+is\s+the\s+(result|answer|value)/i,
      /calculate\s+(the\s+)?/i,
      /the\s+(equation|function|graph)/i,
      /√\d+|x\s*²|[a-z]\s*=\s*\d+/,
      
      // Writing and Language patterns
      /underlined\s+(portion|part)/i,
      /no\s+change/i,
      /which\s+choice\s+(provides|offers|gives)/i,
      /the\s+writer\s+(wants\s+to|should)/i,
      /to\s+accomplish\s+this\s+goal/i,
      
      // Multiple choice indicators
      /^\s*[A-D]\)\s+/m,
      /choice\s+[A-D]/i,
      /option\s+[A-D]/i,
      
      // Section and timing indicators
      /section\s+\d+:\s+(reading|math|writing)/i,
      /minutes?\s+remaining/i,
      /mark\s+for\s+review/i,
      
      // Question navigation indicators (from Bluebook interface)
      /\d+\s*[\|\s]\s*\d+\s*[\|\s]\s*\d+\s*[\|\s]\s*\d+/,  // Question number grid like "1 | 2 | 3 | 4"
      /back\s*next/i,  // Navigation buttons
      /directions/i
    ];
    
    // Subject detection
    let subject = 'unknown';
    
    // Math indicators
    const mathPatterns = [
      /equation/i,
      /solve/i,
      /calculate/i,
      /function/i,
      /x\s*=|y\s*=/,
      /\d+\s*\+\s*\d+/,
      /\d+\s*\*\s*\d+/,
      /triangle/i,
      /circle/i,
      /polygon/i
    ];
    
    // Reading indicators
    const readingPatterns = [
      /passage/i,
      /author/i,
      /paragraph/i,
      /according to/i,
      /suggests that/i,
      /main idea/i,
      /tone/i,
      /perspective/i
    ];
    
    // Writing indicators
    const writingPatterns = [
      /grammar/i,
      /sentence/i,
      /punctuation/i,
      /comma/i,
      /semicolon/i,
      /apostrophe/i,
      /revision/i,
      /edit/i
    ];
    
    // Determine subject
    if (mathPatterns.some(pattern => pattern.test(cleanText))) {
      subject = 'math';
    } else if (readingPatterns.some(pattern => pattern.test(cleanText))) {
      subject = 'reading';
    } else if (writingPatterns.some(pattern => pattern.test(cleanText))) {
      subject = 'writing';
    }
    
    // Enhanced question validation - require stronger evidence
    let questionScore = 0;
    
    // Score based on pattern matches
    questionPatterns.forEach(pattern => {
      if (pattern.test(cleanText)) {
        questionScore += 2; // Strong indicators get more weight
      }
    });
    
    // Additional scoring criteria
    if (cleanText.includes('?')) questionScore += 1;
    if (/choice\s+[A-D]/i.test(cleanText)) questionScore += 3;
    if (/\b[A-D]\)\s+[A-Z]/i.test(cleanText)) questionScore += 3; // Multiple choice format
    if (/\d+\s*minutes?\s+remaining/i.test(cleanText)) questionScore += 2;
    if (/question\s+\d+/i.test(cleanText)) questionScore += 4; // Very strong indicator
    
    // Negative indicators (reduce score)
    if (cleanText.length < 30) questionScore -= 2; // Too short to be a real question
    if (!/[.?!]/.test(cleanText)) questionScore -= 1; // No punctuation
    if (/^(loading|please wait|connecting)/i.test(cleanText)) questionScore -= 5;
    
    // Enhanced detection for Bluebook interface - detect section/navigation screens
    const isBluebookInterface = /section\s+\d+.*math/i.test(cleanText) ||
                               /this\s+is\s+a\s+test\s+preview/i.test(cleanText) ||
                               /check\s+your\s+work/i.test(cleanText) ||
                               /back.*next/i.test(cleanText) ||
                               /\d+\s+\d+\s+\d+\s+\d+/.test(cleanText); // Question numbers
    
    // Lower threshold for better detection during testing
    const isQuestion = questionScore >= 1 || 
                      cleanText.includes('?') || 
                      /choice\s+[A-D]/i.test(cleanText) ||
                      /question\s+\d+/i.test(cleanText) ||
                      isBluebookInterface ||  // Detect Bluebook interface elements
                      cleanText.length > 50; // Any substantial text for testing
    
    // Extract question number if present
    const questionNumberMatch = cleanText.match(/question\s+(\d+)/i) || 
                               cleanText.match(/(\d+)\s*\./);
    const questionNumber = questionNumberMatch ? parseInt(questionNumberMatch[1]) : null;
    
    return {
      isQuestion,
      text: cleanText,
      subject,
      questionNumber,
      timestamp: Date.now(),
      source: 'bluebook',
      hash: this.hashString(cleanText),
      questionScore, // Add score for debugging
      confidence: cleanText.length > 100 ? 'high' : cleanText.length > 50 ? 'medium' : 'low'
    };
  }

  detectSignificantChange(text, textHash) {
    // Check if hash changed
    if (textHash === this.lastQuestionHash) {
      return false;
    }
    
    // Check if text similarity (to avoid minor OCR variations)
    if (this.lastQuestionText) {
      const similarity = this.calculateSimilarity(text, this.lastQuestionText);
      if (similarity > 0.85) {
        console.log(`🔍 Text similarity ${(similarity * 100).toFixed(1)}% - skipping minor change`);
        return false;
      }
    }
    
    // Require stability (same content for 2 checks to avoid OCR noise)
    if (text === this.lastQuestionText) {
      this.questionStableCount++;
      if (this.questionStableCount >= 2) {
        console.log('✅ Stable new question detected');
        return true;
      }
      return false;
    } else {
      this.questionStableCount = 0;
      return false;
    }
  }
  
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }
  
  levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  preprocessOCRText(rawText) {
    if (!rawText) return '';
    
    let text = rawText;
    
    // Remove common OCR artifacts and noise
    text = text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove common OCR misreads
      .replace(/[|]/g, 'l') // Vertical bar to lowercase L
      .replace(/[`'']/g, "'") // Various apostrophes to standard
      .replace(/[""]/g, '"') // Various quotes to standard
      .replace(/—/g, '-') // Em dash to hyphen
      .replace(/…/g, '...') // Ellipsis
      // Remove non-printable characters except newlines and tabs
      .replace(/[^\x20-\x7E\n\r\t]/g, '')
      // Clean up spacing around punctuation
      .replace(/\s+([.!?:;,])/g, '$1')
      .replace(/([.!?])\s*([A-Z])/g, '$1 $2')
      // Fix common number/letter confusion
      .replace(/\b0([a-zA-Z])/g, 'O$1') // 0 to O before letters
      .replace(/\b1([a-zA-Z])/g, 'l$1') // 1 to l before letters  
      // Clean up multiple choice formatting
      .replace(/([A-D])\s*\)\s*/g, '$1) ')
      .trim();
    
    // Filter out very short lines that are likely noise
    const lines = text.split('\n');
    const cleanLines = lines.filter(line => {
      const cleanLine = line.trim();
      return cleanLine.length > 3 || /^[A-D]\)/.test(cleanLine);
    });
    
    return cleanLines.join('\n').trim();
  }

  hashString(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  // Enhanced debugging capabilities
  async saveDebugScreenshot(screenshot_data, suffix = '') {
    if (!process.env.DEBUG_SCREENSHOTS) return;
    
    try {
      const fs = require('fs');
      const path = require('path');
      const os = require('os');
      
      const debugDir = path.join(os.homedir(), 'BonsaiSAT-Debug');
      if (!fs.existsSync(debugDir)) {
        fs.mkdirSync(debugDir);
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `capture-${timestamp}${suffix}.png`;
      const filepath = path.join(debugDir, filename);
      
      fs.writeFileSync(filepath, screenshot_data);
      console.log(`🐛 Debug screenshot saved: ${filepath}`);
      
      return filepath;
    } catch (error) {
      console.error('Failed to save debug screenshot:', error);
    }
  }

  // Test method for development
  async testQuestionDetection(testImagePath) {
    if (!this.ocrWorker) {
      await this.initializeOCR();
    }
    
    const { data: { text } } = await this.ocrWorker.recognize(testImagePath);
    const processedText = this.preprocessOCRText(text);
    const questionData = this.analyzeQuestionText(processedText);
    
    console.log('🧪 Test OCR Result (Raw):', text.substring(0, 200));
    console.log('🔧 Test OCR Result (Processed):', processedText.substring(0, 200));
    console.log('📊 Question Analysis:', questionData);
    
    return questionData;
  }
}

module.exports = BluebookMonitor;