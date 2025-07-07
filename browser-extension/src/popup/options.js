// Bonsai SAT Prep - Extension Options/Settings
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('settingsForm');
    const openaiKeyInput = document.getElementById('openaiKey');
    const saveButton = document.getElementById('saveButton');
    const statusDiv = document.getElementById('status');
    
    // Load existing settings
    loadSettings();
    
    // Handle form submission
    form.addEventListener('submit', handleSave);
    
    async function loadSettings() {
        try {
            const result = await chrome.storage.sync.get(['openai_api_key']);
            if (result.openai_api_key) {
                // Show masked key for security
                openaiKeyInput.value = '••••••••••••••••••••' + result.openai_api_key.slice(-8);
                openaiKeyInput.setAttribute('data-has-key', 'true');
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            showStatus('Failed to load settings', 'error');
        }
    }
    
    async function handleSave(event) {
        event.preventDefault();
        
        const openaiKey = openaiKeyInput.value.trim();
        
        if (!openaiKey) {
            showStatus('Please enter your OpenAI API key', 'error');
            return;
        }
        
        // Skip saving if the input shows the masked value
        if (openaiKeyInput.getAttribute('data-has-key') === 'true' && openaiKey.startsWith('••••')) {
            showStatus('Settings saved successfully!', 'success');
            return;
        }
        
        // Validate API key format
        if (!openaiKey.startsWith('sk-')) {
            showStatus('Invalid API key format. Should start with "sk-"', 'error');
            return;
        }
        
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';
        
        try {
            // Save to Chrome storage
            await chrome.storage.sync.set({
                openai_api_key: openaiKey
            });
            
            // Test the API key
            const isValid = await testApiKey(openaiKey);
            
            if (isValid) {
                showStatus('Settings saved successfully!', 'success');
                
                // Mask the key in the input
                openaiKeyInput.value = '••••••••••••••••••••' + openaiKey.slice(-8);
                openaiKeyInput.setAttribute('data-has-key', 'true');
                
                // Notify content scripts about the update
                notifyContentScripts();
            } else {
                showStatus('API key appears to be invalid. Please check and try again.', 'error');
            }
            
        } catch (error) {
            console.error('Failed to save settings:', error);
            showStatus('Failed to save settings', 'error');
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = 'Save Settings';
        }
    }
    
    async function testApiKey(apiKey) {
        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            
            return response.ok;
        } catch (error) {
            console.error('API key test failed:', error);
            return false;
        }
    }
    
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';
        
        // Hide after 3 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
        }
    }
    
    async function notifyContentScripts() {
        try {
            // Get all tabs
            const tabs = await chrome.tabs.query({});
            
            // Notify each content script
            for (const tab of tabs) {
                try {
                    await chrome.tabs.sendMessage(tab.id, {
                        action: 'settingsUpdated'
                    });
                } catch (error) {
                    // Tab might not have content script, ignore
                }
            }
        } catch (error) {
            console.error('Failed to notify content scripts:', error);
        }
    }
    
    // Handle input focus to allow editing
    openaiKeyInput.addEventListener('focus', function() {
        if (this.getAttribute('data-has-key') === 'true') {
            this.value = '';
            this.setAttribute('data-has-key', 'false');
            this.placeholder = 'Enter new API key...';
        }
    });
    
    // Handle input blur to restore masked value if empty
    openaiKeyInput.addEventListener('blur', async function() {
        if (!this.value.trim() && this.getAttribute('data-has-key') === 'false') {
            // Restore the masked value
            try {
                const result = await chrome.storage.sync.get(['openai_api_key']);
                if (result.openai_api_key) {
                    this.value = '••••••••••••••••••••' + result.openai_api_key.slice(-8);
                    this.setAttribute('data-has-key', 'true');
                    this.placeholder = 'sk-...';
                }
            } catch (error) {
                console.error('Failed to restore masked value:', error);
            }
        }
    });
});