# Release Notes

## v0.1.0 — Project Foundation & Boilerplate
**Status:** In Development
**Target:** April 2026

### Highlights

**MFL Mobile App** — React Native foundation for the My Fitness League mobile app. Built with Expo 54, HeroUI Native component library, and Uniwind (Tailwind CSS for React Native).

**Navigation** — 5-tab bottom navigation (Dashboard, My Activity, Leaderboard, My Team, Team Chat) with a side drawer (Profile, Log Activity, Challenges, Settings, Help). File-based routing via Expo Router.

**Theming** — 4 color themes (Default, Lavender, Mint, Sky) each with light and dark variants. Theme selector on Profile screen, light/dark toggle on every tab header.

### Platform
- **Framework:** React Native 0.81 + Expo 54
- **UI Library:** HeroUI Native (40 components)
- **Styling:** Uniwind (Tailwind CSS for RN) + Tailwind 4
- **State:** TanStack Query + React Context
- **Routing:** Expo Router (file-based)
- **Auth:** Mock (will connect to Supabase)
- **Package Manager:** Yarn

### How to Update This File
After each release or milestone, add a new section above the previous one:
```markdown
## vX.Y.Z — Short Description
**Status:** Released / In Development / QA
**Target:** Date

### Highlights
- What's new in plain English (2-3 paragraphs)

### What's Fixed
- Bug fixes in bullet points

### Breaking Changes
- Any breaking changes (or "None")
```
