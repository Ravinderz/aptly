#!/bin/bash

# Data Management Script for Maestro E2E Tests
# This script provides utilities for seeding and cleaning test data

set -e

# Configuration
MAESTRO_DIR="$(dirname "$0")/.."
DATA_DIR="$MAESTRO_DIR/data"
CONFIG_DIR="$MAESTRO_DIR/config"
LOGS_DIR="$MAESTRO_DIR/logs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Maestro is installed
check_maestro() {
    if ! command -v maestro &> /dev/null; then
        error "Maestro CLI is not installed. Please install it first."
        exit 1
    fi
    success "Maestro CLI is available"
}

# Create logs directory if it doesn't exist
setup_logs() {
    mkdir -p "$LOGS_DIR"
    log "Logs directory created at $LOGS_DIR"
}

# Seed test data
seed_data() {
    local environment=${1:-development}
    log "Seeding test data for environment: $environment"
    
    # Check if data files exist
    if [[ ! -f "$DATA_DIR/test-users.yaml" ]] || [[ ! -f "$DATA_DIR/test-content.yaml" ]]; then
        error "Test data files not found in $DATA_DIR"
        exit 1
    fi
    
    # Run data seeding flow
    maestro test \
        --config "$CONFIG_DIR/environments/$environment.yaml" \
        --flow "$DATA_DIR/data-utils.yaml" \
        --flow-name "seedTestData" \
        --output "$LOGS_DIR/seed-data-$(date +%Y%m%d-%H%M%S).log"
    
    if [[ $? -eq 0 ]]; then
        success "Test data seeded successfully for $environment"
    else
        error "Failed to seed test data for $environment"
        exit 1
    fi
}

# Clean test data
cleanup_data() {
    local environment=${1:-development}
    log "Cleaning test data for environment: $environment"
    
    # Run data cleanup flow
    maestro test \
        --config "$CONFIG_DIR/environments/$environment.yaml" \
        --flow "$DATA_DIR/data-utils.yaml" \
        --flow-name "cleanupTestData" \
        --output "$LOGS_DIR/cleanup-data-$(date +%Y%m%d-%H%M%S).log"
    
    if [[ $? -eq 0 ]]; then
        success "Test data cleaned successfully for $environment"
    else
        warning "Some test data may not have been cleaned properly"
    fi
}

# Reset app state
reset_state() {
    local environment=${1:-development}
    log "Resetting app state for environment: $environment"
    
    maestro test \
        --config "$CONFIG_DIR/environments/$environment.yaml" \
        --flow "$DATA_DIR/data-utils.yaml" \
        --flow-name "resetAppState" \
        --output "$LOGS_DIR/reset-state-$(date +%Y%m%d-%H%M%S).log"
    
    if [[ $? -eq 0 ]]; then
        success "App state reset successfully for $environment"
    else
        error "Failed to reset app state for $environment"
        exit 1
    fi
}

# Validate test data
validate_data() {
    local environment=${1:-development}
    log "Validating test data for environment: $environment"
    
    maestro test \
        --config "$CONFIG_DIR/environments/$environment.yaml" \
        --flow "$DATA_DIR/data-utils.yaml" \
        --flow-name "validateTestData" \
        --output "$LOGS_DIR/validate-data-$(date +%Y%m%d-%H%M%S).log"
    
    if [[ $? -eq 0 ]]; then
        success "Test data validation passed for $environment"
    else
        error "Test data validation failed for $environment"
        exit 1
    fi
}

# Full setup (reset + seed + validate)
full_setup() {
    local environment=${1:-development}
    log "Running full data setup for environment: $environment"
    
    reset_state "$environment"
    seed_data "$environment"
    validate_data "$environment"
    
    success "Full data setup completed for $environment"
}

# Full cleanup (cleanup + reset)
full_cleanup() {
    local environment=${1:-development}
    log "Running full data cleanup for environment: $environment"
    
    cleanup_data "$environment"
    reset_state "$environment"
    
    success "Full data cleanup completed for $environment"
}

# Show usage
usage() {
    echo "Usage: $0 [COMMAND] [ENVIRONMENT]"
    echo ""
    echo "Commands:"
    echo "  seed       Seed test data"
    echo "  cleanup    Clean test data"
    echo "  reset      Reset app state"
    echo "  validate   Validate test data"
    echo "  setup      Full setup (reset + seed + validate)"
    echo "  teardown   Full cleanup (cleanup + reset)"
    echo "  help       Show this help message"
    echo ""
    echo "Environments:"
    echo "  development (default)"
    echo "  staging"
    echo "  production"
    echo ""
    echo "Examples:"
    echo "  $0 setup development"
    echo "  $0 seed staging"
    echo "  $0 cleanup production"
    echo "  $0 validate"
}

# Main script logic
main() {
    local command=${1:-help}
    local environment=${2:-development}
    
    # Check prerequisites
    check_maestro
    setup_logs
    
    case $command in
        seed)
            seed_data "$environment"
            ;;
        cleanup)
            cleanup_data "$environment"
            ;;
        reset)
            reset_state "$environment"
            ;;
        validate)
            validate_data "$environment"
            ;;
        setup)
            full_setup "$environment"
            ;;
        teardown)
            full_cleanup "$environment"
            ;;
        help|--help|-h)
            usage
            ;;
        *)
            error "Unknown command: $command"
            usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"