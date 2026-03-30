import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import VideoCard from '../components/VideoCard';
import { History as HistoryIcon } from 'lucide-react';

const History = () => {
  const [historyVideos, setHistoryVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get('/users/watch-history');
        // The watch history array is chronological in MongoDB, but we want newest first, so we reverse it
        setHistoryVideos(res.data.data.reverse() || []);
      } catch (err) {
        console.error("Failed to fetch watch history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px', color: 'var(--text-secondary)'}}>Loading history...</div>;

  return (
    <div className="home-container" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
         <HistoryIcon size={28} />
         <h2 style={{ margin: 0 }}>Watch History</h2>
      </div>

      {historyVideos.length > 0 ? (
        <motion.div 
          className="video-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {historyVideos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </motion.div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text-secondary)' }}>
          <HistoryIcon size={64} style={{ opacity: 0.5, marginBottom: '20px' }} />
          <h3>Keep track of what you watch</h3>
          <p>Videos you watch will show up here.</p>
        </div>
      )}
    </div>
  );
};

export default History;
