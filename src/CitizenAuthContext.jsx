import React, { createContext, useState, useContext, useEffect } from 'react';

const CitizenAuthContext = createContext();

export const CitizenAuthProvider = ({ children }) => {
  const [citizenUser, setCitizenUser] = useState(() => {
    try {
      const token = sessionStorage.getItem('citizenToken');
      const user = sessionStorage.getItem('citizenUser');
      if (token && user) {
        return JSON.parse(user);
      }
    } catch (e) {
      console.error('Failed to parse citizen user from local storage', e);
    }
    return null;
  });

  const loginCitizen = (token, userData) => {
    sessionStorage.setItem('citizenToken', token);
    sessionStorage.setItem('citizenUser', JSON.stringify(userData));
    setCitizenUser(userData);
  };

  const logoutCitizen = () => {
    sessionStorage.removeItem('citizenToken');
    sessionStorage.removeItem('citizenUser');
    setCitizenUser(null);
  };

  return (
    <CitizenAuthContext.Provider value={{ citizenUser, loginCitizen, logoutCitizen }}>
      {children}
    </CitizenAuthContext.Provider>
  );
};

export const useCitizenAuth = () => useContext(CitizenAuthContext);
