import React, { useState } from "react";
import LoginContainer from "../../containers/login/LoginContainer";
import { supabase } from "../../utils/db";
import { useNavigate } from "react-router-dom";


const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error.message);
        alert("Login failed: " + error.message);
        return;
      }

      const { user } = data;

      if (!user) {
        alert("User not found");
        return;
      }

      console.log("Logged in user:", user);

      // Send user_id to backend
  

      navigate("/dashboard");
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <div>
      <LoginContainer
        email={email}
        password={password}
        onEmail={(e) => setEmail(e.target.value)}
        onPassword={(e) => setPassword(e.target.value)}
        onSubmit={submitHandler}
      />
    </div>
  );
};

export default Login;
