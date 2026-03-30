import { motion } from 'framer-motion';
import { MoreVertical, Flag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../api/axios';

const VideoCard = ({ video }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const thumbnailUrl = video.thumbnail || video.thumbnailUrl || "https://picsum.photos/600/340";
  const channelAvatar = video.owner?.avatar || video.channelAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user";
  const channelName = video.owner?.fullname || video.channelName || "Unknown Channel";
  
  let formattedDuration = video.duration || "0:00";
  if (typeof video.duration === 'number') {
      const minutes = Math.floor(video.duration / 60);
      const seconds = Math.floor(video.duration % 60);
      formattedDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  let uploadTime = video.uploadTime || "Recently";
  if (video.createdAt) {
      const hours = Math.floor((new Date() - new Date(video.createdAt)) / (1000 * 60 * 60));
      if (hours < 24) uploadTime = `${hours || 1} hours ago`;
      else uploadTime = `${Math.floor(hours/24)} days ago`;
  }

  const handleReport = async (e) => {
      e.stopPropagation();
      setMenuOpen(false);
      try {
          const res = await api.post(`/videos/report/${video._id}`);
          if(res.data.data.deleted) {
              alert("This video has been removed due to multiple reports.");
              window.location.reload(); // Refresh to remove from list trivially
          } else {
              alert(res.data.message || "Video reported successfully.");
          }
      } catch(err) {
          alert(err.response?.data?.message || "Failed to report video");
      }
  };

  return (
    <motion.div 
      className="video-card"
      onClick={() => navigate(`/watch/${video._id || video.id}`)}
      whileHover={{ scale: 1.05, translateY: -10, boxShadow: "0px 20px 30px rgba(0,0,0,0.5)" }}
      initial={{ opacity: 0, y: 50, rotateX: 20 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
    >
      <div className="thumbnail-container">
        <motion.img 
          src={thumbnailUrl} 
          alt={video.title} 
          className="thumbnail"
        />
        <span className="duration">{formattedDuration}</span>
      </div>
      
      <div className="video-info">
        <img 
           src={channelAvatar} 
           alt={channelName} 
           className="channel-avatar" 
           onClick={(e) => { e.stopPropagation(); if(video.owner?.username) navigate(`/c/${video.owner.username}`); }}
           style={{ cursor: 'pointer' }}
        />
        <div className="video-details">
          <h4>{video.title}</h4>
          <p 
            className="channel-name" 
            onClick={(e) => { e.stopPropagation(); if(video.owner?.username) navigate(`/c/${video.owner.username}`); }}
            style={{ cursor: 'pointer' }}
          >
            {channelName}
          </p>
          <div className="video-stats">
            <span>{video.views || 0} views</span>
            <span className="dot">•</span>
            <span>{uploadTime}</span>
          </div>
        </div>
        
        <div style={{ position: 'relative' }}>
            <motion.div 
              whileHover={{ scale: 1.2, rotate: 90 }} 
              className="more-options"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            >
              <MoreVertical size={20} />
            </motion.div>
            
            {menuOpen && (
                <div 
                   style={{ position: 'absolute', right: 0, top: '25px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '5px', zIndex: 10, boxShadow: '0 4px 10px rgba(0,0,0,0.5)', width: '120px' }}
                >
                    <div 
       onClick={handleReport}
                       style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', cursor: 'pointer', borderRadius: '4px', color: '#ff4444', fontSize: '0.9rem' }}
                       onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                       onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <Flag size={16} /> Report
                    </div>
                </div>
            )}
        </div>
      </div>
    </motion.div>
  );
};

export default VideoCard;
