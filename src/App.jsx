import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import Channel from './pages/Channel';
import Upload from './pages/Upload';
import VideoPlayer from './pages/VideoPlayer';
import Subscriptions from './pages/Subscriptions';
import SearchResults from './pages/SearchResults';
import History from './pages/History';
import LikedVideos from './pages/LikedVideos';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return <div style={{textAlign: 'center', marginTop: '50px', color: 'var(--text-secondary)'}}>Verifying session...</div>;
  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  return children;
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-container">
      <Navbar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
      <div className="main-content">
        <Sidebar isOpen={sidebarOpen} />
        <div className={`page-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/c/:username" element={<Channel />} />
            <Route path="/search" element={<SearchResults />} />
            
            {/* Protected Routes */}
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
            <Route path="/watch/:videoId" element={<ProtectedRoute><VideoPlayer /></ProtectedRoute>} />
            <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/liked" element={<ProtectedRoute><LikedVideos /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
