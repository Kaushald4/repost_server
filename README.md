# Repost Server - Microservices Backend

A scalable, microservices-based backend for the Repost social media platform, built with NestJS.

## 🚀 Tech Stack

- **Framework**: NestJS (Monorepo mode)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Microservices Communication**: gRPC
- **API Gateway**: REST API (NestJS)
- **Authentication**: JWT (Access & Refresh Tokens)
- **Containerization**: Docker
- **Package Manager**: npm

## 📂 Project Structure

The project follows a monorepo structure using NestJS workspaces.

```
server/
├── apps/
│   ├── repost-apigateway/   # REST API Gateway (Entry point)
│   ├── auth-service/        # Authentication & Identity
│   ├── user-service/        # User Profiles & Management
│   ├── community-service/   # Communities (Subreddits) logic
│   ├── post-service/        # Posts management
│   ├── comment-service/     # Comments & Threads
│   ├── chat-service/        # Real-time Messaging
│   ├── interaction-service/ # Votes, Saves, etc.
│   ├── media-service/       # File Uploads & Processing
│   └── notification-service/# User Notifications
├── libs/
│   ├── common/              # Shared decorators, guards, filters
│   ├── dto/                 # Shared Data Transfer Objects
│   ├── grpc/                # gRPC client options & configs
│   └── utils/               # Helper functions
├── proto/                   # gRPC Protocol Buffer definitions
└── docker/                  # Docker configuration files
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:
   Copy `.env.example` to `.env` in each service directory (`apps/*/`) and configure your database connections.

3. Generate Prisma clients:
   ```bash
   npx prisma generate
   ```

### Running the Services

You can run services individually or all together.

**Run API Gateway:**

```bash
npm run start:dev repost-apigateway
```

**Run a Microservice (e.g., Auth):**

```bash
npm run start:dev auth-service
```

## ✅ Implementation Status

### 🔐 Authentication Service (`auth-service`)

- [x] User Registration (Email/Password)
- [x] User Login
- [x] JWT Token Generation (Access & Refresh)
- [x] Token Validation
- [x] Token Refresh
- [ ] OAuth Integration (Google, Apple, GitHub)
- [ ] Password Reset Flow
- [ ] Email Verification

### 👤 User Service (`user-service`)

- [x] Get User Profile by ID
- [x] Update User Profile (Bio, Avatar, Banner)
- [ ] User Search
- [ ] Follow/Unfollow Users
- [ ] Block/Mute Users
- [ ] Privacy Settings
- [ ] Reputation/Karma System

### 🏘️ Community Service (`community-service`)

- [x] Create Community
- [x] Get Community Details
- [ ] Join/Leave Community
- [ ] List Communities (Discovery)
- [ ] Update Community Settings (Rules, Banners, Icons)
- [ ] Community Moderation Tools (Roles & Permissions)
- [ ] Community Health Score

### 📝 Post Service (`post-service`)

- [ ] Create Post (Text, Image, Link, Polls)
- [ ] Get Post by ID
- [ ] Get Feed (Home, Community, User)
- [ ] Edit Post
- [ ] Delete Post
- [ ] Post Filtering & Sorting
- [ ] Anonymous Posting
- [ ] Post Flairs & Tags
- [ ] Post Views Counter
- [ ] Post Drafts & Scheduling

### 💬 Comment Service (`comment-service`)

- [ ] Create Comment
- [ ] Get Comments for Post (Nested/Threaded)
- [ ] Edit Comment
- [ ] Delete Comment
- [ ] Reply to Comment (Quote/Reply)
- [ ] AI Reply Suggestions (Integration)

### ❤️ Interaction Service (`interaction-service`)

- [ ] Upvote/Downvote Post
- [ ] Upvote/Downvote Comment
- [ ] Save Post
- [ ] Vote on Polls
- [ ] Karma Calculation Logic

### 💬 Chat Service (`chat-service`)

- [ ] 1-on-1 Messaging
- [ ] Group Chats
- [ ] Topic-based Live Chats
- [ ] Temporary/Disappearing Chats
- [ ] Real-time Socket.io / WebSocket Gateway
- [ ] Message History
- [ ] Mute/Block in Chat

### 🔔 Notification Service (`notification-service`)

- [ ] Create Notification (Replies, Mentions, Upvotes)
- [ ] Get User Notifications
- [ ] Mark as Read
- [ ] Push Notifications
- [ ] Community Announcements
- [ ] Notification Settings

### 🖼️ Media Service (`media-service`)

- [ ] Image Upload (S3/Cloudinary)
- [ ] Image Optimization/Resizing
- [ ] Video Upload & Processing

### 🌐 API Gateway (`repost-apigateway`)

- [x] Auth Routes Proxy
- [x] User Routes Proxy
- [ ] Community Routes Proxy
- [ ] Post Routes Proxy
- [ ] Comment Routes Proxy
- [ ] Interaction Routes Proxy
- [ ] Unified Error Handling
- [ ] Rate Limiting

## 🔮 Planned Services & Features

### 🔍 Search Service

- [ ] Full-text Search (Posts, Communities, Users)
- [ ] Trending Topics & Analytics
- [ ] Advanced Filtering

### 🤖 AI & Agents Service

- [ ] Content Summarization (TL;DR)
- [ ] Post Improvement & Title Suggestions
- [ ] Feed Curation Agent
- [ ] Research & Moderator Agents
- [ ] Toxicity & Spam Detection

### 🛡️ Moderation Service

- [ ] Report Management System
- [ ] Automated Moderation Actions
- [ ] Moderator Logs & Dashboards

### 🏆 Gamification & Analytics

- [ ] User Levels & Progression
- [ ] Badges & Achievements
- [ ] Community Quests
- [ ] Platform Analytics
