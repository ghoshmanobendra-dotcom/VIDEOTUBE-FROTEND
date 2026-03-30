import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkUser = async () => {
      try {
        const response = await api.get('/users/current-user');
        if (response.data && response.data.data) {
          setUser(response.data.data);
        }
      } catch (error) {
        console.error("Not logged in");
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);

  const login = async (email, username, password) => {
    const data = {};
    if (email) data.email = email;
    if (username) data.username = username;
    data.password = password;
    
    const response = await api.post('/users/login', data);
    setUser(response.data.data.user);
    return response.data;
  };

  const logout = async () => {
    await api.post('/users/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
