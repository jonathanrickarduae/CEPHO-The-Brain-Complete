# CEPHO Platform Setup and Deployment Guide

This document provides a detailed guide to setting up the CEPHO platform for local development and deploying it to a production environment.

---

## 1. Local Development Setup

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js:** v22.13.0 or later
- **pnpm:** A fast, disk space-efficient package manager
- **Git:** For version control
- **PostgreSQL:** A running instance of PostgreSQL (e.g., via Docker or a local installation)

### Step-by-Step Installation

1.  **Clone the Repository**

    Open your terminal and clone the GitHub repository:

    ```bash
    git clone https://github.com/jonathanrickarduae/CEPHO-The-Brain-Complete.git
    cd CEPHO-The-Brain-Complete
    ```

2.  **Install Dependencies**

    Use `pnpm` to install all the project dependencies:

    ```bash
    pnpm install
    ```

3.  **Configure Environment Variables**

    Create a `.env` file in the root of the project by copying the example file:

    ```bash
    cp .env.example .env
    ```

    Now, open the `.env` file and fill in the required values:

    ```env
    # Database Connection
    DATABASE_URL="postgresql://user:password@host:port/database"

    # Authentication
    JWT_SECRET="generate_a_strong_random_string_for_this"
    OAUTH_SERVER_URL="http://localhost:3000"

    # External Service API Keys (Optional)
    ELEVENLABS_API_KEY="your_elevenlabs_api_key"
    ANTHROPIC_API_KEY="your_anthropic_api_key"
    AWS_ACCESS_KEY_ID="your_aws_access_key_id"
    AWS_SECRET_ACCESS_KEY="your_aws_secret_access_key"
    AWS_REGION="your_aws_region"
    ```

4.  **Database Migration**

    Apply the database schema to your PostgreSQL database using Drizzle Kit:

    ```bash
    pnpm drizzle-kit push:pg
    ```

5.  **Run the Development Server**

    Start the frontend and backend development servers concurrently:

    ```bash
    pnpm dev
    ```

    - The frontend will be accessible at `http://localhost:5173`.
    - The backend server will be running at `http://localhost:3000`.

---

## 2. Production Deployment

CEPHO is configured for seamless deployment to **Render.com**. The following steps outline the process for deploying the platform to a live environment.

### Prerequisites

- A Render.com account
- A GitHub repository with the CEPHO codebase
- A Supabase project for the PostgreSQL database

### Step-by-Step Deployment

1.  **Create a New Web Service on Render**

    - Log in to your Render dashboard and create a new **Web Service**.
    - Connect your GitHub account and select the CEPHO repository.

2.  **Configure the Service**

    - **Name:** Choose a name for your service (e.g., `cepho-production`).
    - **Region:** Select a region close to your users.
    - **Branch:** Set the branch to `main` for automatic deployments.
    - **Build Command:** `pnpm install && pnpm build`
    - **Start Command:** `pnpm start`
    - **Instance Type:** Choose an appropriate instance type based on your expected traffic.

3.  **Add Environment Variables**

    In the **Environment** tab, add the same environment variables as in your local `.env` file. Ensure you use your production database credentials and API keys.

    **Important:** Do not commit your `.env` file to version control. Use Render's environment variable management to keep your secrets secure.

4.  **Deploy**

    Click the **Create Web Service** button to trigger the first deployment. Render will automatically build and deploy your application. Subsequent pushes to the `main` branch will trigger new deployments.

### Health Checks

For improved reliability, consider adding a health check endpoint to your application and configuring it in Render. This will allow Render to automatically restart your service if it becomes unresponsive.

---

## 3. Available Scripts

The `package.json` file includes several scripts to streamline development and maintenance:

- `pnpm dev`: Starts the development server for both frontend and backend.
- `pnpm build`: Builds the application for production.
- `pnpm start`: Starts the production server.
- `pnpm test:unit`: Runs unit tests.
- `pnpm drizzle-kit push:pg`: Applies database schema changes.
- `pnpm db:studio`: Opens the Drizzle Studio to browse your database.
