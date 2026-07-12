# AssetFlow

Enterprise asset lifecycle management platform.

---

## Getting Started

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **Docker** installed on your system.

### 2. Set Up the Database
Start the database container and seed the schema:
```bash
# Navigate to the server folder
cd server

# Start the PostgreSQL Docker container
docker compose up -d

# Run migrations and insert seed data
npm run migrate
npm run seed
```

### 3. Start the Backend Server
Start the Express server on port `4000`:
```bash
# From the server folder
npm install
npm run dev
```

### 4. Start the Frontend Client
Start the Vite development server on port `5173` (bound to `127.0.0.1`):
```bash
# From the project root, navigate to the client folder
cd ../client

# Install dependencies and start client
npm install
npm run dev
```

---

## Log In Credentials
Open your browser and navigate to **`http://127.0.0.1:5173/login`** and use the following credentials:

*   **Email:** `admin@assetflow.com` (Administrator)
*   **Email:** `priya@assetflow.com` (Asset Manager)
*   **Email:** `amit@assetflow.com` (Department Head)
*   **Password:** `password123` (Same for all users)
