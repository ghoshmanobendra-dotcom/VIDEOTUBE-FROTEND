import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    fullname: '', username: '', email: '', password: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!avatar) throw new Error("Avatar image is required");
      if (!coverImage) throw new Error("Cover image is required");

      const data = new FormData();
      data.append('fullname', formData.fullname);
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('avatar', avatar);
      data.append('coverImage', coverImage);

      const response = await api.post('/users/register', data);
      
      setUser(response.data.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div 
        className="auth-box register-box"
        initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
      >
        <div className="auth-header">
          <motion.div 
            animate={{ rotateY: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Video size={48} color="#ff0000" />
          </motion.div>
          <h2>Create Account</h2>
          <p>Join VIDEOTUBE today</p>
        </div>

        {error && <div style={{color: 'red', textAlign: 'center', marginBottom: '1rem'}}>{error}</div>}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="input-group">
            <input type="text" required value={formData.fullname} onChange={(e) => setFormData({...formData, fullname: e.target.value})} />
            <label>Full Name</label>
          </div>
          <div className="input-group">
            <input type="text" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
            <label>Username</label>
          </div>
          <div className="input-group">
            <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <label>Email</label>
          </div>
          <div className="input-group">
            <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            <label>Password</label>
          </div>
          
          <div className="file-input-group">
            <label>Avatar</label>
            <input type="file" accept="image/*" required onChange={(e) => setAvatar(e.target.files[0])} />
          </div>
          <div className="file-input-group">
            <label>Cover Image</label>
            <input type="file" accept="image/*" required onChange={(e) => setCoverImage(e.target.files[0])} />
          </div>

          <motion.button 
            type="submit"
            className="btn-primary"
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(255, 0, 0, 0.6)" }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            {loading ? "Registering..." : "Sign Up"}
          </motion.button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
