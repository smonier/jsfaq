# Releasing jsfaq

A release is a Git tag `v<version>` with a GitHub release titled `Release v<version>`, whose asset
is the packed module `jsfaq-v<version>.tgz`. The release notes come from the matching section of
`CHANGELOG.md`.

## Prerequisites

- Node 22 and Yarn 4 (`corepack enable`).
- GitHub CLI, authenticated (`gh auth login`) with write access to `smonier/jsfaq`.
- A clean working tree on `main`, up to date with `origin/main`.

## 1. Prepare the release commit

1. Set the new version in `package.json`, for example:

   ```bash
   npm version 1.2.0 --no-git-tag-version
   ```

2. Add a `## <version> (<YYYY-MM-DD>)` section at the top of `CHANGELOG.md`, above the previous
   release. Everything up to the next `## ` heading becomes the release notes.
3. Check the build locally:

   ```bash
   yarn install --immutable
   yarn lint && yarn test && yarn build
   ```

4. Commit `package.json` and `CHANGELOG.md`, then push to `main`.

On every push, the **Build** workflow (`.github/workflows/build.yml`) builds the module, packs it
into `dist/package.tgz` and uploads it as the `package.tgz` workflow artifact. The **CI** workflow
runs lint, unit tests and build. Wait until both are green on the release commit.

## 2. Publish the release

### From the CI artifact (preferred)

The asset is the package built by CI from the release commit:

```bash
VERSION=1.2.0
SHA=$(git rev-parse HEAD)
RUN_ID=$(gh run list -R smonier/jsfaq --workflow build.yml --commit "$SHA" \
  --json databaseId --jq '.[0].databaseId')
gh run download "$RUN_ID" -R smonier/jsfaq --name package.tgz --dir /tmp/jsfaq-release
cp /tmp/jsfaq-release/package.tgz "jsfaq-v$VERSION.tgz"

awk -v version="$VERSION" '/^## / { if (found) exit; if ($2 == version) { found = 1; next } }
  found { print } END { if (!found) exit 1 }' CHANGELOG.md > /tmp/jsfaq-notes.md

git tag -a "v$VERSION" -m "Release version $VERSION"
git push origin "v$VERSION"
gh release create "v$VERSION" "jsfaq-v$VERSION.tgz" -R smonier/jsfaq \
  --title "Release v$VERSION" --notes-file /tmp/jsfaq-notes.md
```

### With `release.sh`

`./release.sh <version>` runs the whole sequence from a local build:

1. Reads the `## <version>` section of `CHANGELOG.md`, and stops if it is missing.
2. Sets the version in `package.json`, builds, and packs `dist/jsfaq-v<version>.tgz`.
3. Commits `package.json`, tags `v<version>`, and pushes `main` and the tag.
4. Creates the GitHub release `Release v<version>` with the package as its asset, the changelog
   section as notes, followed by the notes GitHub generates from the commits.

The script commits only `package.json`: commit the `CHANGELOG.md` section before running it.

## 3. Check the release

- The release page lists `jsfaq-v<version>.tgz` and the expected notes.
- The package installs on a Jahia 8.2.1 or later instance (**Administration**, **Modules**).

## Versioning

Versions follow [Semantic Versioning](https://semver.org/): a major version for incompatible
changes to the content model or the rendered markup, a minor version for new features, a patch
version for fixes.
