import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Login = () => {
  const [identifier, setIdentifier] = useState(''); // email or username
  const [password, setPassword] = useState('');
  
  // States for password change mode
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''); // success or error
  const [isError, setIsError] = useState(true);

  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const isEmail = identifier.includes('@');
      await login(isEmail ? identifier : '', !isEmail ? identifier : '', password);
      
      const queryParams = new URLSearchParams(location.search);
      const redirectUrl = queryParams.get('redirect') || '/';
      
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const isEmail = identifier.includes('@');
      
      // 1. Silent login to verify old password and get JWT tokens
      await login(isEmail ? identifier : '', !isEmail ? identifier : '', password);
      
      // 2. Perform the password change utilizing the newly set JWT cookies
      await api.post('/users/change-password', {
        oldPassword: password,
        newPassword: newPassword
      });

      // 3. Immediately log out safely 
      await logout();

      // Ensure view switches back and success is shown
      setIsChangingPassword(false);
      setIsError(false);
      setMessage('Password successfully changed! Please login with your new password.');
      setPassword('');
      setNewPassword('');
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || "Verification failed. Check your old password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <AnimatePresence mode="wait">
        <motion.div 
          key={isChangingPassword ? "change" : "login"}
          className="auth-box"
          initial={{ opacity: 0, scale: 0.8, rotateX: -30 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.8, rotateX: 30 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
        >
          <div className="auth-header">
            <motion.div 
              animate={{ rotateY: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Video size={48} color="#ff0000" />
            </motion.div>
            <h2>{isChangingPassword ? "Change Password" : "Welcome Back"}</h2>
            <p>{isChangingPassword ? "Update your VIDEOTUBE password directly" : "Login to your VIDEOTUBE account"}</p>
          </div>

          {message && (
            <div style={{
              color: isError ? '#ff4444' : '#00ff00', 
              textAlign: 'center', 
              marginBottom: '1rem',
              padding: '10px',
              backgroundColor: isError ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,0,0.1)',
              borderRadius: '8px'
            }}>
              {message}
            </div>
          )}

          <form onSubmit={isChangingPassword ? handleChangePassword : handleLogin} className="auth-form">
            <div className="input-group">
              <input 
                type="text" 
                required 
                value={identifier} 
                onChange={(e) => setIdentifier(e.target.value)} 
                id="identifier"
              />
              <label htmlFor="identifier">Email or Username</label>
            </div>
            
            <div className="input-group">
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                id="password"
              />
              <label htmlFor="password">{isChangingPassword ? "Old Password" : "Password"}</label>
            </div>

            {isChangingPassword && (
              <div className="input-group">
                <input 
                  type="password" 
                  required 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  id="newPassword"
                />
                <label htmlFor="newPassword">New Password</label>
              </div>
            )}

            <motion.button 
              type="submit"
              className="btn-primary"
              whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(255, 0, 0, 0.6)" }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
            >
              {loading ? "Processing..." : (isChangingPassword ? "Change Password" : "Login")}
            </motion.button>
          </form>

          <div style={{marginTop: '20px', textAlign: 'center'}}>
             <button 
                onClick={() => { setIsChangingPassword(!isChangingPassword); setMessage(''); }}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-secondary)',
                  cursor: 'pointer', textDecoration: 'underline'
                }}
             >
               {isChangingPassword ? "Back to Login" : "Want to change your password?"}
             </button>
          </div>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Login;
