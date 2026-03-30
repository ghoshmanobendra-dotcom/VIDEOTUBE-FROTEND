import { useState, useEffect } from 'react';
import { Menu, Search, Video, Bell, LogOut, Settings as SettingsIcon, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Navbar = ({ setSidebarOpen, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if(!user) return;
    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data.data);
        } catch (e) {
            console.error("Failed to fetch notifications", e);
        }
    }
    fetchNotifications();
    
    // Poll every 30 seconds for live feel
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (notif) => {
    setShowNotifications(false);
    if (!notif.isRead) {
        try {
            await api.patch(`/notifications/${notif._id}/read`);
            setNotifications(prev => prev.map(n => n._id === notif._id ? {...n, isRead:true} : n));
        } catch(e) {}
    }
    if (notif.video?._id) navigate(`/watch/${notif.video._id}`);
  };

  const markAllRead = async () => {
      try {
          await api.patch('/notifications/mark-read');
          setNotifications(prev => prev.map(n => ({...n, isRead: true})));
      } catch(e) {}
  };


  return (
    <nav className="navbar">
      <div className="navbar-left">
        <motion.button 
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="menu-btn"
          title="Go Back"
          style={{ marginRight: '10px' }}
        >
          <ArrowLeft size={24} />
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="menu-btn"
        >
          <Menu size={24} />
        </motion.button>
        <Link to="/" className="logo-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', marginLeft: '10px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            The Kinetic Dimension
          </span>
          <h2>VIDEOTUBE</h2>
        </Link>
      </div>

      <div className="navbar-center">
        <form 
          className="search-box" 
          onSubmit={(e) => {
             e.preventDefault();
             if(searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
          }}
        >
          <input 
             type="text" 
             placeholder="Search videos or users..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" title="Search">
            <Search size={20} />
          </button>
        </form>
      </div>

      <div className="navbar-right">
        
        <div style={{ position: 'relative' }}>
            <motion.div 
                whileHover={{ scale: 1.1, rotate: -10 }} 
                className="icon-btn bell-icon"
                onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={24} />
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </motion.div>
            
            {showNotifications && (
                <div style={{ position: 'absolute', right: '-50px', top: '40px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: '12px', width: '300px', maxHeight: '400px', overflowY: 'auto', zIndex: 100, padding: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Notifications</h3>
                        {unreadCount > 0 && <span onClick={markAllRead} style={{ fontSize: '0.8rem', color: 'var(--accent-color)', cursor: 'pointer' }}>Mark all read</span>}
                    </div>
                    {notifications.length === 0 ? <div style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '20px'}}>No notifications</div> :
                        notifications.map(notif => (
                            <div key={notif._id} onClick={() => handleNotificationClick(notif)} style={{ display: 'flex', gap: '10px', padding: '10px', borderRadius: '8px', cursor: 'pointer', background: notif.isRead ? 'transparent' : 'rgba(255,255,255,0.05)', marginBottom: '5px' }}>
                                <img src={notif.sender?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.2' }}><b>{notif.sender?.fullname}</b> {notif.message}</p>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(notif.createdAt).toLocaleDateString()}</span>
                                </div>
                                {notif.video?.thumbnail && <img src={notif.video.thumbnail} style={{ width: '60px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />}
                            </div>
                        ))
                    }
                </div>
            )}
        </div>
        
        {user ? (
          <div style={{ position: 'relative' }}>
            <motion.img 
              onClick={() => navigate(`/c/${user.username}`)}
              whileHover={{ scale: 1.1, zIndex: 10, boxShadow: "0px 0px 15px rgba(255, 0, 0, 0.5)" }}
              src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
              alt="User" 
              className="user-profile"
              style={{ cursor: 'pointer' }}
            />
          </div>
        ) : (
          <Link to="/login" className="btn-primary" style={{padding: '8px 15px', textDecoration: 'none', borderRadius: '20px'}}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
