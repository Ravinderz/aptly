#!/bin/bash

# Maestro E2E Test Execution Script

set -e

# Default values
ENVIRONMENT="development"
FLOW_PATH=""
DEVICE_ID=""
VERBOSE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -f|--flow)
            FLOW_PATH="$2"
            shift 2
            ;;
        -d|--device)
            DEVICE_ID="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -e, --environment    Environment to run tests against (development, staging, production)"
            echo "  -f, --flow          Specific flow to run (optional, runs all flows if not specified)"
            echo "  -d, --device        Device ID to run tests on (optional)"
            echo "  -v, --verbose       Enable verbose output"
            echo "  -h, --help          Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "🧪 Running Maestro E2E tests..."
echo "   Environment: $ENVIRONMENT"

# Set environment-specific configuration
CONFIG_FILE="maestro/config/environments/${ENVIRONMENT}.yaml"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Configuration file not found: $CONFIG_FILE"
    exit 1
fi

echo "   Config: $CONFIG_FILE"

# Create logs directory
mkdir -p maestro/logs
LOG_FILE="maestro/logs/test-run-$(date +%Y%m%d-%H%M%S).log"

# Build maestro command
MAESTRO_CMD="maestro test"

if [ "$VERBOSE" = true ]; then
    MAESTRO_CMD="$MAESTRO_CMD --debug-output"
fi

if [ -n "$DEVICE_ID" ]; then
    MAESTRO_CMD="$MAESTRO_CMD --device-id $DEVICE_ID"
fi

# Add configuration
MAESTRO_CMD="$MAESTRO_CMD --config $CONFIG_FILE"

# Determine what to test
if [ -n "$FLOW_PATH" ]; then
    if [ ! -f "$FLOW_PATH" ]; then
        echo "❌ Flow file not found: $FLOW_PATH"
        exit 1
    fi
    TEST_TARGET="$FLOW_PATH"
    echo "   Running specific flow: $FLOW_PATH"
else
    TEST_TARGET="maestro/flows"
    echo "   Running all flows in: $TEST_TARGET"
fi

# Execute tests
echo "🚀 Executing tests..."
echo "   Command: $MAESTRO_CMD $TEST_TARGET"
echo "   Logs: $LOG_FILE"

if $MAESTRO_CMD $TEST_TARGET 2>&1 | tee "$LOG_FILE"; then
    echo "✅ All tests passed!"
    exit 0
else
    echo "❌ Some tests failed. Check logs: $LOG_FILE"
    exit 1
fi