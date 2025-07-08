// Dashboard Sync Module
// Handles synchronization with the Vercel web dashboard

const axios = require('axios');
const { EventEmitter } = require('events');

class DashboardSync extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      baseUrl: config.baseUrl || 'https://bonsaiprepagent.vercel.app',
      apiKey: config.apiKey || null,
      userId: config.userId || null,
      syncInterval: config.syncInterval || 30000, // 30 seconds
      maxRetries: config.maxRetries || 3,
      timeout: config.timeout || 10000 // 10 seconds
    };
    
    this.syncTimer = null;
    this.pendingSync = [];
    this.isOnline = true; // Default to online in Electron main process
    this.lastSyncTime = null;
  }

  async initialize() {
    console.log('🔄 DashboardSync: Initializing...');
    
    try {
      // Test connection to dashboard
      await this.testConnection();
      
      // Start periodic sync if we have credentials
      if (this.config.apiKey && this.config.userId) {
        this.startPeriodicSync();
      }
      
      // Listen for network status changes
      this.setupNetworkListeners();
      
      console.log('✅ DashboardSync: Initialized successfully');
      this.emit('ready');
      
    } catch (error) {
      console.error('❌ DashboardSync: Initialization failed:', error);
      this.emit('error', error);
    }
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.config.baseUrl}/api/health`, {
        timeout: this.config.timeout
      });
      
      if (response.status === 200) {
        console.log('✅ Dashboard connection successful');
        return true;
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.warn('⚠️ Dashboard connection failed:', error.message);
      return false;
    }
  }

  setCredentials(apiKey, userId) {
    this.config.apiKey = apiKey;
    this.config.userId = userId;
    
    console.log('🔑 Credentials updated');
    
    // Start syncing if we weren't before
    if (!this.syncTimer) {
      this.startPeriodicSync();
    }
  }

  startPeriodicSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
    
    this.syncTimer = setInterval(() => {
      this.syncPendingData();
    }, this.config.syncInterval);
    
    console.log(`🔄 Periodic sync started (${this.config.syncInterval}ms interval)`);
  }

  stopPeriodicSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log('⏹️ Periodic sync stopped');
    }
  }

  // Queue data for synchronization
  queueForSync(type, data) {
    const syncItem = {
      id: this.generateId(),
      type,
      data,
      timestamp: Date.now(),
      retries: 0
    };
    
    this.pendingSync.push(syncItem);
    console.log(`📥 Queued for sync: ${type}`, syncItem.id);
    
    // Try immediate sync if online
    if (this.isOnline) {
      this.syncPendingData();
    }
  }

  async syncPendingData() {
    if (!this.isOnline || !this.config.apiKey || this.pendingSync.length === 0) {
      return;
    }

    console.log(`🔄 Syncing ${this.pendingSync.length} pending items...`);
    
    const itemsToSync = [...this.pendingSync];
    this.pendingSync = [];
    
    for (const item of itemsToSync) {
      try {
        await this.syncItem(item);
        console.log(`✅ Synced: ${item.type} (${item.id})`);
      } catch (error) {
        console.error(`❌ Sync failed: ${item.type} (${item.id})`, error.message);
        
        // Retry logic
        item.retries++;
        if (item.retries < this.config.maxRetries) {
          this.pendingSync.push(item);
        } else {
          console.error(`💀 Max retries exceeded for: ${item.type} (${item.id})`);
          this.emit('syncError', { item, error });
        }
      }
    }
    
    this.lastSyncTime = Date.now();
    this.emit('syncComplete', { 
      synced: itemsToSync.length - this.pendingSync.length,
      pending: this.pendingSync.length 
    });
  }

  async syncItem(item) {
    const endpoint = this.getEndpointForType(item.type);
    const headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json'
    };
    
    const payload = {
      userId: this.config.userId,
      timestamp: item.timestamp,
      ...item.data
    };
    
    const response = await axios.post(
      `${this.config.baseUrl}${endpoint}`,
      payload,
      { 
        headers,
        timeout: this.config.timeout 
      }
    );
    
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.data;
  }

  getEndpointForType(type) {
    const endpoints = {
      'practice_session': '/api/sessions',
      'question_attempt': '/api/questions/attempts',
      'help_request': '/api/help/requests',
      'progress_update': '/api/users/progress',
      'usage_stats': '/api/analytics/usage'
    };
    
    return endpoints[type] || '/api/sync/general';
  }

  // Convenience methods for common sync operations
  syncPracticeSession(sessionData) {
    this.queueForSync('practice_session', sessionData);
  }

  syncQuestionAttempt(questionData) {
    this.queueForSync('question_attempt', questionData);
  }

  syncHelpRequest(helpData) {
    this.queueForSync('help_request', helpData);
  }

  syncProgressUpdate(progressData) {
    this.queueForSync('progress_update', progressData);
  }

  syncUsageStats(usageData) {
    this.queueForSync('usage_stats', usageData);
  }

  // Get user progress from dashboard
  async fetchUserProgress() {
    if (!this.config.apiKey || !this.config.userId) {
      throw new Error('API credentials not configured');
    }
    
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/api/users/${this.config.userId}/progress`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`
          },
          timeout: this.config.timeout
        }
      );
      
      return response.data;
      
    } catch (error) {
      console.error('Failed to fetch user progress:', error);
      throw error;
    }
  }

  // Get study recommendations
  async fetchRecommendations() {
    if (!this.config.apiKey || !this.config.userId) {
      throw new Error('API credentials not configured');
    }
    
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/api/users/${this.config.userId}/recommendations`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`
          },
          timeout: this.config.timeout
        }
      );
      
      return response.data;
      
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      throw error;
    }
  }

  setupNetworkListeners() {
    // Network listeners not available in main process
    // In a full implementation, you could use Node.js network monitoring
    console.log('📡 Network monitoring skipped (main process)');
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get sync status
  getStatus() {
    return {
      isOnline: this.isOnline,
      isConfigured: !!(this.config.apiKey && this.config.userId),
      pendingItems: this.pendingSync.length,
      lastSyncTime: this.lastSyncTime,
      syncInterval: this.config.syncInterval
    };
  }

  // Clean up
  destroy() {
    this.stopPeriodicSync();
    this.removeAllListeners();
    console.log('🧹 DashboardSync: Cleaned up');
  }
}

module.exports = DashboardSync;