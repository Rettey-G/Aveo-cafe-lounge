# Aveo Cafe & Lounge Management System

A comprehensive cafe and lounge management system built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- Menu Management
- Table Layout Management
- Order Taking System
- Invoice Generation
- Inventory Management with Low Stock Alerts
- Contact Form
- About Page

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas
- npm or yarn

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your MongoDB Atlas connection string and other configurations:
   ```
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/aveo-cafe-lounge?retryWrites=true&w=majority
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=https://aveo-cafe-lounge.netlify.app
   ```

5. Start the backend server:
   ```bash
   npm start
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

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your backend API URL:
   ```
   REACT_APP_API_URL=https://aveo-cafe-backend.onrender.com/api
   ```

5. Start the frontend development server:
   ```bash
   npm start
   ```

## MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (the free tier is sufficient for development)
3. Set up database access:
   - Create a database user with read/write permissions
   - Add your IP address to the IP whitelist
4. Get your connection string and update it in the backend `.env` file
5. Create the following collections in your database:
   - users
   - menuItems
   - tables
   - orders
   - invoices

## Features in Detail

### Menu Management
- Add, edit, and remove menu items
- Categorize items (Hot Coffee, Cold Coffee, Tea, etc.)
- Set prices and descriptions
- Track inventory levels

### Table Layout
- Manage table arrangements
- Track table status (available, occupied, reserved)
- Assign tables to orders

### Order Taking
- Create new orders
- Add items to orders
- Modify quantities
- Track order status

### Invoice Generation
- Generate unique invoice numbers
- Include customer details
- Calculate subtotal, tax, and total
- Print or save invoices

### Inventory Management
- Track stock levels
- Set minimum stock thresholds
- Receive low stock alerts
- Monitor expiry dates

## Development

- Backend runs on: https://aveo-cafe-backend.onrender.com
- Frontend runs on: https://aveo-cafe-lounge.netlify.app

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 