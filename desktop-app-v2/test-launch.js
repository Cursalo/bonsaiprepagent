/**
 * Test script to verify app launches and basic functionality works
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing app launch and basic functionality...\n');

// Test 1: Verify core files exist and are valid
console.log('📁 Checking core files...');
const requiredFiles = [
  'src/main.js',
  'src/preload.js', 
  'src/simple-behavior-tracker.js',
  'src/advanced-ai-service.js',
  'src/floating-button.html',
  'src/chat-interface.html'
];

let allFilesOk = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.length > 100) { // Basic sanity check
      console.log(`✅ ${file} (${content.length} chars)`);
    } else {
      console.log(`❌ ${file} - TOO SHORT`);
      allFilesOk = false;
    }
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesOk = false;
  }
});

// Test 2: Check if settings modal HTML is properly formed
console.log('\n⚙️ Testing settings modal...');
try {
  const chatHtml = fs.readFileSync('src/chat-interface.html', 'utf8');
  
  if (chatHtml.includes('openAdvancedSettings')) {
    console.log('✅ Settings function exists');
  } else {
    console.log('❌ Settings function missing');
    allFilesOk = false;
  }
  
  if (chatHtml.includes('apiKeyInput')) {
    console.log('✅ API Key input field exists');
  } else {
    console.log('❌ API Key input field missing');
    allFilesOk = false;
  }
  
  if (chatHtml.includes('saveAdvancedSettings')) {
    console.log('✅ Save settings function exists');
  } else {
    console.log('❌ Save settings function missing');
    allFilesOk = false;
  }
  
} catch (error) {
  console.log('❌ Failed to check settings modal:', error.message);
  allFilesOk = false;
}

// Test 3: Verify simple behavior tracker works
console.log('\n👁️ Testing SimpleBehaviorTracker...');
try {
  const SimpleBehaviorTracker = require('./src/simple-behavior-tracker');
  
  const mockStore = {
    data: {},
    get: function(key, defaultValue) { return this.data[key] || defaultValue; },
    set: function(key, value) { this.data[key] = value; }
  };
  
  const tracker = new SimpleBehaviorTracker(mockStore);
  
  if (typeof tracker.startTracking === 'function') {
    console.log('✅ SimpleBehaviorTracker instantiated');
    console.log('✅ startTracking method exists');
    
    // Test basic metrics
    const metrics = tracker.getCurrentMetrics();
    if (metrics && typeof metrics.sessionDuration === 'number') {
      console.log('✅ getCurrentMetrics works');
    } else {
      console.log('❌ getCurrentMetrics failed');
      allFilesOk = false;
    }
  } else {
    console.log('❌ SimpleBehaviorTracker methods missing');
    allFilesOk = false;
  }
  
} catch (error) {
  console.log('❌ SimpleBehaviorTracker test failed:', error.message);
  allFilesOk = false;
}

// Test 4: Check package.json has correct structure
console.log('\n📦 Testing package.json...');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (pkg.main === 'src/main.js') {
    console.log('✅ Correct main entry point');
  } else {
    console.log('❌ Wrong main entry point');
    allFilesOk = false;
  }
  
  if (pkg.scripts && pkg.scripts.start) {
    console.log('✅ Start script exists');
  } else {
    console.log('❌ Start script missing');
    allFilesOk = false;
  }
  
  const requiredDeps = ['electron-store', 'axios'];
  const missingDeps = requiredDeps.filter(dep => !pkg.dependencies || !pkg.dependencies[dep]);
  
  if (missingDeps.length === 0) {
    console.log('✅ Required dependencies present');
  } else {
    console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
    allFilesOk = false;
  }
  
} catch (error) {
  console.log('❌ package.json test failed:', error.message);
  allFilesOk = false;
}

// Final verdict
console.log('\n' + '='.repeat(50));
if (allFilesOk) {
  console.log('🎉 BASIC FUNCTIONALITY TESTS PASSED!');
  console.log('✅ App should launch without dependency errors');
  console.log('✅ Settings modal should work');
  console.log('✅ Basic behavior tracking should function');
  console.log('\n🚀 Try launching with: npm start');
  console.log('⚙️ Click the gear icon to configure your API key');
} else {
  console.log('❌ SOME TESTS FAILED');
  console.log('⚠️ Check the issues above');
}
console.log('='.repeat(50));

console.log('\n📋 Quick Launch Instructions:');
console.log('1. npm start');
console.log('2. Click the floating green bonsai button');
console.log('3. Click the gear ⚙️ icon in the chat window');
console.log('4. Enter your OpenAI API key');
console.log('5. Click Save');
console.log('6. Start asking SAT questions!');