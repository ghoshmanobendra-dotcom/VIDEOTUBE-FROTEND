import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';

const Home = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const CATEGORIES = ["All", "Gaming", "Music", "Live", "Projects", "AI", "Podcasts", "News", "Daily Info", "Other"];

  const trendingVideo = videos.length > 0 
    ? [...videos].sort((a, b) => (b.views || 0) - (a.views || 0))[0] 
    : null;

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const url = selectedCategory === "All" ? '/videos' : `/videos?category=${encodeURIComponent(selectedCategory)}`;
        const response = await api.get(url);
        setVideos(response.data.data);
      } catch (error) {
        console.error("Failed to fetch videos", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [selectedCategory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="home-container">
      {/* Featured Hero Banner */}
      {trendingVideo && (
      <div 
        className="hero-banner"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(11, 13, 20, 0.9) 0%, rgba(11, 13, 20, 0.2) 100%), url(${trendingVideo.thumbnail || trendingVideo.thumbnailUrl || 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&q=80&w=1200'})`
        }}
      >
        <div className="hero-banner-content">
            <span className="hero-tag">TRENDING NOW</span>
            <h1>{trendingVideo.title}</h1>
            <div className="hero-actions">
                <button 
                  className="watch-now-btn"
                  onClick={() => navigate(`/watch/${trendingVideo._id || trendingVideo.id}`)}
                >
                    <Play size={20} fill="black" /> Watch Now
                </button>
                <div 
                  className="hero-owner"
                  onClick={(e) => { e.stopPropagation(); if (trendingVideo.owner?.username) navigate(`/c/${trendingVideo.owner.username}`); }}
                >
                    <img 
                      src={trendingVideo.owner?.avatar || trendingVideo.channelAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} 
                      alt={trendingVideo.owner?.fullname || trendingVideo.channelName || "Channel Avatar"}
                    />
                    <div className="hero-owner-info">
                       <span className="hero-owner-name">
                          {trendingVideo.owner?.fullname || trendingVideo.channelName || "Unknown Channel"}
                       </span>
                       <span className="hero-owner-views">
                          {trendingVideo.views || 0} views
                       </span>
                    </div>
                </div>
            </div>
        </div>
      </div>
      )}

      <div className="categories-bar">
        {CATEGORIES.map((cat, idx) => (
          <motion.div 
            key={idx} 
            className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </motion.div>
        ))}
      </div>
      
      {loading ? (
        <div style={{textAlign: 'center', marginTop: '50px', color: 'var(--text-secondary)'}}>Loading videos...</div>
      ) : (
        <motion.div 
          className="video-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {videos.length > 0 ? (
            videos.map(video => (
              <VideoCard key={video._id || video.id} video={video} />
            ))
          ) : (
            <p style={{color: 'var(--text-secondary)'}}>No videos found in the database. Be the first to upload!</p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Home;
