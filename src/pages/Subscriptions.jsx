import { useState, useEffect } from 'react';
import VideoCard from '../components/VideoCard';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Subscriptions = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSubscribedVideos = async () => {
      try {
        const response = await api.get('/videos/subscriptions');
        setVideos(response.data.data);
      } catch (error) {
        console.error("Failed to fetch subscribed videos", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
        fetchSubscribedVideos();
    } else {
        setLoading(false);
    }
  }, [user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  if (!user) {
      return (
          <div className="home-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
              <h2>Please login to see your subscriptions.</h2>
          </div>
      );
  }

  return (
    <div className="home-container">
      <h2 style={{ marginBottom: '20px', marginLeft: '10px' }}>Latest from your Subscriptions</h2>
      
      {loading ? (
        <div style={{textAlign: 'center', marginTop: '50px', color: 'var(--text-secondary)'}}>Loading subscriptions...</div>
      ) : (
        <motion.div 
          className="video-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {videos.length > 0 ? (
            videos.map(video => (
              <VideoCard key={video._id} video={video} />
            ))
          ) : (
            <p style={{color: 'var(--text-secondary)', marginLeft: '10px'}}>You haven't subscribed to anyone yet, or they haven't uploaded any videos!</p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Subscriptions;
