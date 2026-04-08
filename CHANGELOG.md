# Changelog

All notable changes to the MFL Mobile App will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] — v0.1.0

### Added
- Project scaffolding: React Native + Expo 54, HeroUI Native, Uniwind (Tailwind for RN)
- Tab navigation: Dashboard, My Activity, Leaderboard, My Team, Team Chat
- Drawer navigation: Profile, Log Activity, Challenges, Settings, Help
- Multi-theme system: Default (green), Lavender, Mint, Sky — each with light/dark variants
- Light/dark mode toggle in header
- Privacy policy screen

### Infrastructure
- HeroUI Native component library (40 styled components + 22 primitives)
- 4 Google Fonts loaded: Inter, Saira, SN Pro, Space Grotesk (one per theme)
- TanStack Query configured with auto-refetch on app focus
- Expo Router for file-based routing

[Unreleased]: https://github.com/adminmfl/mfl-app/commits/main
