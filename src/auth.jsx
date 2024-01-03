import React, { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [user, setUser] = useState("");

  const storeDataInLS = (token) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true);
  };

  

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, storeDataInLS,  }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const authContextValue = useContext(AuthContext);
  if (!authContextValue) {
    throw new Error("useAuth used outside of provider");
  }
  return authContextValue;
};
