# Aveo Cafe Application

A modern cafe management system with a React frontend and Node.js backend.

## Features

- User authentication and authorization
- Menu management
- Order processing
- Real-time updates
- Responsive design

## Tech Stack

### Frontend
- React.js
- Material-UI
- Redux Toolkit
- Axios

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- JWT Authentication

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Git

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file based on .env.example:
   ```bash
   cp .env.example .env
   ```

4. Update the .env file with your MongoDB Atlas connection string and other configurations

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file:
   ```bash
   cp .env.example .env
   ```

4. Update the .env file with your backend API URL

5. Start the development server:
   ```bash
   npm start
   ```

## Deployment

### Backend Deployment (Render)
1. Create a Render account
2. Create a new Web Service
3. Connect your GitHub repository
4. Set environment variables
5. Deploy

### Frontend Deployment (Netlify)
1. Create a Netlify account
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `build`
5. Set environment variables
6. Deploy

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT 