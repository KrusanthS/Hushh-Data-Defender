# Hushh DataGuard

Hushh DataGuard is a full-stack platform that empowers users to manage their personal data consent, understand data value, and share data securely with risk awareness.

## Tech Stack

- **Frontend**: React (Vite), Vanilla CSS, Firebase Auth
- **Backend**: Node.js, Express, MongoDB (Mongoose)

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)
- Firebase Project with Google OAuth enabled

### Backend Setup

1. Navigate to the `backend` directory.
2. Install dependencies: `npm install`.
3. Ensure the `.env` file contains your `MONGODB_URI` and `PORT`.
4. Start the server: `npm start` or `node server.js`.

### Frontend Setup

1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`.
3. Ensure the `.env` file contains your Firebase credentials and `VITE_BACKEND_URL`.
4. Start the development server: `npm run dev`.

## Project Structure

- `backend/`: Express server, Mongoose models, and API routes.
- `frontend/`: React application with Vite, including pages and components.
