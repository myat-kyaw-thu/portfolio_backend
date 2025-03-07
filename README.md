
# Express.js Backend with Prisma and API Key Authentication

A RESTful API built with Express.js, Prisma ORM, and PostgreSQL (Neon DB).

## Features

- Express.js server
- Prisma ORM for database operations
- API key authentication for write operations
- Public read-only access
- PostgreSQL database (Neon DB compatible)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env` (already done)
   - Update the `DATABASE_URL` with your Neon DB connection string

3. Initialize Prisma:
   ```
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. Start the server:
   ```
   npm run dev
   ```

## API Authentication

- GET requests are public and don't require authentication
- POST, PUT, DELETE requests require an API key in the `x-api-key` header
- The API key is stored in the `.env` file as `APP_KEY`

## API Endpoints

- GET /api/items - Get all items
- GET /api/items/:id - Get item by ID
- POST /api/items - Create new item (requires API key)
- PUT /api/items/:id - Update item (requires API key)
- DELETE /api/items/:id - Delete item (requires API key)

## Example Request with API Key

```
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"title": "New Item", "description": "Description"}'
```
