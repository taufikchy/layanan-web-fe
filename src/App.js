import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Layout from './Layout';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import Dashboard from './Dashboard';
import Barang from './Barang';
import TransaksiMasuk from './TransaksiMasuk';
import TransaksiKeluar from './TransaksiKeluar';
import StokOpname from './StokOpname';
import Categories from './Categories';
import Locations from './Locations';
import Suppliers from './Suppliers';
import Users from './Users';
import ActivityLogs from './ActivityLogs';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/barang" element={<Layout><Barang /></Layout>} />
          <Route path="/transaksi-masuk" element={<Layout><TransaksiMasuk /></Layout>} />
          <Route path="/transaksi-keluar" element={<Layout><TransaksiKeluar /></Layout>} />
          <Route path="/stok-opname" element={<Layout><StokOpname /></Layout>} />
          <Route path="/categories" element={<Layout><Categories /></Layout>} />
          <Route path="/locations" element={<Layout><Locations /></Layout>} />
          <Route path="/suppliers" element={<Layout><Suppliers /></Layout>} />
          <Route path="/users" element={<Layout><Users /></Layout>} />
          <Route path="/activity-logs" element={<Layout><ActivityLogs /></Layout>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
