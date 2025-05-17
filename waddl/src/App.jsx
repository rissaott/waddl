import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import GetStarted from './pages/GetStarted';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/edit" element={<GetStarted />} />
      </Routes>
    </Router>
  );
}

export default App;