import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Lock, User, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Settings = () => {
  const { user, setUser } = useAuth();
  
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users/change-password', passwords);
      showMessage('success', 'Password successfully changed');
      setPasswords({ oldPassword: '', newPassword: '' });
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvatar = async (e) => {
    e.preventDefault();
    if (!avatar) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatar);
      const res = await api.patch('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(res.data.data);
      showMessage('success', 'Avatar updated successfully');
      setAvatar(null);
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to update avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCover = async (e) => {
    e.preventDefault();
    if (!coverImage) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('coverImage', coverImage);
      const res = await api.patch('/users/cover-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(res.data.data);
      showMessage('success', 'Cover image updated successfully');
      setCoverImage(null);
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to update cover image');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div style={{textAlign: 'center', marginTop: '50px'}}>Please login to view settings.</div>;
  }

  return (
    <div className="settings-container" style={{maxWidth: '800px', margin: '0 auto', color: 'white'}}>
      <h2 style={{fontSize: '2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px'}}>
        <User size={30} color="var(--accent-color)" /> Account Settings
      </h2>
      
      {message.text && (
        <div style={{
          padding: '10px', 
          marginBottom: '20px', 
          backgroundColor: message.type === 'success' ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)',
          border: `1px solid ${message.type === 'success' ? '#00ff00' : '#ff0000'}`,
          borderRadius: '5px'
        }}>
          {message.text}
        </div>
      )}

      <div style={{display: 'grid', gap: '20px'}}>
        {/* Change Password Box */}
        <motion.div className="auth-box" style={{maxWidth: '100%', padding: '2rem'}}>
          <h3 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px'}}><Lock size={20}/> Change Password</h3>
          <form onSubmit={handleChangePassword} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            <div className="input-group">
              <input type="password" required value={passwords.oldPassword} onChange={e => setPasswords({...passwords, oldPassword: e.target.value})} />
              <label>Old Password</label>
            </div>
            <div className="input-group">
              <input type="password" required value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} />
              <label>New Password</label>
            </div>
            <motion.button type="submit" className="btn-primary" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              Update Password
            </motion.button>
          </form>
        </motion.div>

        {/* Update Avatar Box */}
        <motion.div className="auth-box" style={{maxWidth: '100%', padding: '2rem'}}>
          <h3 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px'}}><Camera size={20}/> Update Avatar</h3>
          <form onSubmit={handleUpdateAvatar} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            <div className="file-input-group">
              <input type="file" accept="image/*" required onChange={e => setAvatar(e.target.files[0])} style={{color: 'white'}}/>
            </div>
            <motion.button type="submit" className="btn-primary" disabled={!avatar || loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              Upload New Avatar
            </motion.button>
          </form>
        </motion.div>

        {/* Update Cover Image Box */}
        <motion.div className="auth-box" style={{maxWidth: '100%', padding: '2rem'}}>
          <h3 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px'}}><ImageIcon size={20}/> Update Cover Image</h3>
          <form onSubmit={handleUpdateCover} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            <div className="file-input-group">
              <input type="file" accept="image/*" required onChange={e => setCoverImage(e.target.files[0])} style={{color: 'white'}}/>
            </div>
            <motion.button type="submit" className="btn-primary" disabled={!coverImage || loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              Upload New Cover Image
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
