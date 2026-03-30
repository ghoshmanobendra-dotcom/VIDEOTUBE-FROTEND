import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ThumbsUp, Share2, MessageSquare, Send, Trash2 } from 'lucide-react';

const VideoPlayer = () => {
  const { videoId } = useParams();
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(null);
  
  // States for interactive features
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [likeData, setLikeData] = useState({ count: 0, isLiked: false });
  const [channelInfo, setChannelInfo] = useState({ subscribersCount: 0, isSubscribed: false });
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (fetchedRef.current === videoId) return;
    fetchedRef.current = videoId;

    const fetchVideoData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/videos/${videoId}`);
        const video = res.data.data;
        setVideoData(video);

        // Fetch dependent data parallelly
        const [commentsRes, likesRes, channelRes] = await Promise.all([
            api.get(`/comments/${videoId}`),
            api.get(`/likes/${videoId}`),
            video.owner?.username ? api.get(`/users/c/${video.owner.username}`) : Promise.resolve({data:{data:{}}})
        ]);
        
        setComments(commentsRes.data.data || []);
        setLikeData(likesRes.data.data);
        if (channelRes.data.data.username) setChannelInfo(channelRes.data.data);

      } catch (err) {
        console.error("Error fetching video data", err);
        if (err.response?.status === 401) {
            alert("Please log in or register to view this shared video.");
            navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    if (videoId) fetchVideoData();
  }, [videoId, navigate]);

  const handleLike = async () => {
      if (!user) return navigate("/login");
      try {
          const res = await api.post(`/likes/${videoId}`);
          const isLikedNow = res.data.data.isLiked;
          setLikeData(prev => ({
              isLiked: isLikedNow,
              count: isLikedNow ? prev.count + 1 : prev.count - 1
          }));
      } catch (e) {
          console.error("Failed to toggle like", e);
      }
  };

  const handleSubscribe = async () => {
      if (!user) return navigate("/login");
      try {
          const res = await api.post(`/subscriptions/c/${videoData.owner._id}`);
          const isSubscribedNow = res.data.data.isSubscribed;
          setChannelInfo(prev => ({
              ...prev,
              isSubscribed: isSubscribedNow,
              subscribersCount: isSubscribedNow ? prev.subscribersCount + 1 : prev.subscribersCount - 1
          }));
      } catch (e) {
          console.error("Failed to toggle subscription", e);
      }
  };

  const handleComment = async (e) => {
      e.preventDefault();
      if (!user) return navigate("/login");
      if (!newComment.trim()) return;
      try {
          const res = await api.post(`/comments/${videoId}`, { content: newComment });
          setComments([res.data.data, ...comments]);
          setNewComment("");
      } catch (e) {
          console.error("Failed to post comment", e);
      }
  };

  const handleDelete = async () => {
      if(!window.confirm("Are you sure you want to permanently delete this video?")) return;
      try {
          await api.delete(`/videos/${videoId}`);
          alert("Video deleted successfully.");
          navigate("/");
      } catch (e) {
          console.error("Failed to delete video:", e);
          alert(e.response?.data?.message || "Failed to delete video");
      }
  };

  const handleShare = () => {
      const shareUrl = window.location.href;
      navigator.clipboard.writeText(shareUrl)
        .then(() => alert("Video Link copied to clipboard! Share it with your friends."))
        .catch(err => console.error("Failed to copy link", err));
  };


  if (loading) return <div style={{textAlign: 'center', marginTop: '50px', color: 'var(--text-secondary)'}}>Loading video...</div>;
  if (!videoData) return <div style={{textAlign: 'center', marginTop: '50px', color: 'red'}}>Video not found</div>;

  const uploadTime = new Date(videoData.createdAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Video Player */}
      <div style={{ width: '100%', aspectRatio: '16/9', background: 'black', borderRadius: '12px', overflow: 'hidden' }}>
        <video 
          controls autoPlay
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          src={videoData.videoFiles || videoData.videoFile} 
          poster={videoData.thumbnail}
        > Your browser does not support the video tag. </video>
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>{videoData.title}</h1>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          
          {/* Channel Info & Subscribe */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img 
               onClick={() => navigate(`/c/${videoData.owner?.username}`)}
               src={videoData.owner?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} 
               alt={videoData.owner?.fullname} 
               style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
            />
            <div 
              onClick={() => navigate(`/c/${videoData.owner?.username}`)}
              style={{ cursor: 'pointer' }}
            >
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{videoData.owner?.fullname}</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{channelInfo.subscribersCount} subscribers</p>
            </div>
            {user?.username !== videoData.owner?.username && (
                <button 
                  onClick={handleSubscribe}
                  className={channelInfo.isSubscribed ? "btn-secondary" : "btn-primary"} 
                  style={{ padding: '8px 20px', borderRadius: '20px', marginLeft: '10px', height: 'fit-content' }}
                >
                  {channelInfo.isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '15px' }}>
             {user && user.username === videoData.owner?.username && (
                 <button onClick={handleDelete} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s' }}>
                     <Trash2 size={18} /> Delete Video
                 </button>
             )}
             <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: likeData.isLiked ? 'rgba(255,0,0,0.2)' : 'var(--bg-glass)', border: '1px solid var(--border-color)', color: likeData.isLiked ? 'var(--accent-color)' : 'white', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s' }}>
               <ThumbsUp size={18} fill={likeData.isLiked ? 'var(--accent-color)' : 'none'}/> {likeData.count || "Like"}
             </button>
             <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', color: 'white', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}>
               <Share2 size={18} /> Share
             </button>
          </div>
        </div>

        {/* Video Description */}
        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '15px', marginTop: '20px' }}>
           <p style={{ margin: '0 0 10px', fontSize: '0.9rem', fontWeight: 'bold' }}>{videoData.views || 0} views • {uploadTime}</p>
           <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{videoData.description || 'No description provided.'}</p>
        </div>

        {/* Comments Section */}
        <div style={{ marginTop: '30px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}><MessageSquare size={20}/> {comments.length} Comments</h3>
            
            <form onSubmit={handleComment} style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=guest"} style={{ width: '40px', height: '40px', borderRadius: '50%' }} alt="You"/>
                <div style={{ flex: 1, display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
                    <input 
                       type="text" 
                       placeholder="Add a comment..." 
                       value={newComment}
                       onChange={(e) => setNewComment(e.target.value)}
                       style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', padding: '10px', outline: 'none' }}
                    />
                    <button type="submit" disabled={!newComment.trim()} style={{ background: 'transparent', border: 'none', color: newComment.trim() ? 'var(--accent-color)' : 'var(--text-secondary)', cursor: newComment.trim() ? 'pointer' : 'default', padding: '0 10px' }}>
                        <Send size={20} />
                    </button>
                </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {comments.map((comment) => (
                    <div key={comment._id} style={{ display: 'flex', gap: '15px' }}>
                         <img 
                            src={comment.owner?.avatar} 
                            alt={comment.owner?.fullname} 
                            onClick={() => comment.owner?.username && navigate(`/c/${comment.owner.username}`)}
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
                         />
                         <div>
                             <p style={{ margin: '0 0 5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                <span 
                                  onClick={() => comment.owner?.username && navigate(`/c/${comment.owner.username}`)}
                                  style={{ cursor: 'pointer', color: 'white' }}
                                >
                                  @{comment.owner?.username}
                                </span> • <span style={{ fontSize: '0.8rem' }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                             </p>
                             <p style={{ margin: 0 }}>{comment.content}</p>
                         </div>
                    </div>
                ))}
            </div>
        </div>

      </motion.div>
    </div>
  );
};

export default VideoPlayer;
