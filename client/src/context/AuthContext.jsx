import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiUrl, parseJsonResponse } from '../utils/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('chatbot_token') || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('chatbot_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(!!localStorage.getItem('chatbot_token'));

  // Verify and refresh user profile whenever token changes or on initial mount
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      if (!token) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
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
          if (isMounted && data.user) {
            setUser(data.user);
            try {
              localStorage.setItem('chatbot_user', JSON.stringify(data.user));
            } catch (e) {}
          }
        } else if (res.status === 401 || res.status === 403) {
          // Token is genuinely expired or invalid: clear session
          console.warn('Session verification rejected (401/403). Clearing stale session.');
          try {
            localStorage.removeItem('chatbot_token');
            localStorage.removeItem('chatbot_user');
          } catch (e) {}
          if (isMounted) {
            setToken(null);
            setUser(null);
          }
        } else {
          // 5xx / 4xx other than 401/403 / temporary network issue: keep cached user session
          console.warn(`Session check returned non-auth status: ${res.status}. Preserving cached session.`);
        }
      } catch (err) {
        // Offline / network failure: keep cached session
        console.warn('Network offline or error during session check. Preserving cached session:', err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
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

    try {
      localStorage.setItem('chatbot_token', data.token);
      localStorage.setItem('chatbot_user', JSON.stringify(data.user));
    } catch (e) {}

    setToken(data.token);
    setUser(data.user);
    setLoading(false);
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

    try {
      localStorage.setItem('chatbot_token', data.token);
      localStorage.setItem('chatbot_user', JSON.stringify(data.user));
    } catch (e) {}

    setToken(data.token);
    setUser(data.user);
    setLoading(false);
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

    try {
      localStorage.setItem('chatbot_token', data.token);
      localStorage.setItem('chatbot_user', JSON.stringify(data.user));
    } catch (e) {}

    setToken(data.token);
    setUser(data.user);
    setLoading(false);
    return data.user;
  };

  const logout = () => {
    try {
      localStorage.removeItem('chatbot_token');
      localStorage.removeItem('chatbot_user');
    } catch (e) {}
    setToken(null);
    setUser(null);
    setLoading(false);
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
        if (data.user) {
          setUser(data.user);
          try {
            localStorage.setItem('chatbot_user', JSON.stringify(data.user));
          } catch (e) {}
        }
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
