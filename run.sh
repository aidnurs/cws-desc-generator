#!/usr/bin/env zsh

# Activate the Python virtual environment
source functions/venv/bin/activate

npx kill-port 4000, 5000, 8085

# Prevent fork-safety issues on macOS when using certain libraries
export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

# Make sure your shell configuration is loaded
source ~/.zshrc

# Start the Firebase emulators
firebase emulators:start --only functions