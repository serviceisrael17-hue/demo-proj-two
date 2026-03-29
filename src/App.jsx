import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ProductMaster from './pages/ProductMaster';
import SalesInvoice from './pages/SalesInvoice';

function Home() {
  return (
    <div className="home-screen" style={{textAlign: 'center', marginTop: '60px'}}>
      <h1>Welcome to Easy Trade</h1>
      <p>Select an option from the menu: <strong>Product Master</strong> to add items, <strong>Sales Invoice</strong> to trade.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <nav className="top-nav">
          <div className="nav-brand">Easy Trade</div>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/products">Product Master</Link>
            <Link to="/sales">Sales Invoice</Link>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductMaster />} />
            <Route path="/sales" element={<SalesInvoice />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
