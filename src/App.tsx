import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Chat } from './pages/Chat';
import { Documents } from './pages/Documents';
import { Prompts } from './pages/Prompts';
import { Integrations } from './pages/Integrations';
import { Workflows } from './pages/Workflows';
import { Analytics } from './pages/Analytics';
import { AuditLogs } from './pages/AuditLogs';
import { MeetingCopilot } from './pages/MeetingCopilot';
import { Settings } from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="chat/new" element={<Chat />} />
          <Route path="search" element={<Chat />} /> {/* Reusing Chat for search concept for now */}
          <Route path="documents" element={<Documents />} />
          <Route path="prompts" element={<Prompts />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="workflows" element={<Workflows />} />
          <Route path="meetings" element={<MeetingCopilot />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Settings />} /> {/* Direct to settings for profile */}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
