import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwt_token') || null);
  const [loading, setLoading] = useState(true);

  // We load the initial user state based on the local storage token
  useEffect(() => {
    if (token) {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user_data'));
        setUser(storedUser);
      } catch (e) {
        setToken(null);
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
      }
    }
    setLoading(false);
  }, [token]);

  const login = (jwtToken, userData) => {
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('jwt_token', jwtToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
