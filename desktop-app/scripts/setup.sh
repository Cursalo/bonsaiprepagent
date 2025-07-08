#!/bin/bash

# Bonsai SAT Desktop App - Setup Script
# This script helps users configure the desktop app with their credentials

set -e

echo "🌱 Bonsai SAT Desktop App - Setup Wizard"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if app is installed
APP_PATH="/Applications/Bonsai SAT Assistant.app"
if [ ! -d "$APP_PATH" ]; then
    print_error "Bonsai SAT Assistant not found in Applications folder."
    echo "Please install the app first by:"
    echo "1. Opening the .dmg file from the dist/ directory"
    echo "2. Dragging 'Bonsai SAT Assistant' to Applications"
    exit 1
fi

print_success "Bonsai SAT Assistant found in Applications"

# Create user config directory
CONFIG_DIR="$HOME/.bonsai-sat"
mkdir -p "$CONFIG_DIR"

print_status "Configuration directory: $CONFIG_DIR"

# Get user credentials
echo ""
print_status "🔑 Setting up API credentials..."
echo ""

# OpenAI API Key
echo "Enter your OpenAI API Key:"
echo "(Get one at: https://platform.openai.com/api-keys)"
read -s OPENAI_API_KEY
echo ""

if [ -z "$OPENAI_API_KEY" ]; then
    print_warning "No OpenAI API key provided. You can add it later in the app settings."
    OPENAI_API_KEY=""
fi

# Dashboard API Token (optional)
echo "Enter your Bonsai Dashboard API token (optional):"
echo "(Available at: https://bonsaiprepagent.vercel.app/settings/api)"
read -s DASHBOARD_TOKEN
echo ""

if [ -z "$DASHBOARD_TOKEN" ]; then
    print_warning "No dashboard token provided. Limited sync functionality."
    DASHBOARD_TOKEN=""
fi

# User ID (optional)
echo "Enter your Bonsai user ID (optional):"
read USER_ID
echo ""

if [ -z "$USER_ID" ]; then
    USER_ID="desktop_user_$(date +%s)"
    print_status "Generated temporary user ID: $USER_ID"
fi

# Create user configuration file
USER_CONFIG="$CONFIG_DIR/user-config.json"
cat > "$USER_CONFIG" << EOF
{
  "version": "1.0.0",
  "createdAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "credentials": {
    "openaiApiKey": "$OPENAI_API_KEY",
    "dashboardToken": "$DASHBOARD_TOKEN",
    "userId": "$USER_ID"
  },
  "preferences": {
    "practiceMode": true,
    "autoStart": false,
    "showNotifications": true,
    "soundEnabled": true,
    "overlayPosition": "topRight",
    "transparency": 0.95
  },
  "safety": {
    "examBlockingEnabled": true,
    "practiceOnlyMode": true,
    "warningsEnabled": true
  }
}
EOF

print_success "User configuration saved to: $USER_CONFIG"

# Set proper permissions
chmod 600 "$USER_CONFIG"
print_status "Configuration file secured with proper permissions"

# Test API connection
echo ""
print_status "🧪 Testing API connections..."

if [ ! -z "$OPENAI_API_KEY" ]; then
    # Test OpenAI API
    TEST_RESPONSE=$(curl -s -X POST "https://api.openai.com/v1/chat/completions" \
        -H "Authorization: Bearer $OPENAI_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{
            "model": "gpt-4o-mini",
            "messages": [{"role": "user", "content": "Say hello"}],
            "max_tokens": 5
        }' || echo "ERROR")
    
    if echo "$TEST_RESPONSE" | grep -q '"choices"'; then
        print_success "✅ OpenAI API connection successful"
    else
        print_warning "⚠️ OpenAI API test failed - please check your API key"
    fi
fi

if [ ! -z "$DASHBOARD_TOKEN" ]; then
    # Test Dashboard API
    DASHBOARD_TEST=$(curl -s -X GET "https://bonsaiprepagent.vercel.app/api/health" \
        -H "Authorization: Bearer $DASHBOARD_TOKEN" || echo "ERROR")
    
    if echo "$DASHBOARD_TEST" | grep -q '"status":"ok"'; then
        print_success "✅ Dashboard API connection successful"
    else
        print_warning "⚠️ Dashboard API test failed - please check your token"
    fi
fi

# Setup complete
echo ""
print_success "🎉 Setup completed successfully!"
echo ""
echo "📱 Next steps:"
echo "   1. Launch Bonsai SAT Assistant from Applications"
echo "   2. The app will automatically use your configuration"
echo "   3. Open Bluebook for SAT practice to test the integration"
echo ""
echo "⚙️ Configuration files:"
echo "   User config: $USER_CONFIG"
echo "   App config: $(dirname "$0")/../config.json"
echo ""
echo "🔧 To modify settings later:"
echo "   • Use the app's Settings menu"
echo "   • Edit: $USER_CONFIG"
echo "   • Restart the app after changes"
echo ""
echo "📖 Documentation:"
echo "   • User Guide: https://bonsaiprepagent.vercel.app/docs/desktop"
echo "   • Troubleshooting: https://bonsaiprepagent.vercel.app/support"
echo ""

# Optional: Launch the app
read -p "Launch Bonsai SAT Assistant now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Launching Bonsai SAT Assistant..."
    open "$APP_PATH"
    print_success "App launched! Check your Applications or dock."
fi

print_success "Setup wizard completed! 🌱"