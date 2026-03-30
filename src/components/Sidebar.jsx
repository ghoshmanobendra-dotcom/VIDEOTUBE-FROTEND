import { Home, PlaySquare, ThumbsUp, History, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <Home />, text: 'Home', to: '/' },
    { icon: <PlaySquare />, text: 'Subscriptions', to: '/subscriptions' },
    { divider: true },
    { icon: <History />, text: 'History', to: '/history' },
    { icon: <ThumbsUp />, text: 'Liked Videos', to: '/liked' },
  ];

  const variants = {
    open: { x: 0, opacity: 1, rotateY: 0, transition: { type: "spring", stiffness: 100 } },
    closed: { x: "-100%", opacity: 0, rotateY: 45, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div 
      className="sidebar"
      initial="open"
      animate={isOpen ? "open" : "closed"}
      variants={variants}
    >
      <div className="sidebar-menus">
        {menuItems.map((item, index) => (
          item.divider ? 
            <hr key={index} className="sidebar-divider" /> :
            <motion.div 
              key={index} 
              onClick={() => item.to && navigate(item.to)}
              className={`sidebar-item ${location.pathname === item.to ? 'active' : ''}`}
              style={{ cursor: item.to ? 'pointer' : 'default' }}
              whileTap={{ scale: 0.95 }}
            >
              {item.icon}
              <span>{item.text}</span>
            </motion.div>
        ))}
        <div style={{ flexGrow: 1 }} />
        <button className="sidebar-upload-btn" onClick={() => navigate('/upload')}>
          <Upload size={20} />
          Upload Video
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
