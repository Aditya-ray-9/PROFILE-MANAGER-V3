# Profile Management Application

A modern profile management web application designed for seamless user experience, featuring advanced search capabilities and database persistence.

## Features

- User authentication with admin/viewer permissions
- Profile management with CRUD operations
- Document attachments for each profile
- Advanced search functionality
- Responsive design for all devices
- Database persistence with Neon PostgreSQL

## Tech Stack

- **Frontend**: React, TailwindCSS, Radix UI components
- **Backend**: Express.js, Node.js
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle
- **Authentication**: Passport.js
- **State Management**: React Query

## Deployment on Render

### Prerequisites

1. A [Render](https://render.com) account
2. A [Neon](https://neon.tech) PostgreSQL database

### Steps to Deploy

1. **Create a Neon PostgreSQL Database**
   - Sign up for a Neon account
   - Create a new project and database
   - Save your database connection string

2. **Create a New Web Service on Render**
   - Connect your GitHub repository
   - Use the following settings:
     - **Environment**: Node
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`

3. **Add Environment Variables on Render**
   - `NEON_DATABASE_URL`: Your Neon PostgreSQL connection string
   - `NODE_ENV`: production
   - `SESSION_SECRET`: A strong random string for session security

4. **Deploy Your Application**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application

## Local Development

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in the required variables
3. Install dependencies with `npm install`
4. Run database migrations with `npm run db:push`
5. Start the development server with `npm run dev`

## Default Admin Credentials

- **Username**: admin
- **Password**: A9810625562

*Note: Change these credentials immediately after the first login for security reasons.*