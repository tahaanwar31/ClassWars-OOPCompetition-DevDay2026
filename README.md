# ClassWars - Round 1 DevDay 2026

A competitive programming trivia game platform with real-time team battles, multi-round gameplay, and comprehensive admin controls.

## Overview

ClassWars is a full-stack web application designed for competitive programming events. Teams compete through multiple rounds of questions across 10 difficulty levels, with real-time scoring, leaderboards, and administrative oversight.

## Features

### Game Features
- 10 difficulty levels with 50 questions each (500 total questions)
- 7 question types: one-word, code, MCQ, output prediction, error detection, code completion, and design
- Multi-round competition system
- Real-time team scoring and leaderboards
- Competition lobby with team management
- Play windows with time-based access control

### Admin Dashboard
- Complete question management (CRUD operations)
- Team creation and management
- Competition configuration and control
- Real-time leaderboard monitoring
- Session management
- JWT-based authentication

### Technical Features
- RESTful API with NestJS
- MongoDB database with Mongoose ODM
- React 19 with TypeScript
- JWT authentication and authorization
- Responsive UI with TailwindCSS
- Real-time data updates

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Router (routing)
- Axios (HTTP client)

### Backend
- NestJS + TypeScript
- MongoDB + Mongoose
- Passport JWT (authentication)
- class-validator (validation)
- bcrypt (password hashing)

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account or local MongoDB instance

### 1. Clone Repository

```bash
git clone <repository-url>
cd ClassWars-Round1-DevDay-2026
```

### 2. Setup Backend

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI

# Seed database with questions
npm run seed              # Seed levels 1-5 (250 questions)
npm run seed:6-10         # Seed levels 6-10 (250 questions)

# Or seed all at once
npm run seed:all

# Create admin user
npm run create-admin

# Start development server
npm run start:dev
```

Backend runs on: http://localhost:3002

### 3. Setup Frontend

```bash
cd frontend
npm install

# Start development server
npm run dev
```

Frontend runs on: http://localhost:3000

## Access Points

- **Game Interface**: http://localhost:3000
- **Competition Lobby**: http://localhost:3000/lobby
- **Admin Dashboard**: http://localhost:3000/admin/login
  - Default credentials:
    - Email: `admin@classwars.com`
    - Password: `admin123`

## Database Seeding

The application includes comprehensive seeding scripts for all 500 questions:

```bash
# Seed individual levels
npm run seed:level-6      # Level 6 (50 questions)
npm run seed:level-7      # Level 7 (50 questions)
npm run seed:level-8      # Level 8 (50 questions)
npm run seed:level-9      # Level 9 (50 questions)
npm run seed:level-10     # Level 10 (50 questions)

# Seed levels 6-10 together
npm run seed:6-10

# Clear and re-seed levels 6-10
npm run seed:6-10-fresh

# Verify seeded data
npm run verify:6-10
```

## Project Structure

```
ClassWars-Round1-DevDay-2026/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   │   ├── admin/       # Admin dashboard pages
│   │   │   └── ...          # Game pages
│   │   ├── services/        # API service layer
│   │   └── types/           # TypeScript type definitions
│   └── package.json
│
├── backend/                  # NestJS backend API
│   ├── src/
│   │   ├── modules/         # Feature modules
│   │   │   ├── auth/        # Authentication
│   │   │   ├── questions/   # Question management
│   │   │   ├── teams/       # Team management
│   │   │   └── users/       # User management
│   │   ├── schemas/         # MongoDB schemas
│   │   ├── scripts/         # Database seeding scripts
│   │   └── main.ts          # Application entry point
│   └── package.json
│
├── docs/                     # Documentation
│   ├── archive/             # Archived temporary docs
│   └── guides/              # Implementation guides
│
├── API_DOCUMENTATION.md      # API endpoints reference
├── ARCHITECTURE.md           # System architecture
├── DEPLOYMENT_GUIDE.md       # Deployment instructions
├── HOW_TO_RUN.md            # Detailed setup guide
└── PROJECT_STRUCTURE.md      # Detailed structure docs
```

## Question Types

The platform supports 7 different question types:

1. **oneword** - Single word answers
2. **code** - Code writing challenges
3. **mcq** - Multiple choice questions (4 options)
4. **output** - Predict code output
5. **error** - Identify code errors
6. **complete** - Complete partial code
7. **design** - System design questions

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Questions
- `GET /questions` - Get all questions
- `GET /questions/:id` - Get question by ID
- `POST /questions` - Create question (admin)
- `PUT /questions/:id` - Update question (admin)
- `DELETE /questions/:id` - Delete question (admin)

### Teams
- `GET /teams` - Get all teams
- `POST /teams` - Create team
- `GET /teams/leaderboard` - Get leaderboard

See `API_DOCUMENTATION.md` for complete API reference.

## Development

### Backend Development

```bash
cd backend
npm run start:dev    # Start with hot reload
npm run build        # Build for production
npm run lint         # Run linter
```

### Frontend Development

```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Documentation

- `API_DOCUMENTATION.md` - Complete API reference
- `ARCHITECTURE.md` - System architecture and design
- `DEPLOYMENT_GUIDE.md` - Production deployment guide
- `HOW_TO_RUN.md` - Detailed setup instructions
- `PROJECT_STRUCTURE.md` - Detailed project structure
- `docs/guides/` - Implementation guides and tutorials

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/classwars
JWT_SECRET=your-secret-key
PORT=3002
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3002
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is developed for DevDay 2026 competition.

## Support

For issues and questions, please refer to the documentation in the `docs/` directory or create an issue in the repository.
