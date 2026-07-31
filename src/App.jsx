import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StudyProvider } from './context/StudyContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Assistant from './pages/Assistant';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import HealthCheck from "./pages/HealthCheck";



function App() {
  return (
    <StudyProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/analytics" element={<Analytics />} />
          {/* Fallback route */}
          <Route path="*" element={<Landing />} />
          <Route path="/health" element={<HealthCheck />} />
        </Routes>
      </Router>
    </StudyProvider>
  );
}

export default App;
