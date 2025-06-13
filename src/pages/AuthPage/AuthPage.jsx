import React, { useState, lazy, Suspense, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "./authpage.css";
const Login = lazy(() => import("../Login/Login"));
const Signup = lazy(() => import("../signUp/Signup"));

const AuthPage = () => {
  const [display, setDisplay] = useState(true);
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  return (
    <div className="auth-main">
      <div className="auth-container">
        <div className="login-container">
          <Suspense fallback={<div className="loader">Loading...</div>}>
            {display ? (
              <div className="dis-c">
                <Login redirectUrl={redirectUrl} />
                <p className="login-txt">
                  New user?{" "}
                  <span className="n-signup" onClick={() => setDisplay(false)}>
                    Sign Up
                  </span>
                </p>
              </div>
            ) : (
              <div className="dis-c">
                <Signup redirectUrl={redirectUrl} />
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