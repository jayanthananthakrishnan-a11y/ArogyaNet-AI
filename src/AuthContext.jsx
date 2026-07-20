import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        
        if (data.success) {
            sessionStorage.setItem('adminToken', data.token);
            setUser({
              role: data.user.role,
              center_id: data.user.center_id,
              name: data.user.role === 'admin' ? 'District Administrator' : 'PHC Staff Officer'
            });
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.error(err);
        return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('adminToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
