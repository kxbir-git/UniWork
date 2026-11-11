import React, { createContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../services/api';
import { Platform } from 'react-native';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Check login on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        let token = null;
        if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
          token = localStorage.getItem('uniwork_token');
        }

        if (token) {
          setAuthToken(token);
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            setWalletBalance(res.data.wallet.balance);
          }
        }
      } catch (err) {
        setAuthToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setAuthToken(res.data.token);
      setUser(res.data.user);
      setWalletBalance(res.data.walletBalance);
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      setAuthToken(res.data.token);
      setUser(res.data.user);
      setWalletBalance(res.data.walletBalance);
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setWalletBalance(0);
  };

  const refreshMe = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setWalletBalance(res.data.wallet.balance);
      }
    } catch (err) {
      console.log('Error refreshing user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        walletBalance,
        loading,
        login,
        register,
        logout,
        refreshMe,
        setWalletBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
