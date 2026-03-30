import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Upload = () => {
  const [formData, setFormData] = useState({ title: '', description: '', category: 'All' });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!videoFile) throw new Error("Video file is required");
      if (!thumbnail) throw new Error("Thumbnail is required");

      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('videoFile', videoFile);
      data.append('thumbnail', thumbnail);

      // We use axios options to get upload progress
      await api.post('/videos', data, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Upload failed");
      setLoading(false);
    }
  };

  const CATEGORIES = ["All", "Gaming", "Music", "Live", "Projects", "AI", "Podcasts", "News", "Daily Info", "Other"];

  return (
    <div className="auth-container" style={{ alignItems: 'flex-start', paddingTop: '40px' }}>
      <motion.div 
        className="auth-box register-box"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
      >
        <div className="auth-header">
          <UploadIcon size={48} color="#ff0000" style={{ marginBottom: '10px' }} />
          <h2>Upload Video</h2>
          <p>Share your content with the world</p>
        </div>

        {error && <div style={{color: 'red', textAlign: 'center', marginBottom: '1rem'}}>{error}</div>}

        <form onSubmit={handleUpload} className="auth-form">
          <div className="input-group">
            <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            <label>Video Title</label>
          </div>
          
          <div className="input-group" style={{ height: 'auto' }}>
             <textarea 
               required 
               value={formData.description} 
               onChange={(e) => setFormData({...formData, description: e.target.value})}
               style={{
                 width: '100%', padding: '25px 20px 15px', background: 'rgba(0, 0, 0, 0.5)',
                 border: '1px solid var(--border-color)', borderRadius: '10px',
                 color: 'white', fontSize: '1rem', outline: 'none', resize: 'vertical', minHeight: '100px'
               }}
               placeholder="Write a description for your video..."
             ></textarea>
          </div>
          
          <div className="file-input-group" style={{ marginTop: '10px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Category / Tag</label>
            <select 
               value={formData.category}
               onChange={(e) => setFormData({...formData, category: e.target.value})}
               style={{
                 width: '100%', padding: '12px 20px', background: 'rgba(0, 0, 0, 0.5)',
                 border: '1px solid var(--border-color)', borderRadius: '10px',
                 color: 'white', fontSize: '1rem', outline: 'none', cursor: 'pointer'
               }}
            >
              {CATEGORIES.map(cat => (
                 <option key={cat} value={cat} style={{ background: '#121212' }}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="file-input-group" style={{ marginTop: '10px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Thumbnail Image</label>
            <input type="file" accept="image/*" required onChange={(e) => setThumbnail(e.target.files[0])} style={{ color: 'white' }} />
          </div>

          <div className="file-input-group" style={{ marginTop: '10px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Video File (MP4, MKV)</label>
            <input type="file" accept="video/*" required onChange={(e) => setVideoFile(e.target.files[0])} style={{ color: 'white' }} />
          </div>

          {loading && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-color)', transition: 'width 0.3s' }}></div>
              </div>
            </div>
          )}

          <motion.button 
            type="submit"
            className="btn-primary"
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(255, 0, 0, 0.6)" }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            style={{ marginTop: '30px' }}
          >
            {loading ? "Processing..." : "Publish Video"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Upload;
