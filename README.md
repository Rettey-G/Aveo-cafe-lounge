# Aveo Cafe Management System

A comprehensive cafe management system built with the MERN stack (MongoDB, Express.js, React, Node.js).

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
- MongoDB (local or Atlas)
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

4. Update the `.env` file with your MongoDB connection string and other configurations.

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

4. Update the `.env` file with your backend API URL.

5. Start the frontend development server:
   ```bash
   npm start
   ```

## MongoDB Setup

### Option 1: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/aveo-cafe`

### Option 2: MongoDB Atlas

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Add your IP address to the whitelist
4. Get your connection string and update it in the backend `.env` file

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

- Backend runs on: http://localhost:5000
- Frontend runs on: http://localhost:3000

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 