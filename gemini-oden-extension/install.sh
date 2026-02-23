#!/bin/bash

# Oden Forge Extension Installer for Gemini CLI
# This script automates the installation and setup process

set -e  # Exit on any error

echo "🔥 Oden Forge Extension Installer"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
EXTENSION_NAME="oden-forge"

log_info "Starting Oden Forge extension installation..."
log_info "Extension directory: $SCRIPT_DIR"

# Step 1: Prerequisites Check
log_info "Checking prerequisites..."

# Check Gemini CLI
if ! command_exists "gemini"; then
    log_error "Gemini CLI not found. Please install Gemini CLI first: https://geminicli.com"
fi
log_success "Gemini CLI found"

# Check Node.js
if ! command_exists "node"; then
    log_error "Node.js not found. Please install Node.js 18+ from https://nodejs.org"
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js version 18+ required. Found version $NODE_VERSION"
fi
log_success "Node.js $(node --version) found"

# Check Python
if ! command_exists "python3"; then
    log_warning "Python3 not found. GitHub sync features will be disabled."
    PYTHON_AVAILABLE=false
else
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1-2)
    log_success "Python $PYTHON_VERSION found"
    PYTHON_AVAILABLE=true
fi

# Check GitHub CLI (optional)
if command_exists "gh"; then
    log_success "GitHub CLI found"
    GITHUB_CLI_AVAILABLE=true
else
    log_warning "GitHub CLI not found. Install with: brew install gh (or equivalent)"
    GITHUB_CLI_AVAILABLE=false
fi

# Step 2: Install Node.js dependencies
log_info "Installing Node.js dependencies..."
cd "$SCRIPT_DIR/mcp"

if [ -f "package-lock.json" ]; then
    rm package-lock.json
fi

npm install --production
if [ $? -ne 0 ]; then
    log_error "Failed to install Node.js dependencies"
fi
log_success "Node.js dependencies installed"

# Step 3: Install Python dependencies (if available)
if [ "$PYTHON_AVAILABLE" = true ]; then
    log_info "Installing Python dependencies..."

    # Check if pip is available
    if command_exists "pip3"; then
        pip3 install -r requirements.txt --user
        if [ $? -eq 0 ]; then
            log_success "Python dependencies installed"
        else
            log_warning "Failed to install Python dependencies. GitHub sync may not work."
        fi
    else
        log_warning "pip3 not found. Install Python dependencies manually: pip3 install -r mcp/requirements.txt"
    fi
fi

# Step 4: Install Gemini CLI extension
log_info "Installing Oden Forge extension..."

cd "$SCRIPT_DIR"

# Check if extension is already installed
if gemini extension list 2>/dev/null | grep -q "$EXTENSION_NAME"; then
    log_warning "Extension '$EXTENSION_NAME' already installed. Removing old version..."
    gemini extension uninstall "$EXTENSION_NAME" 2>/dev/null || true
fi

# Install extension
gemini extension install "$SCRIPT_DIR"
if [ $? -ne 0 ]; then
    log_error "Failed to install Gemini CLI extension"
fi

log_success "Oden Forge extension installed successfully"

# Step 5: Verify installation
log_info "Verifying installation..."

# Test if extension is available
if gemini extension list 2>/dev/null | grep -q "$EXTENSION_NAME"; then
    log_success "Extension verified in Gemini CLI"
else
    log_error "Extension not found in Gemini CLI after installation"
fi

# Test basic command
log_info "Testing basic functionality..."
if timeout 10 gemini /oden:help >/dev/null 2>&1; then
    log_success "Basic functionality test passed"
else
    log_warning "Basic functionality test timed out or failed"
fi

# Step 6: Setup completion
log_success "Installation completed successfully!"
echo ""
echo "🎉 Oden Forge Extension Ready!"
echo "=============================="
echo ""
echo "📋 What's installed:"
echo "  • Oden Forge extension for Gemini CLI"
echo "  • MCP servers for project management"
if [ "$PYTHON_AVAILABLE" = true ]; then
    echo "  • GitHub integration (Python)"
fi
if [ "$GITHUB_CLI_AVAILABLE" = true ]; then
    echo "  • GitHub CLI integration"
fi
echo ""
echo "🚀 Quick Start:"
echo "  1. gemini /oden:help           # View all commands"
echo "  2. gemini /oden:init           # Initialize new project"
echo "  3. gemini /oden:architect      # Create technical architecture"
echo ""
echo "📚 Documentation:"
echo "  • README.md - Complete usage guide"
echo "  • /oden:help - Interactive help system"
echo ""

if [ "$PYTHON_AVAILABLE" = false ]; then
    echo "⚠️  Note: Install Python 3.8+ to enable GitHub sync features"
fi

if [ "$GITHUB_CLI_AVAILABLE" = false ]; then
    echo "⚠️  Note: Install GitHub CLI to enable issue synchronization"
fi

echo ""
echo "Happy building with Oden Forge! 🔥"