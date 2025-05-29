import React, { useState, lazy, Suspense } from "react";
import "./authpage.css";
const Login = lazy(() => import("../Login/Login"));
const Signup = lazy(() => import("../signUp/Signup"));

const AuthPage = () => {
  const [display, setDisplay] = useState(true);

  return (
    <div className="auth-main">
      <div className="auth-container">
        <div className="login-container">
          <Suspense fallback={<div className="loader">Loading...</div>}>
            {display ? (
              <div className="dis-c">
                <Login />
                <p className="login-txt">
                  New user?{" "}
                  <span className="n-signup" onClick={() => setDisplay(false)}>
                    Sign Up
                  </span>
                </p>
              </div>
            ) : (
              <div className="dis-c">
                <Signup />
                <p className="login-txt">
                  Already have an account?{" "}
                  <span className="n-signup" onClick={() => setDisplay(true)}>
                    Login
                  </span>
                </p>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
