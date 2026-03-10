# Order Builder SB

A modern order building application and price quoting tool built with React Router 7, PrimeReact, and Drizzle ORM.

## 🛠 Tech Stack
- **Frontend**: React Router 7, PrimeReact (UI Components), Tailwind CSS
- **Backend/Database**: PostgreSQL (Docker), Drizzle ORM
- **Environment**: Node.js (Express server)

## 📋 Prerequisites
Before you begin, ensure you have the following installed:
- [NVM](https://github.com/nvm-sh/nvm) (Node Version Manager)
- **Node.js v18 LTS** or higher
- **Docker Desktop** (Engine must be running)

## 🚀 Getting Started

Most development commands should be executed within the `packages/app` directory.

### 1. Installation
Navigate to the app package and install dependencies:
```bash
cd packages/app
npm install
```

### 2. Environment Configuration
Verify that you have a `.env` file in `packages/app` with the correct `DATABASE_URL`. Use the following default for local Docker development:
```env
DATABASE_URL="postgresql://order_builder_user_postgres:order_builder_password_postgres@localhost:5432/order_builder"
```

### 3. Database Setup
Start the PostgreSQL database and run your migrations:
```bash
npm run docker:db:up   # Start the database container
npm run db:generate    # Generate column migrations
npm run db:migrate     # Apply migrations to the database
```

### 4. Running the App
```bash
npm run typecheck      # Check for type errors
npm run dev            # Start the local development server
```

The application will be running at `http://localhost:5173` (unless configured otherwise).