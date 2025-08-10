#!/bin/bash

# Maestro E2E Test Environment Setup Script

echo "🚀 Setting up Maestro E2E test environment..."

# Check if Maestro is installed
if ! command -v maestro &> /dev/null; then
    echo "❌ Maestro CLI not found. Please install Maestro first:"
    echo "   curl -Ls 'https://get.maestro.mobile.dev' | bash"
    exit 1
fi

echo "✅ Maestro CLI found: $(maestro --version)"

# Check if Expo CLI is available
if ! command -v npx expo &> /dev/null; then
    echo "❌ Expo CLI not found. Please install Expo CLI first:"
    echo "   npm install -g @expo/cli"
    exit 1
fi

echo "✅ Expo CLI found"

# Set default environment variables if not provided
export API_BASE_URL=${API_BASE_URL:-"http://localhost:3000"}
export TEST_USER_PHONE=${TEST_USER_PHONE:-"+1234567890"}
export TEST_USER_OTP=${TEST_USER_OTP:-"123456"}

echo "🔧 Environment variables set:"
echo "   API_BASE_URL: $API_BASE_URL"
echo "   TEST_USER_PHONE: $TEST_USER_PHONE"

# Create logs directory if it doesn't exist
mkdir -p maestro/logs

echo "✅ Maestro E2E test environment setup complete!"
echo "📱 Make sure your Expo development build is running before executing tests"