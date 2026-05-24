import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'

import Home from './pages/Home.jsx'
import Analyze from './pages/Analyze.jsx'
import Features from './pages/Features.jsx'
import Developer from './pages/Developer.jsx'
import About from './pages/About.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/features" element={<Features />} />
        <Route path="/developer" element={<Developer />} />
        <Route path="/about" element={<About />} />
      </Routes>
      <Footer />
    </div>
  )
}
