import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Settings as SettingsIcon, Users, UserPlus, Share2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';

const ChannelVideoRow = ({ video, isOwner, onEdit, onDelete, onAnalyze }) => {
    const navigate = useNavigate();
    const [likes, setLikes] = useState(0);

    useEffect(() => {
        api.get(`/likes/${video._id}`).then(res => {
            setLikes(res.data.data.count);
        }).catch(() => {});
    }, [video._id]);

    return (
       <div onClick={() => navigate(`/watch/${video._id}`)} style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '20px', overflow: 'hidden', padding: '15px', gap: '25px', cursor: 'pointer', border: '1px solid var(--border-color)', alignItems: 'center', transition: 'all 0.3s' }} onMouseOver={e => e.currentTarget.style.borderColor='rgba(162,122,255,0.4)'} onMouseOut={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.05)'}>
           <img src={video.thumbnail || "https://picsum.photos/300/170"} style={{ width: '280px', height: '160px', objectFit: 'cover', borderRadius: '12px' }} />
           <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
               <h3 style={{ fontSize: '1.4rem', margin: '0 0 10px 0' }}>{video.title}</h3>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0 0 15px 0' }}>{video.description || "A breathtaking exploration of visual arts..."}</p>
               <div style={{ display: 'flex', gap: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                   <span>👁 {video.views || 0} views</span>
                   <span>♥ {likes} likes</span>
                   <span>📅 {new Date(video.createdAt || Date.now()).toLocaleDateString()}</span>
               </div>
           </div>
           
           <div style={{ display: 'flex', gap: '15px', paddingRight: '20px' }}>
               {isOwner && (
                   <>
                   <button onClick={(e) => { e.stopPropagation(); onAnalyze(video); }} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-color)', padding: '10px 20px', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer' }}>~ Analyze</button>
                   <button onClick={(e) => { e.stopPropagation(); onEdit(video); }} style={{ background: 'var(--accent-gradient)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer' }}>✎ Edit</button>
                   <button onClick={(e) => { e.stopPropagation(); onDelete(video._id); }} style={{ background: 'rgba(255,0,0,0.2)', color: '#ff4444', border: '1px solid rgba(255,0,0,0.3)', padding: '10px 20px', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer' }}>✖</button>
                   </>
               )}
           </div>
       </div>
    );
};

const Channel = () => {
  const { username } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  /** @type {any} */
  const [channelData, setChannelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  /** @type {any[]} */
  const [channelVideos, setChannelVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);

  const [editingVideo, setEditingVideo] = useState(null);
  const [analyzingVideo, setAnalyzingVideo] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [editFile, setEditFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchChannelAndVideos = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/users/c/${username}`);
        const channelUser = res.data.data;
        setChannelData(channelUser);
        
        setVideosLoading(true);
        const videosRes = await api.get(`/videos?userId=${channelUser._id}`);
        setChannelVideos(videosRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Channel not found');
      } finally {
        setLoading(false);
        setVideosLoading(false);
      }
    };
    if (username) fetchChannelAndVideos();
  }, [username]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSubscribe = async () => {
      if (!user) return navigate("/login");
      try {
          const res = await api.post(`/subscriptions/c/${channelData._id}`);
          const isSubscribedNow = res.data.data.isSubscribed;
          setChannelData(prev => ({
              ...prev,
              isSubscribed: isSubscribedNow,
              subscribersCount: isSubscribedNow ? prev.subscribersCount + 1 : prev.subscribersCount - 1
          }));
      } catch (e) {
          console.error("Failed to toggle subscription", e);
      }
  };

  const handleShareProfile = async () => {
      const shareUrl = window.location.href;
      if (navigator.share) {
          try {
              await navigator.share({
                  title: `${channelData.fullname} on Videotube`,
                  text: `Check out @${channelData.username}'s channel on Videotube!`,
                  url: shareUrl
              });
          } catch (error) {
              console.error('Error sharing:', error);
          }
      } else {
          try {
              await navigator.clipboard.writeText(shareUrl);
              alert("Channel link copied to clipboard!");
          } catch (err) {
              console.error('Failed to copy text: ', err);
          }
      }
  };

  const handleEditClick = (video) => {
      setEditForm({ title: video.title, description: video.description || '' });
      setEditFile(null);
      setEditingVideo(video);
  };

  const handleAnalyzeClick = (video) => {
      setAnalyzingVideo(video);
  };

  const handleSaveEdit = async () => {
      setIsSaving(true);
      try {
          const formData = new FormData();
          formData.append("title", editForm.title);
          formData.append("description", editForm.description);
          if (editFile) formData.append("thumbnail", editFile);
          
          const res = await api.patch(`/videos/${editingVideo._id}`, formData);
          setChannelVideos(prev => prev.map(v => v._id === editingVideo._id ? res.data.data : v));
          setEditingVideo(null);
      } catch (e) {
          alert("Failed to update video");
      } finally {
          setIsSaving(false);
      }
  };
  
  const handleDeleteVideo = async (videoId) => {
      if (!window.confirm("Are you sure you want to delete this video?")) return;
      try {
          await api.delete(`/videos/${videoId}`);
          setChannelVideos(prev => prev.filter(v => v._id !== videoId));
      } catch (e) {
          alert("Failed to delete video");
      }
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px', color: 'var(--text-secondary)'}}>Loading Channel...</div>;
  if (error) return <div style={{textAlign: 'center', marginTop: '50px', color: 'red'}}>{error}</div>;
  if (!channelData) return null;

  const isOwner = user?.username === channelData.username;
  const totalViews = channelVideos.reduce((acc, v) => acc + (v.views || 0), 0);
  const formatCompact = (num) => num >= 1000000 ? (num/1000000).toFixed(1)+'M' : num >= 1000 ? (num/1000).toFixed(1)+'K' : num;

  return (
    <div className="channel-container" style={{ padding: '0 2rem' }}>
      
      {/* Profile Card Info Section */}
      <motion.div 
        className="channel-header"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{ 
            background: `linear-gradient(to right, rgba(11, 13, 20, 0.95) 0%, rgba(11, 13, 20, 0.6) 100%), url(${channelData.coverImage || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80"})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            marginTop: '2rem', 
            padding: '3rem', 
            borderRadius: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            border: '1px solid var(--border-color)',
            position: 'relative',
            overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative' }}>
          <img src={channelData.avatar} alt={channelData.fullname} style={{ width: '160px', height: '160px', borderRadius: '50%', border: '4px solid #00e5ff', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: '#00e5ff', color: 'black', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', border: '3px solid var(--bg-secondary)' }}>✓</div>
        </div>
        
        <div className="channel-info" style={{ marginTop: 0, flex: 1 }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800' }}>{channelData.fullname}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
             <span style={{ color: '#a27aff' }}>@{channelData.username}</span> • Videotube Creator
          </p>
          
          <div style={{ display: 'flex', gap: '15px' }}>
             <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px 25px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', border: '1px solid var(--border-color)' }}>
                 <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>SUBSCRIBERS</span>
                 <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#00e5ff' }}>{channelData.subscribersCount >= 1000 ? (channelData.subscribersCount/1000).toFixed(1)+'K' : channelData.subscribersCount}</span>
             </div>
             <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px 25px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', border: '1px solid var(--border-color)' }}>
                 <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>TOTAL VIEWS</span>
                 <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'white' }}>{formatCompact(totalViews)}</span>
             </div>
             <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px 25px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', border: '1px solid var(--border-color)' }}>
                 <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>VIDEOS</span>
                 <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'white' }}>{channelVideos.length}</span>
             </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignSelf: 'center' }}>
            {isOwner ? (
                <>
                <button style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '30px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s' }} onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.2)'} onMouseOut={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'} onClick={() => navigate('/settings')}>
                    <SettingsIcon size={18} /> Edit Profile
                </button>
                <button style={{ background: 'rgba(255,100,100,0.1)', color: '#ff4b4b', border: '1px solid rgba(255,100,100,0.3)', padding: '14px 28px', borderRadius: '30px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s' }} onMouseOver={e => e.currentTarget.style.background='rgba(255,100,100,0.2)'} onMouseOut={e => e.currentTarget.style.background='rgba(255,100,100,0.1)'} onClick={handleLogout}>
                    <LogOut size={18} /> Logout
                </button>
                </>
            ) : (
                <button 
                  style={{ background: channelData.isSubscribed ? 'rgba(255,255,255,0.1)' : 'var(--accent-gradient)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '30px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s' }}
                  onMouseOver={e => { if(!channelData.isSubscribed) { e.currentTarget.style.transform='scale(1.05)'; e.currentTarget.style.boxShadow='0 5px 15px rgba(162,122,255,0.4)'; } }}
                  onMouseOut={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='none'; }}
                  onClick={handleSubscribe}
                >
                  <UserPlus size={18} /> {channelData.isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
            )}
            <button style={{ background: isOwner ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.1)', color: 'white', border: isOwner ? 'none' : '1px solid rgba(255,255,255,0.2)', padding: '14px 28px', borderRadius: '30px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s' }} 
              onMouseOver={e => { e.currentTarget.style.transform='scale(1.05)'; }}
              onMouseOut={e => { e.currentTarget.style.transform='scale(1)'; }}
              onClick={handleShareProfile}>
                <Share2 size={18} /> Share
            </button>
        </div>
      </motion.div>

      {/* Uploaded Videos List */}
      <div style={{ marginTop: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
           <div style={{ width: '30px', height: '4px', background: '#00e5ff', borderRadius: '2px' }}></div>
           <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Recent Creations</h3>
        </div>
        
        {videosLoading ? (
            <p style={{color: 'var(--text-secondary)'}}>Loading videos...</p>
        ) : channelVideos.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
               {channelVideos.map(video => (
                   <ChannelVideoRow key={video._id} video={video} isOwner={isOwner} onEdit={handleEditClick} onDelete={handleDeleteVideo} onAnalyze={handleAnalyzeClick} />
               ))}
            </div>
        ) : (
            <p style={{color: 'var(--text-secondary)', marginBottom: '30px', textAlign: 'center'}}>
              This channel has not uploaded any videos yet.
            </p>
        )}
      </div>

      {/* Edit Video Modal */}
      {editingVideo && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '500px', border: '1px solid var(--border-color)' }}>
                  <h2 style={{ marginBottom: '20px', color: 'white' }}>Edit Video</h2>
                  <div className="input-group" style={{ marginBottom: '15px' }}>
                     <input type="text" required value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                     <label>Title</label>
                  </div>
                  <div className="input-group" style={{ marginBottom: '15px' }}>
                     <input type="text" required value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                     <label>Description</label>
                  </div>
                  <div style={{ marginBottom: '25px' }}>
                     <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Update Thumbnail (optional)</label>
                     <input type="file" accept="image/*" onChange={e => setEditFile(e.target.files[0])} style={{ color: 'white' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                     <button onClick={() => setEditingVideo(null)} style={{ background: 'transparent', color: 'white', border: '1px solid var(--border-color)', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer' }}>Cancel</button>
                     <button onClick={handleSaveEdit} disabled={isSaving} style={{ background: 'var(--accent-gradient)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>{isSaving ? "Saving..." : "Save Changes"}</button>
                  </div>
              </div>
          </div>
      )}

      {/* Analyze Video Modal */}
      {analyzingVideo && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }} onClick={() => setAnalyzingVideo(null)}>
              <div style={{ background: 'var(--bg-secondary)', padding: '40px', borderRadius: '24px', width: '90%', maxWidth: '700px', border: '1px solid var(--border-color)', position: 'relative' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                      <h2 style={{ color: 'white', margin: 0 }}>Analytics: {analyzingVideo.title}</h2>
                      <button onClick={() => setAnalyzingVideo(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>✖</button>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 200px', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', letterSpacing: '1px' }}>TOTAL VIEWS</span>
                          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#00e5ff', marginTop: '10px' }}>{analyzingVideo.views || 0}</div>
                      </div>
                      <div style={{ flex: '1 1 200px', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', letterSpacing: '1px' }}>UPLOADED</span>
                          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'white', marginTop: '10px' }}>{new Date(analyzingVideo.createdAt).toLocaleDateString()}</div>
                      </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border-color)' }}>
                      <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>Views Over Time (Last 7 Days)</h3>
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', padding: '0 10px' }}>
                          {[0.15, 0.3, 0.45, 0.55, 0.7, 0.85, 1.0].map((val, idx) => (
                              <div key={idx} style={{ width: '40px', background: 'var(--accent-gradient)', height: `${val * 100}%`, borderRadius: '4px 4px 0 0', opacity: 0.6 + (val * 0.4), transition: 'height 1s ease-out' }}></div>
                          ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '0 10px' }}>
                          {['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Today'].map(d => <span key={d}>{d}</span>)}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Channel;
