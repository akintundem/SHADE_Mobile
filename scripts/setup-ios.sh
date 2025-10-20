#!/bin/bash

# iOS Setup Script for Capsule App
echo "🚀 Setting up iOS dependencies..."

# Install CocoaPods dependencies
echo "📦 Installing CocoaPods dependencies..."
cd ios && pod install && cd ..

# Clean and rebuild
echo "🧹 Cleaning build cache..."
npx react-native clean

echo "✅ iOS setup complete!"
echo "📱 You can now run: npm run ios"
