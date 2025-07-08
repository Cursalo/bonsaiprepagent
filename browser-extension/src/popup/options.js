// Bonsai SAT Extension - Options Page
// Handles API key configuration and settings

document.addEventListener('DOMContentLoaded', async () => {
    const apiKeyInput = document.getElementById('apiKey');
    const saveBtn = document.getElementById('saveBtn');
    const testBtn = document.getElementById('testBtn');
    const statusMessage = document.getElementById('statusMessage');
    const settingsForm = document.getElementById('settingsForm');

    // Load existing settings
    await loadSettings();

    // Event listeners
    settingsForm.addEventListener('submit', handleSave);
    testBtn.addEventListener('click', handleTest);
    apiKeyInput.addEventListener('input', clearStatus);

    async function loadSettings() {
        try {
            const result = await chrome.storage.sync.get(['openai_api_key']);
            if (result.openai_api_key) {
                apiKeyInput.value = result.openai_api_key;
                showStatus('Settings loaded successfully', 'success');
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            showStatus('Failed to load existing settings', 'error');
        }
    }

    async function handleSave(event) {
        event.preventDefault();
        
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            showStatus('Please enter an API key', 'error');
            apiKeyInput.focus();
            return;
        }

        if (!apiKey.startsWith('sk-')) {
            showStatus('Invalid API key format. OpenAI keys start with "sk-"', 'error');
            apiKeyInput.focus();
            return;
        }

        try {
            saveBtn.disabled = true;
            saveBtn.textContent = '💾 Saving...';

            await chrome.storage.sync.set({
                openai_api_key: apiKey
            });

            showStatus('✅ Settings saved successfully! You can now use AI features.', 'success');
            
            // Reset button
            setTimeout(() => {
                saveBtn.disabled = false;
                saveBtn.textContent = '💾 Save Settings';
            }, 1000);

        } catch (error) {
            console.error('Failed to save settings:', error);
            showStatus('Failed to save settings. Please try again.', 'error');
            
            saveBtn.disabled = false;
            saveBtn.textContent = '💾 Save Settings';
        }
    }

    async function handleTest() {
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            showStatus('Please enter an API key first', 'error');
            apiKeyInput.focus();
            return;
        }

        try {
            testBtn.disabled = true;
            testBtn.textContent = '🧪 Testing...';
            
            showStatus('Testing API connection...', 'success');

            // Test API call to OpenAI
            const response = await fetch('https://api.openai.com/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                showStatus('✅ API key is valid and working!', 'success');
            } else {
                const errorData = await response.json();
                showStatus(`❌ API test failed: ${errorData.error?.message || 'Invalid API key'}`, 'error');
            }

        } catch (error) {
            console.error('API test failed:', error);
            showStatus('❌ API test failed: Network error or invalid key', 'error');
        } finally {
            testBtn.disabled = false;
            testBtn.textContent = '🧪 Test Connection';
        }
    }

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = 'block';
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 3000);
        }
    }

    function clearStatus() {
        statusMessage.style.display = 'none';
    }

    // Handle keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && event.target === apiKeyInput) {
            handleSave(event);
        }
    });

    // Show API key visibility toggle
    const toggleVisibility = document.createElement('button');
    toggleVisibility.type = 'button';
    toggleVisibility.textContent = '👁️';
    toggleVisibility.style.cssText = `
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        font-size: 16px;
        padding: 4px;
    `;
    
    const inputContainer = apiKeyInput.parentElement;
    inputContainer.style.position = 'relative';
    inputContainer.appendChild(toggleVisibility);
    
    toggleVisibility.addEventListener('click', () => {
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleVisibility.textContent = '🙈';
        } else {
            apiKeyInput.type = 'password';
            toggleVisibility.textContent = '👁️';
        }
    });

    console.log('Bonsai SAT: Options page loaded');
});