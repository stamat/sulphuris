# Changelog

All notable changes to Sulphuris are recorded here. Releases up to 4.0.0
predate this file and are in the
[git tags](https://github.com/stamat/sulphuris/tags).

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
Sulphuris uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Contributing an entry

Write your change under `## [Unreleased]`, grouped under `### Added`,
`### Changed`, `### Fixed`, `### Deprecated`, `### Removed` or `### Security`.
Give the heading a short title after an em dash and open with one paragraph
saying what was wrong before:

```markdown
## [Unreleased] — gap utilities follow the spacing scale

`.gap-*` was generated from its own hardcoded list, so a project that changed
`$spacing` got spacing everywhere except between grid children.

### Fixed

- ...
```

Write it for the person upgrading. This is a CSS library, so the public API is
the emitted CSS: call out **a class that was renamed or removed**, **a
declaration that changed**, and **a config variable whose name, shape or
default moved** — none of those show up as a function signature, and all of
them break somebody's markup.

On `script/publish`, `script/changelog` cuts this section into a released entry
in the same commit as the version bump, and the entry becomes the body of the
GitHub release verbatim.

## [Unreleased]
