# Voters - Polling App

A full-stack polling application where people can create polls and vote on them.

## Features

- Create polls (with name or anonymously)
- Vote on polls (one vote per user per poll)
- Public or anonymous voting
- Visual results display with charts

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Apollo Server (GraphQL) + TypeScript
- **Database**: SQLite

## Getting Started

### Install Dependencies

```bash
npm run install:all
```

### Development

Run both frontend and backend concurrently:

```bash
npm run dev
```

Or run them separately:

```bash
# Backend (GraphQL Server)
npm run dev:server

# Frontend (React App)
npm run dev:client
```

### Production Build

```bash
npm run build
```

## Project Structure

```
.
├── client/          # React frontend
├── server/          # GraphQL backend
└── package.json     # Root package.json
```

