import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import About from './pages/About';
import Contact from './pages/Contact';
import InventoryPage from './pages/InventoryPage'; // Import the new page
import TableLayout from './pages/TableLayout'; // Import the Table Layout page
import OrderTakingPage from './pages/OrderTakingPage'; // Import the Order Taking page
import InvoicePage from './pages/InvoicePage';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/inventory" element={<InventoryPage />} /> {/* Add route for Inventory Page */}
          <Route path="/tables" element={<TableLayout />} /> {/* Add route for Table Layout Page */}
          <Route path="/order" element={<OrderTakingPage />} /> {/* Add route for Order Taking Page */}
          <Route path="/invoice" element={<InvoicePage />} />
          {/* Add other routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
