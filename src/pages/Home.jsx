import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { avatarUrl, ensureHttps } from '../utils/cloudinary';

// ---------------------------------------------------------------------------
// Skeleton loader — renders immediately while /videos is in flight.
// Prevents layout shift and eliminates the blank-page "dead time" that
// inflates the LCP measurement.
// ---------------------------------------------------------------------------
const VideoCardSkeleton = () => (
  <div className="video-card skeleton-card" aria-hidden="true">
    <div className="skeleton-thumbnail" />
    <div className="video-info" style={{ padding: '0 15px 15px 15px' }}>
      <div className="skeleton-avatar" />
      <div className="video-details">
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line skeleton-meta" />
        <div className="skeleton-line skeleton-meta short" />
      </div>
    </div>
  </div>
);

const SKELETON_COUNT = 8;

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
    // Video fetch is completely independent of auth — no waterfall.
    // The skeleton grid shows immediately; content swaps in once the
    // /videos response arrives.
    let cancelled = false;
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const url = selectedCategory === "All"
          ? '/videos'
          : `/videos?category=${encodeURIComponent(selectedCategory)}`;
        const response = await api.get(url);
        if (!cancelled) setVideos(response.data.data);
      } catch (error) {
        if (!cancelled) console.warn("Failed to fetch videos", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchVideos();
    return () => { cancelled = true; };
  }, [selectedCategory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  };

  return (
    <div className="home-container">
      {/* Featured Hero Banner — only shows once data arrives */}
      {trendingVideo && (
        <div
          className="hero-banner"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(11, 13, 20, 0.9) 0%, rgba(11, 13, 20, 0.2) 100%), url(${ensureHttps(trendingVideo.thumbnail || trendingVideo.thumbnailUrl || 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&q=80&w=1200')})`
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
                  src={avatarUrl(trendingVideo.owner?.avatar || trendingVideo.channelAvatar) || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"}
                  alt={trendingVideo.owner?.fullname || trendingVideo.channelName || "Channel Avatar"}
                  width="48"
                  height="48"
                  loading="eager"
                  fetchpriority="high"
                  decoding="async"
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
        /* Skeleton grid — renders instantly, matches real card layout to minimise CLS */
        <div className="video-grid" aria-label="Loading videos…">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          className="video-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {videos.length > 0 ? (
            videos.map((video, index) => (
              <VideoCard
                key={video._id || video.id}
                video={video}
                priority={index === 0}   /* first card = LCP element */
              />
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)', gridColumn: '1/-1' }}>
              No videos found in the database. Be the first to upload!
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Home;
