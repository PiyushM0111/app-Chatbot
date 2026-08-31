import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiUrl, parseJsonResponse } from '../utils/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('chatbot_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user on token change or initial load
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(getApiUrl('/api/auth/me'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await parseJsonResponse(res);
          setUser(data.user);
        } else {
          // Token expired or invalid
          localStorage.removeItem('chatbot_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to verify user session:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(getApiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(data.error || data.message || 'Failed to login');
    }

    localStorage.setItem('chatbot_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const signup = async (name, email, password) => {
    const res = await fetch(getApiUrl('/api/auth/signup'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(data.error || data.message || 'Failed to create account');
    }

    localStorage.setItem('chatbot_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const loginGuest = async () => {
    const res = await fetch(getApiUrl('/api/auth/guest'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(data.error || data.message || 'Failed to initialize guest session');
    }

    localStorage.setItem('chatbot_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('chatbot_token');
    setToken(null);
    setUser(null);
  };

  const updatePreferences = async (newPrefs) => {
    if (!token) return;
    try {
      const res = await fetch(getApiUrl('/api/auth/preferences'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPrefs)
      });
      if (res.ok) {
        const data = await parseJsonResponse(res);
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to sync preferences:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, loginGuest, logout, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
