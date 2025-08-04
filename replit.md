# MindMatch - AI-Powered Emotional Journaling App

## Overview

MindMatch is a modern dark-mode web application designed for emotional journaling and mood tracking. The app leverages AI to analyze user emotions, provide personalized insights, and offer motivational quotes to support mental wellness. Built with a full-stack architecture, it features a React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom dark mode theme
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Style**: RESTful JSON API
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI GPT-4o for mood analysis and insights
- **Development**: Custom Vite integration for SSR-like development experience

## Key Components

### Core Features
1. **Mood Input & Analysis**: Text-based mood logging with AI-powered sentiment analysis
2. **Voice Input**: Web Speech API integration for voice-to-text mood entries
3. **Mood History**: Comprehensive tracking and visualization of mood patterns over time
4. **AI Insights**: Pattern recognition and personalized wellness recommendations
5. **Motivational Quotes**: Context-aware quote suggestions based on current mood
6. **Analytics Dashboard**: Visual mood trends and statistics
7. **Wellness Resources**: Guided meditation and breathing exercise recommendations

### Advanced Features (Added 2025-01-31)
8. **User Authentication**: Firebase Google OAuth for secure user accounts
9. **Cloud Data Storage**: Supabase integration for cross-device data synchronization
10. **Advanced Analytics**: Recharts-powered mood trend visualization with:
    - Daily mood trend line charts
    - Weekly pattern analysis bar charts
    - Mood distribution pie charts
    - Interactive tooltips and time range filters
11. **Mobile-First Design**: Enhanced responsive layout with:
    - Touch-friendly button sizing (44px minimum)
    - Optimized tablet layouts (2-column grid)
    - Mobile tab navigation with icons
    - Improved touch device interactions
12. **Tabbed Interface**: Organized dashboard with distinct sections:
    - Journal: Core mood logging and history
    - Analytics: Advanced chart visualizations
    - Insights: AI analysis and weekly summaries
    - Wellness: Resources and recommendations

### Database Schema
- **Users**: Basic user authentication and profile data
- **Mood Entries**: Core mood tracking with AI analysis results
- **Motivational Quotes**: Curated quotes with mood context mapping

### UI/UX Design
- **Dark Mode First**: Custom dark theme with glassmorphism effects
- **Mobile Responsive**: Mobile-first design with adaptive layouts
- **Accessibility**: ARIA-compliant components with keyboard navigation
- **Visual Design**: Emoji-based mood representation with color-coded categories

## Data Flow

1. **Mood Entry Creation**:
   - User inputs mood reflection (text or voice)
   - Client sends data to `/api/mood-entries` endpoint
   - Server stores entry and triggers AI analysis
   - OpenAI API analyzes sentiment and provides insights
   - Results stored and returned to client

2. **Analytics Generation**:
   - Client requests analytics from `/api/analytics` endpoints
   - Server aggregates mood data and calculates trends
   - Weekly summaries and pattern insights delivered to dashboard

3. **Quote Recommendations**:
   - Server selects contextually appropriate quotes based on current mood
   - Client can request new quotes via `/api/quotes/random`

## External Dependencies

### Core Technologies
- **Database**: PostgreSQL (configured for Drizzle ORM)
- **AI Service**: OpenAI API (GPT-4o model)
- **Hosting**: Neon Database for PostgreSQL hosting

### Key Libraries
- **Frontend**: React, TanStack Query, Wouter, Radix UI, Tailwind CSS
- **Backend**: Express.js, Drizzle ORM, OpenAI SDK
- **Development**: Vite, TypeScript, ESBuild

### Browser APIs
- **Web Speech API**: For voice input functionality
- **Local Storage**: Theme preferences and user settings

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with HMR
- **Database**: Local PostgreSQL or Neon cloud database
- **Environment Variables**: OpenAI API key and database URL required

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Deployment**: Node.js server serving both API and static files
- **Database Migrations**: Drizzle Kit for schema management

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API authentication
- `NODE_ENV`: Environment flag for production optimizations

The application follows a monorepo structure with shared TypeScript types between client and server, ensuring type safety across the full stack. The architecture prioritizes user experience with optimistic updates, offline-capable features, and responsive design patterns.