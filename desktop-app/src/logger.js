// Logger Module for Bonsai SAT Desktop
// Provides structured logging with file output

const fs = require('fs');
const path = require('path');
const os = require('os');

class Logger {
  constructor() {
    this.logDir = path.join(os.homedir(), 'Library', 'Logs', 'Bonsai SAT Assistant');
    this.logFile = path.join(this.logDir, 'app.log');
    this.errorFile = path.join(this.logDir, 'errors.log');
    
    this.ensureLogDirectory();
    this.startSession();
  }

  ensureLogDirectory() {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  startSession() {
    const sessionStart = `\n${'='.repeat(60)}
🌱 BONSAI SAT ASSISTANT - SESSION START
Time: ${new Date().toISOString()}
Version: 1.0.0
Platform: ${os.platform()} ${os.arch()}
Node: ${process.version}
${'='.repeat(60)}\n`;

    this.writeToFile(this.logFile, sessionStart);
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const prefix = this.getLevelPrefix(level);
    let formattedMessage = `${timestamp} ${prefix} ${message}`;
    
    if (data) {
      formattedMessage += `\nData: ${JSON.stringify(data, null, 2)}`;
    }
    
    return formattedMessage + '\n';
  }

  getLevelPrefix(level) {
    const prefixes = {
      'info': '📝 [INFO] ',
      'warn': '⚠️ [WARN] ',
      'error': '❌ [ERROR]',
      'debug': '🔍 [DEBUG]',
      'success': '✅ [SUCCESS]'
    };
    return prefixes[level] || '📄 [LOG]  ';
  }

  writeToFile(filePath, content) {
    try {
      fs.appendFileSync(filePath, content);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  info(message, data = null) {
    const formatted = this.formatMessage('info', message, data);
    console.log(`📝 ${message}`, data || '');
    this.writeToFile(this.logFile, formatted);
  }

  warn(message, data = null) {
    const formatted = this.formatMessage('warn', message, data);
    console.warn(`⚠️ ${message}`, data || '');
    this.writeToFile(this.logFile, formatted);
  }

  error(message, error = null, data = null) {
    const errorData = error ? {
      message: error.message,
      stack: error.stack,
      ...data
    } : data;
    
    const formatted = this.formatMessage('error', message, errorData);
    console.error(`❌ ${message}`, error || '', data || '');
    
    this.writeToFile(this.logFile, formatted);
    this.writeToFile(this.errorFile, formatted);
  }

  debug(message, data = null) {
    const formatted = this.formatMessage('debug', message, data);
    console.log(`🔍 ${message}`, data || '');
    this.writeToFile(this.logFile, formatted);
  }

  success(message, data = null) {
    const formatted = this.formatMessage('success', message, data);
    console.log(`✅ ${message}`, data || '');
    this.writeToFile(this.logFile, formatted);
  }

  // Log system information
  logSystemInfo() {
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      totalMemory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`,
      freeMemory: `${Math.round(os.freemem() / 1024 / 1024 / 1024)}GB`,
      uptime: `${Math.round(os.uptime() / 3600)}h`,
      loadAverage: os.loadavg()
    };

    this.info('System Information', systemInfo);
  }

  // Log app startup
  logStartup(config = {}) {
    this.info('Application Starting', {
      config,
      pid: process.pid,
      cwd: process.cwd(),
      argv: process.argv
    });
  }

  // Log errors with context
  logError(context, error, additionalData = {}) {
    this.error(`Error in ${context}`, error, additionalData);
  }

  // Get log file paths for user
  getLogPaths() {
    return {
      mainLog: this.logFile,
      errorLog: this.errorFile,
      logDirectory: this.logDir
    };
  }

  // Clear old logs (keep last 7 days)
  cleanOldLogs() {
    try {
      const files = fs.readdirSync(this.logDir);
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < sevenDaysAgo) {
          fs.unlinkSync(filePath);
          this.info(`Cleaned old log file: ${file}`);
        }
      });
    } catch (error) {
      this.error('Failed to clean old logs', error);
    }
  }
}

// Export singleton instance
module.exports = new Logger();