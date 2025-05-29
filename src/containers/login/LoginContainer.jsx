import React from "react";
import "./login.css"; // Make sure this path is correct

const LoginContainer = ({ email, password, onEmail, onPassword, onSubmit }) => {
  return (
    <div className="login-container">
      <form onSubmit={onSubmit}>
        <h1 className="welcome-txt">Welcome back</h1>

        <input
          type="email"
          value={email}
          placeholder="Enter email"
          onChange={onEmail}
          required
        />
        <input
          type="password"
          value={password}
          placeholder="Enter password"
          onChange={onPassword}
          required
        />
        <input type="submit" value="Login" />
      </form>
    </div>
  );
};

export default LoginContainer;
