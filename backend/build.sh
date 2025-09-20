#!/usr/bin/env bash
# Exit on error
set -o errexit

# Update pip to latest version
python -m pip install --upgrade pip

# Set environment variables to avoid compilation issues
export CRYPTOGRAPHY_DONT_BUILD_RUST=1
export USE_MYPYC=0
export SETUPTOOLS_USE_DISTUTILS=stdlib

# Try to install with binary wheels first, fallback if needed
echo "🔄 Installing dependencies..."
pip install --prefer-binary --no-cache-dir -r requirements.txt

echo "✅ Build completed successfully!"