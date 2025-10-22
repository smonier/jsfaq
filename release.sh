#!/bin/bash

# GitHub Release Script for jsfaq module
# Usage: ./release.sh [version]
# Example: ./release.sh 0.1.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get version from argument or package.json
if [ -n "$1" ]; then
    NEW_VERSION=$1
else
    CURRENT_VERSION=$(node -p "require('./package.json').version")
    echo -e "${YELLOW}Current version: ${CURRENT_VERSION}${NC}"
    echo -e "Enter new version (or press Enter to use ${CURRENT_VERSION}):"
    read -r NEW_VERSION
    NEW_VERSION=${NEW_VERSION:-$CURRENT_VERSION}
fi

echo -e "${GREEN}Creating release for version: ${NEW_VERSION}${NC}"

# Update version in package.json
echo "Updating package.json version..."
npm version $NEW_VERSION --no-git-tag-version

# Build the module
echo "Building module..."
yarn build

# Create release package
echo "Creating release package..."
PACKAGE_FILE="dist/jsfaq-v${NEW_VERSION}.tgz"
yarn pack --out $PACKAGE_FILE

# Stage and commit changes
echo "Committing version changes..."
git add package.json
git commit -m "chore: bump version to ${NEW_VERSION}"

# Create git tag
echo "Creating git tag..."
git tag -a "v${NEW_VERSION}" -m "Release version ${NEW_VERSION}"

# Push changes and tag
echo "Pushing to GitHub..."
git push origin main
git push origin "v${NEW_VERSION}"

# Create GitHub release
echo "Creating GitHub release..."
gh release create "v${NEW_VERSION}" \
    "$PACKAGE_FILE" \
    --title "Release v${NEW_VERSION}" \
    --notes-file RELEASE_NOTES.md \
    --generate-notes

echo -e "${GREEN}✅ Release v${NEW_VERSION} created successfully!${NC}"
echo -e "Package: ${PACKAGE_FILE}"
echo -e "View release: https://github.com/smonier/jsfaq/releases/tag/v${NEW_VERSION}"
