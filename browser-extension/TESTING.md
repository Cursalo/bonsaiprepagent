# Bonsai SAT Extension Testing Guide

## Quick Setup

### 1. Load Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `browser-extension` folder
5. The Bonsai SAT extension should now be loaded

### 2. Test the Glass Interface
1. Open the test page: `file:///path/to/browser-extension/test-extension.html`
2. You should see a floating Glass bubble (🌱) in the top-right corner
3. Click the bubble to expand the Glass interface
4. The interface should show:
   - Glass-inspired dark theme with backdrop blur
   - Context detection showing detected questions
   - Spiral learning progress indicators
   - Action buttons for hints, concepts, and solutions

### 3. Test on Real SAT Platforms
Visit any of these supported platforms:
- Khan Academy SAT: https://www.khanacademy.org/test-prep/sat
- College Board: https://collegeboard.org/
- SAT Suite: https://satsuite.collegeboard.org/

## Expected Behavior

### Glass Interface Features
✅ **Floating Bubble**: Small glass bubble appears in top-right corner
✅ **Expand/Collapse**: Click bubble to show full Glass interface
✅ **Glass Aesthetics**: Dark theme with backdrop blur and smooth animations
✅ **Drag Functionality**: Drag the expanded interface to reposition
✅ **Real-time Detection**: Automatically detects SAT questions on page

### Context Awareness
✅ **Question Detection**: Identifies math, reading, and writing questions
✅ **Subject Classification**: Shows detected subject (Math/Reading/Writing)
✅ **Platform Recognition**: Detects Khan Academy, College Board, etc.
✅ **Dynamic Content**: Responds to new questions loaded via JavaScript

### AI Features (Requires API Key)
✅ **Smart Hints**: Provides contextual hints without giving answers
✅ **Concept Explanations**: Explains underlying concepts being tested
✅ **Solution Guidance**: Step-by-step problem-solving approach
✅ **Spiral Learning**: Progressive learning sequence with visual indicators

### User Experience
✅ **Smooth Animations**: Glass-inspired transitions and hover effects
✅ **Responsive Design**: Works on different screen sizes
✅ **Position Persistence**: Remembers bubble position between sessions
✅ **Keyboard Shortcuts**: Ctrl/Cmd+Shift+B to toggle, Ctrl/Cmd+Shift+H for help

## Setting Up API Key

1. Click the extension icon in Chrome toolbar
2. Go to "Settings" or "Options"
3. Enter your OpenAI API key
4. Save settings
5. Return to SAT content and test AI features

## Troubleshooting

### Extension Not Loading
- Check console for errors (F12 → Console)
- Verify all files are present in browser-extension folder
- Ensure manifest.json is valid
- Reload extension in chrome://extensions/

### Glass Interface Not Appearing
- Check if CSP is blocking scripts (common on educational sites)
- Look for "Bonsai SAT" logs in console
- Verify the page URL matches supported domains in manifest.json
- Try refreshing the page

### AI Features Not Working
- Verify API key is correctly entered in extension settings
- Check browser console for API errors
- Ensure you have OpenAI API credits available
- Test with the fallback messages (should work without API)

### Context Detection Issues
- Check if question elements have expected selectors
- Look for "Question detected" logs in console
- Try different SAT practice pages
- Verify the question text is visible and not hidden

## Console Debugging

Open browser console (F12) and look for these logs:

```
✅ Bonsai SAT: Detected platform: khan
✅ Bonsai SAT: Glass component loaded
✅ Bonsai SAT: Glass container added to page
✅ Bonsai SAT: Question detected: {subject: 'math', type: 'multiple-choice'}
✅ Bonsai Glass: Component connected
```

## Testing Checklist

### Basic Functionality
- [ ] Extension loads without errors
- [ ] Glass bubble appears on supported sites
- [ ] Bubble expands to show interface
- [ ] Interface has Glass-inspired design
- [ ] Console shows successful initialization

### Question Detection
- [ ] Math questions detected correctly
- [ ] Reading questions detected correctly  
- [ ] Writing questions detected correctly
- [ ] Subject classification works
- [ ] Dynamic content detection works

### AI Integration
- [ ] Hints work with API key
- [ ] Concepts work with API key
- [ ] Solutions work with API key
- [ ] Fallback messages work without API key
- [ ] Loading states show properly

### User Experience
- [ ] Smooth animations and transitions
- [ ] Drag functionality works
- [ ] Position persistence works
- [ ] Keyboard shortcuts work
- [ ] Mobile responsiveness works

### Glass Features
- [ ] Spiral learning progression shows
- [ ] Context display updates dynamically
- [ ] Glass aesthetics match design
- [ ] Real-time awareness functions
- [ ] Component feels like Glass repository

## Performance Testing

1. Check memory usage in Chrome Task Manager
2. Monitor network requests for API calls
3. Test on slower internet connections
4. Verify no memory leaks during extended use
5. Check CPU usage during AI operations

## Comparison with Glass Repository

The extension should feel similar to the Glass repository:
- Floating interface that appears contextually
- Minimal and elegant design
- Real-time awareness of page content
- Smooth, glass-like visual effects
- Unobtrusive but helpful presence

If the extension doesn't match these expectations, review the Glass repository implementation and adjust accordingly.