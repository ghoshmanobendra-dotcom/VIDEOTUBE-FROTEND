import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import VideoCard from '../components/VideoCard';
import { ThumbsUp } from 'lucide-react';

const LikedVideos = () => {
  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        setLoading(true);
        const res = await api.get('/likes/videos/liked');
        setLikedVideos(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch liked videos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedVideos();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px', color: 'var(--text-secondary)'}}>Loading liked videos...</div>;

  return (
    <div className="home-container" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
         <ThumbsUp size={28} />
         <h2 style={{ margin: 0 }}>Liked Videos</h2>
      </div>

      {likedVideos.length > 0 ? (
        <motion.div 
          className="video-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {likedVideos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </motion.div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text-secondary)' }}>
          <ThumbsUp size={64} style={{ opacity: 0.5, marginBottom: '20px' }} />
          <h3>No liked videos yet</h3>
          <p>Videos you like will show up here.</p>
        </div>
      )}
    </div>
  );
};

export default LikedVideos;
