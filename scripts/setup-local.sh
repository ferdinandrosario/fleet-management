#!/usr/bin/env bash
#
# scripts/setup-local.sh
# 
# Installs dependencies and prepares the databases for a fresh clone.
# Logs output step-by-step.
#

set -e # Exit immediately if a command exits with a non-zero status
set -u # Treat unset variables as an error

# Ensure we are running from the repository root
cd "$(dirname "$0")/.."

# ANSI color codes for logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
  echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
  echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1"
}

error() {
  echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

warn() {
  echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

log "Starting local environment setup..."

# 1. Check dependencies
log "Checking for mise..."
if ! command -v mise &> /dev/null; then
  warn "mise is not installed. We recommend installing it to manage ruby and node versions."
  warn "See docs/getting-started/prerequisites.md for more info."
else
  log "mise is installed. Installing configured tools..."
  mise install
  success "mise tools installed."
fi

# 2. Backend setup
if [ -d "backend" ]; then
  log "Setting up backend..."
  cd backend

  log "Installing Ruby gems..."
  bundle install

  log "Preparing the database..."
  bin/rails db:prepare

  cd ..
  success "Backend setup complete."
else
  warn "Directory 'backend' not found, skipping backend setup."
fi

# 3. Mobile setup
if [ -d "mobile" ]; then
  log "Setting up mobile..."
  cd mobile

  log "Installing npm packages for mobile..."
  npm install --legacy-peer-deps

  cd ..
  success "Mobile setup complete."
else
  warn "Directory 'mobile' not found, skipping mobile setup."
fi

# 4. Web setup
if [ -d "web" ]; then
  log "Setting up web..."
  cd web

  log "Installing npm packages for web..."
  npm install

  cd ..
  success "Web setup complete."
else
  warn "Directory 'web' not found, skipping web setup."
fi

log "================================================================="
success "Local setup finished successfully!"
log "To run the apps:"
log "  Backend: cd backend && bin/rails server"
log "  Mobile:  cd mobile && npx expo start"
log "  Web:     cd web && npm run dev"
log "================================================================="
