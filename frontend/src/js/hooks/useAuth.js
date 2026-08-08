import { useState, useEffect } from "react";
import { getInitialLoginState, persistLoginState } from "../utils/auth";

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(getInitialLoginState);

  useEffect(() => {
    persistLoginState(isLoggedIn);
  }, [isLoggedIn]);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  return { isLoggedIn, handleLogin, handleLogout };
}
