import React, { useState } from "react";
import Button from "./subcomponents/Button.jsx";
import Input from "./subcomponents/Input.jsx";
import { validateCredentials } from "../js/utils/auth";

const Login = ({ isLoggedIn, onLogin, onLogout }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");

    if (validateCredentials(username, password)) {
      onLogin();
      setUsername("");
      setPassword("");
    } else {
      setError("Ogiltigt användarnamn eller lösenord");
    }
  };

  const handleLogout = () => {
    onLogout();
    setUsername("");
    setPassword("");
    setError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  if (isLoggedIn) {
    return (
      <div id="auth-section" className="flex gap-2 items-center">
        <span className="text-sm font-medium text-[var(--text-h)]">
          Inloggad som: admin
        </span>
        <Button handleClick={handleLogout}>Logga ut</Button>
      </div>
    );
  }

  return (
    <div id="auth-section" className="flex flex-col gap-2">
      <div id="login-form" className="login-form flex gap-2 items-center">
        <Input
          size="m"
          type="text"
          placeholder="Användarnamn"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-white"
        />
        <Input
          size="m"
          type="password"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-white"
        />
        <Button handleClick={handleLogin}>Logga in</Button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Login;
