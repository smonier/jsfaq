# Creating a GitHub Release

## Prerequisites

1. Install GitHub CLI: `brew install gh`
2. Authenticate: `gh auth login`
3. Ensure all changes are committed

## Option 1: Automated Script (Recommended)

```bash
# Use current version from package.json
./release.sh

# Or specify a new version
./release.sh 0.1.0
```

The script will:

- ✅ Update package.json version
- ✅ Build the module
- ✅ Create release package
- ✅ Commit and tag
- ✅ Push to GitHub
- ✅ Create GitHub release with artifact

## Option 2: Manual Release

### Step 1: Update Version

```bash
# Update version in package.json
npm version 0.1.0 --no-git-tag-version

# Or manually edit package.json
```

### Step 2: Build & Package

```bash
yarn build
yarn release
```

This creates `dist/jsfaq-v0.1.0.tgz`

### Step 3: Commit & Tag

```bash
git add package.json
git commit -m "chore: bump version to 0.1.0"
git tag -a v0.1.0 -m "Release version 0.1.0"
git push origin main
git push origin v0.1.0
```

### Step 4: Create GitHub Release

```bash
gh release create v0.1.0 \
  dist/jsfaq-v0.1.0.tgz \
  --title "Release v0.1.0" \
  --notes-file RELEASE_NOTES.md \
  --generate-notes
```

Or create manually:

1. Go to https://github.com/smonier/jsfaq/releases/new
2. Choose tag `v0.1.0`
3. Set title: "Release v0.1.0"
4. Add release notes
5. Upload `jsfaq-v0.1.0.tgz`
6. Publish release

## Release Checklist

Before creating a release:

- [ ] All tests pass: `yarn lint && yarn build`
- [ ] Version updated in `package.json`
- [ ] `RELEASE_NOTES.md` updated with changes
- [ ] `README.md` updated if needed
- [ ] All changes committed
- [ ] Working tree clean

## Versioning

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0) - Breaking changes
- **MINOR** (0.1.0) - New features, backwards compatible
- **PATCH** (0.0.1) - Bug fixes

## After Release

1. Announce on Jahia Community
2. Update documentation site (if applicable)
3. Test installation from release artifact
