# Sign the app
./gradlew assembleRelease

# Upload to Google Play
# Use Google Play Console or Fastlane
fastlane supply --aab app/build/outputs/bundle/release/app-release.aab