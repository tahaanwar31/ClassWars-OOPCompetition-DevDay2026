# ClassWars Backend

NestJS API server with MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your MongoDB URI
```

3. Seed database:
```bash
npm run seed
```

## Run

```bash
npm run start:dev
```

Backend will run on http://localhost:3002

## API Endpoints

### Authentication
- `POST /auth/login` - Admin login

### Admin
- `GET /admin/stats` - Dashboard statistics
- `GET /admin/questions` - List questions
- `POST /admin/questions` - Create question
- `PUT /admin/questions/:id` - Update question
- `DELETE /admin/questions/:id` - Delete question
- `GET /admin/config` - Get game config
- `PUT /admin/config` - Update game config
- `GET /admin/sessions` - List sessions
- `DELETE /admin/sessions/:id` - Delete session

## Build

```bash
npm run build
```

## Tech Stack

- NestJS
- TypeScript
- MongoDB (Mongoose)
- JWT Authentication
- Passport
