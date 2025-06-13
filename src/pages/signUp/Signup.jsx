import React, { useState } from "react";
import { supabase } from "../../utils/db";
import { useNavigate } from "react-router-dom";
import "./signup.css";

const Signup = ({ redirectUrl }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) {
        console.error("Signup error:", error.message);
        return;
      }

      const { user } = data;
      if (user) {
        const { id: authUserId, email: authEmail } = user;
        const { error: userError } = await supabase.from("users").insert([
          {
            id: authUserId,
            email: authEmail,
            full_name: name,
          },
        ]);

        if (userError) {
          console.error("Error inserting user:", userError.message);
          return;
        }

        console.log("User inserted into 'users' table:", user);
      }

      console.log("Signup successful:", data);
      
      // Redirect to the original URL or dashboard
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Signup error:", error.message);
    }
  };

  return (
    <div className="signup-wrapper">
      <form className="signup-form" onSubmit={submitHandler}>
        <h2 className="signup-title">Create Your Account</h2>

        <label htmlFor="name" className="signup-label">Full Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          autoComplete="name"
          required
        />

        <label htmlFor="email" className="signup-label">Email Address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          autoComplete="email"
          required
        />

        <label htmlFor="password" className="signup-label">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="new-password"
          required
        />

        <button type="submit" className="signup-button">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;