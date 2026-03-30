import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Users } from 'lucide-react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [videos, setVideos] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      try {
        setLoading(true);
        // Execute both searches parallel
        const [videoRes, userRes] = await Promise.all([
          api.get(`/videos?query=${encodeURIComponent(query)}`),
          api.get(`/users/search?query=${encodeURIComponent(query)}`)
        ]);
        
        setVideos(videoRes.data.data || []);
        setChannels(userRes.data.data || []);
      } catch (error) {
        console.error("Failed to fetch search results", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const handleSubscribe = async (channelId, index) => {
      try {
          const res = await api.post(`/subscriptions/c/${channelId}`);
          const isSubscribedNow = res.data.data.isSubscribed;
          
          const newChannels = [...channels];
          newChannels[index].isSubscribed = isSubscribedNow;
          newChannels[index].subscribersCount += isSubscribedNow ? 1 : -1;
          setChannels(newChannels);
      } catch (e) {
          console.error("Failed to toggle subscription", e);
      }
  };

  return (
    <div className="home-container" style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Search results for "{query}"</h2>
      
      {loading ? (
        <div style={{textAlign: 'center', marginTop: '50px', color: 'var(--text-secondary)'}}>Searching...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* Channels Section */}
          {channels.length > 0 && (
              <div>
                  <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Channels</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {channels.map((channel, idx) => (
                          <motion.div 
                             key={channel._id}
                             whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.05)' }}
                             style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                          >
                             <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }} onClick={() => navigate(`/c/${channel.username}`)}>
                                 <img src={channel.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=u"} alt={channel.fullname} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                                 <div>
                                     <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{channel.fullname}</h3>
                                     <p style={{ margin: '5px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>@{channel.username} • {channel.subscribersCount} subscribers</p>
                                 </div>
                             </div>
                             
                             {user && user.username !== channel.username && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleSubscribe(channel._id, idx); }}
                                  className={channel.isSubscribed ? "btn-secondary" : "btn-primary"} 
                                  style={{ padding: '10px 20px', borderRadius: '20px' }}
                                >
                                  {channel.isSubscribed ? "Subscribed" : "Subscribe"}
                                </button>
                             )}
                          </motion.div>
                      ))}
                  </div>
              </div>
          )}

          {/* Videos Section */}
          <div>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>Videos</h3>
              {videos.length > 0 ? (
                  <motion.div 
                    className="video-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                  >
                    {videos.map(video => (
                      <VideoCard key={video._id} video={video} />
                    ))}
                  </motion.div>
              ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>No matching videos found.</p>
              )}
          </div>

          {channels.length === 0 && videos.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
                  No results found for your search query. Try different keywords.
              </div>
          )}

        </div>
      )}
    </div>
  );
};

export default SearchResults;
