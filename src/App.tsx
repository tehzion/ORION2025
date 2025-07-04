import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './components/auth/LoginPage';
import ProjectDashboard from './components/dashboard/ProjectDashboard';
import { ProjectManagement } from './components/projects/ProjectManagement';
import ElevatorInterface from './components/elevator/ElevatorInterface';
import SupportPage from './components/support/SupportPage';
import ProfileSettings from './components/profile/ProfileSettings';
import TeamDashboard from './components/team/TeamDashboard';
import SystemSettings from './components/admin/SystemSettings';
import ChatSystem from './components/chat/ChatSystem';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<MainLayout />}>
              <Route index element={<ProjectDashboard onProjectSelect={() => {}} />} />
              <Route path="projects" element={<ProjectManagement />} />
              <Route path="elevator" element={<ElevatorInterface />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="profile" element={<ProfileSettings />} />
              <Route path="team" element={<TeamDashboard />} />
              <Route path="admin" element={<SystemSettings />} />
              <Route path="chat" element={<ChatSystem />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;