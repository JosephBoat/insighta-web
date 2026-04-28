# Insighta Labs — Web Portal

A simple web interface for the Insighta Labs platform.

## Live URL
```
https://josephboat.github.io/insighta-web
```

## Pages

| Page | URL | Description |
|---|---|---|
| Login | `/index.html` | GitHub OAuth login |
| Dashboard | `/dashboard.html` | Metrics overview |
| Profiles | `/profiles.html` | List with filters + pagination |
| Profile Detail | `/profile-detail.html?id=...` | Single profile view |
| Search | `/search.html` | Natural language search |
| Account | `/account.html` | User info |

## Authentication

- Login via GitHub OAuth
- Tokens stored in `sessionStorage`
- Auto-refreshes on expiry
- HTTP-only cookie support via backend

## Tech Stack
- Vanilla HTML + CSS + JavaScript
- No frameworks — zero dependencies
- Deployed on GitHub Pages