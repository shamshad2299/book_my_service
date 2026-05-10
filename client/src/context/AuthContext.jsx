import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/http.js';
import { sessionStore } from '../utils/session.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => sessionStore.getUser());
  const [loading, setLoading] = useState(false);

  const saveSession = ({ token, user: nextUser }) => {
    sessionStore.save({ token, user: nextUser });
    setUser(nextUser);
  };

  const logout = () => {
    sessionStore.clear();
    setUser(null);
  };

  useEffect(() => {
    const token = sessionStore.getToken();
    if (!token) return;
    setLoading(true);
    api
      .get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(logout)
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({ user, loading, saveSession, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
