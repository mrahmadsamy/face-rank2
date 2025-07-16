# FaceRank - Person Rating Platform

## Overview

FaceRank is a satirical rating platform inspired by Google Maps, but instead of rating places, users rate people. The application features a modern, neon-themed interface with Arabic RTL support and allows anonymous users to add people, rate them, leave comments, and participate in FaceMash-style comparisons.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom neon theme (cyan, pink, lime green)
- **Component Library**: Radix UI with shadcn/ui components
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: Anonymous session IDs stored in localStorage
- **API Design**: RESTful endpoints with JSON responses

### Data Storage Solutions
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Centralized in `shared/schema.ts` using Drizzle table definitions
- **Migrations**: Managed through drizzle-kit
- **Connection**: Serverless PostgreSQL via Neon Database

## Key Components

### Database Schema
- **people**: Stores person data with ratings, comments, and FaceMash statistics
- **ratings**: Individual user ratings (1-5 stars) with anonymous session tracking
- **comments**: Text comments with upvote/downvote system
- **commentVotes**: Tracks user votes on comments to prevent double voting
- **faceMashComparisons**: Records FaceMash comparison results

### Core Features
1. **Person Management**: Add people with images, names, descriptions, and categories
2. **Rating System**: 1-5 star ratings with automatic title generation based on average
3. **Comment System**: Reddit-style comments with upvote/downvote functionality
4. **FaceMash Mode**: Hot-or-not style comparisons between two random people
5. **Rankings**: Leaderboards for top-rated, worst-rated, and FaceMash winners

### UI Components
- **PersonCard**: Displays person info with rating and stats
- **StarRating**: Interactive star rating component
- **CommentSection**: Full comment management with voting
- **Navigation**: Fixed header with neon styling and modal triggers
- **AddPersonModal**: Form for adding new people to the platform

## Data Flow

### Client-Server Communication
1. **Session Management**: Anonymous sessions created via localStorage and sent via headers
2. **API Requests**: TanStack Query handles all server communication with automatic retries
3. **Real-time Updates**: Optimistic updates with query invalidation for immediate UI feedback
4. **Error Handling**: Centralized error handling with toast notifications

### Rating Workflow
1. User selects star rating → API validates session → Updates person's average rating
2. Comment submission → Stores with session ID → Updates comment count
3. Vote on comment → Checks for existing vote → Updates vote counts
4. FaceMash comparison → Records winner/loser → Updates win/loss statistics

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with PostCSS
- **Components**: Radix UI primitives with shadcn/ui styling
- **State**: TanStack Query for server state management
- **Routing**: Wouter for lightweight routing
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React icons

### Backend Dependencies
- **Server**: Express.js with TypeScript support
- **Database**: Drizzle ORM with PostgreSQL driver
- **Validation**: Zod for runtime type checking
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Development Tools
- **Build System**: Vite with React plugin and runtime error overlay
- **TypeScript**: Strict mode with path mapping for clean imports
- **Linting**: ESLint configuration for code quality
- **Replit Integration**: Cartographer plugin for development environment

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite dev server with HMR for frontend
- **Backend**: tsx for running TypeScript server directly
- **Database**: Neon Database with connection pooling
- **Environment**: Replit-optimized with banner integration

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Assets**: Static files served from Express with Vite integration
- **Database**: Production Neon Database via environment variables

### Database Management
- **Schema Changes**: Applied via `drizzle-kit push` command
- **Migrations**: Generated in `./migrations` directory
- **Connection**: URL-based configuration via `DATABASE_URL` environment variable

The application follows a modern full-stack architecture with type safety throughout, anonymous user sessions for privacy, and a responsive design optimized for both desktop and mobile usage.