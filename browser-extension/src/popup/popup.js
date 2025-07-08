// Bonsai SAT Prep Assistant - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  await initializePopup();
  setupEventListeners();
});

// Initialize popup with current state
async function initializePopup() {
  try {
    // Get current tab info
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if user is on a supported SAT site
    if (tab && isSupportedSATSite(tab.url)) {
      showGlassRedirectMessage(tab);
      return;
    }
    
    updateSiteStatus(tab);
    
    // Load extension settings
    const settings = await getExtensionSettings();
    updateUIFromSettings(settings);
    
    // Load usage statistics
    const stats = await getUsageStats();
    updateUsageStats(stats);
    
  } catch (error) {
    console.error('Failed to initialize popup:', error);
    showError('Failed to load extension data');
  }
}

// Setup event listeners
function setupEventListeners() {
  // Quick action buttons
  document.getElementById('toggleBonsai').addEventListener('click', toggleBonsaiAssistant);
  document.getElementById('quickHelp').addEventListener('click', triggerQuickHelp);
  
  // Feature toggles
  document.getElementById('voiceToggle').addEventListener('change', toggleVoiceCommands);
  document.getElementById('autoDetect').addEventListener('change', toggleAutoDetect);
  
  // Footer links
  document.getElementById('settingsLink').addEventListener('click', openSettings);
  document.getElementById('upgradeLink').addEventListener('click', openUpgrade);
  document.getElementById('helpLink').addEventListener('click', openHelp);
}

// Update site status display
function updateSiteStatus(tab) {
  const siteNameEl = document.getElementById('siteName');
  const supportBadgeEl = document.getElementById('supportBadge');
  
  if (!tab || !tab.url) {
    siteNameEl.textContent = 'Unknown Site';
    supportBadgeEl.textContent = '❌ Unsupported';
    supportBadgeEl.style.background = 'rgba(239, 68, 68, 0.2)';
    supportBadgeEl.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    return;
  }
  
  const supportedSites = {
    'khanacademy.org': 'Khan Academy',
    'collegeboard.org': 'College Board',
    'satsuite.collegeboard.org': 'SAT Suite',
    'apstudents.collegeboard.org': 'AP Students'
  };
  
  const hostname = new URL(tab.url).hostname;
  const supportedSite = Object.entries(supportedSites).find(([domain]) => 
    hostname.includes(domain)
  );
  
  if (supportedSite) {
    siteNameEl.textContent = supportedSite[1];
    supportBadgeEl.textContent = '✅ Supported';
    supportBadgeEl.style.background = 'rgba(16, 185, 129, 0.2)';
    supportBadgeEl.style.borderColor = 'rgba(16, 185, 129, 0.3)';
  } else {
    siteNameEl.textContent = hostname;
    supportBadgeEl.textContent = '❌ Unsupported';
    supportBadgeEl.style.background = 'rgba(239, 68, 68, 0.2)';
    supportBadgeEl.style.borderColor = 'rgba(239, 68, 68, 0.3)';
  }
}

// Get extension settings
async function getExtensionSettings() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
      if (response && response.success) {
        resolve(response.settings);
      } else {
        resolve({
          bonsaiEnabled: true,
          voiceEnabled: false,
          autoDetect: true
        });
      }
    });
  });
}

// Update UI from settings
function updateUIFromSettings(settings) {
  document.getElementById('voiceToggle').checked = settings.voiceEnabled || false;
  document.getElementById('autoDetect').checked = settings.autoDetect !== false;
  
  // Update status indicator
  const statusText = document.querySelector('.status-text');
  const statusDot = document.querySelector('.status-dot');
  
  if (settings.bonsaiEnabled) {
    statusText.textContent = 'Connected';
    statusDot.style.background = '#10b981';
  } else {
    statusText.textContent = 'Disabled';
    statusDot.style.background = '#ef4444';
  }
}

// Get usage statistics
async function getUsageStats() {
  // In a real implementation, this would fetch from storage or API
  return new Promise((resolve) => {
    chrome.storage.local.get(['dailyUsage', 'streakCount', 'totalHelp'], (result) => {
      resolve({
        dailyUsage: result.dailyUsage || 0,
        dailyLimit: 5, // Free plan limit
        streakCount: result.streakCount || 0,
        totalHelp: result.totalHelp || 0
      });
    });
  });
}

// Update usage stats display
function updateUsageStats(stats) {
  document.getElementById('helpCount').textContent = stats.dailyUsage;
  document.getElementById('dailyUsage').textContent = `${stats.dailyUsage}/${stats.dailyLimit}`;
  document.getElementById('streakCount').textContent = stats.streakCount;
  document.getElementById('totalHelp').textContent = stats.totalHelp;
}

// Toggle Bonsai assistant
async function toggleBonsaiAssistant() {
  const button = document.getElementById('toggleBonsai');
  button.style.opacity = '0.6';
  button.style.pointerEvents = 'none';
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab) {
      await chrome.tabs.sendMessage(tab.id, { action: 'toggleBonsai' });
      showSuccess('Bonsai assistant toggled');
    }
  } catch (error) {
    console.error('Failed to toggle Bonsai:', error);
    showError('Failed to toggle assistant');
  } finally {
    setTimeout(() => {
      button.style.opacity = '1';
      button.style.pointerEvents = 'auto';
    }, 1000);
  }
}

// Trigger quick help
async function triggerQuickHelp() {
  const button = document.getElementById('quickHelp');
  button.style.opacity = '0.6';
  button.style.pointerEvents = 'none';
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab) {
      await chrome.tabs.sendMessage(tab.id, { action: 'quickHelp' });
      showSuccess('Quick help activated');
      
      // Update usage count
      await incrementUsageCount();
    }
  } catch (error) {
    console.error('Failed to trigger quick help:', error);
    showError('Failed to activate quick help');
  } finally {
    setTimeout(() => {
      button.style.opacity = '1';
      button.style.pointerEvents = 'auto';
    }, 1000);
  }
}

// Toggle voice commands
async function toggleVoiceCommands(event) {
  const enabled = event.target.checked;
  
  try {
    await chrome.runtime.sendMessage({
      action: 'saveSettings',
      settings: { voiceEnabled: enabled }
    });
    
    showSuccess(`Voice commands ${enabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('Failed to toggle voice commands:', error);
    event.target.checked = !enabled; // Revert
    showError('Failed to update settings');
  }
}

// Toggle auto-detect
async function toggleAutoDetect(event) {
  const enabled = event.target.checked;
  
  try {
    await chrome.runtime.sendMessage({
      action: 'saveSettings',
      settings: { autoDetect: enabled }
    });
    
    showSuccess(`Auto-detect ${enabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('Failed to toggle auto-detect:', error);
    event.target.checked = !enabled; // Revert
    showError('Failed to update settings');
  }
}

// Increment usage count
async function incrementUsageCount() {
  const stats = await getUsageStats();
  const newDailyUsage = stats.dailyUsage + 1;
  const newTotalHelp = stats.totalHelp + 1;
  
  await chrome.storage.local.set({
    dailyUsage: newDailyUsage,
    totalHelp: newTotalHelp
  });
  
  // Update display
  document.getElementById('helpCount').textContent = newDailyUsage;
  document.getElementById('dailyUsage').textContent = `${newDailyUsage}/${stats.dailyLimit}`;
  document.getElementById('totalHelp').textContent = newTotalHelp;
}

// Open settings page
function openSettings() {
  // Open the local options page instead of web dashboard
  chrome.runtime.openOptionsPage();
  window.close();
}

// Open upgrade page
function openUpgrade() {
  chrome.tabs.create({
    url: 'https://bonsaiprepagent.vercel.app/pricing'
  });
  window.close();
}

// Open help page
function openHelp() {
  chrome.tabs.create({
    url: 'https://bonsaiprepagent.vercel.app/extension/install'
  });
  window.close();
}

// Show success message
function showSuccess(message) {
  showToast(message, 'success');
}

// Show error message
function showError(message) {
  showToast(message, 'error');
}

// Show toast notification
function showToast(message, type = 'info') {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  // Style the toast
  Object.assign(toast.style, {
    position: 'fixed',
    top: '10px',
    right: '10px',
    background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    zIndex: '10000',
    animation: 'slideIn 0.3s ease'
  });
  
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// Add CSS animations for toasts
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);