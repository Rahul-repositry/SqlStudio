import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
const BACKEND_URI = import.meta.env.VITE_BACKEND_URI;

const AuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();


  const [isLogin, setIsLogin] = useState(
    location.pathname === "/authPage/login" ? true : false,
  );
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };



  const handleGetOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${BACKEND_URI}/api/auth/get-otp`, {
        email: formData.email,
      });
      setMessage({ type: "success", text: data.message });
      setStep(2);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setMessage({
          type: "error",
          text: error.response?.data?.message || "Failed to send OTP",
        });
      } else {
        setMessage({
          type: "error",
          text: "Something went wrong",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${BACKEND_URI}/api/auth/signup`,
        formData,
      );
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setMessage({
          type: "error",
          text: error.response?.data?.message || "Failed to send OTP",
        });
      } else {
        setMessage({
          type: "error",
          text: "Something went wrong",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${BACKEND_URI}/api/auth/login`, {
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setMessage({
          type: "error",
          text: error.response?.data?.message || "Login failed",
        });
      } else {
        setMessage({
          type: "error",
          text: "Something went wrong",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-brand">
        <div className="brand-content">
          <h1>SQLStudio</h1>
          <p>The ultimate workspace for database management.</p>
          <div className="status-dot">● System Online</div>
        </div>
      </div>

      <div className="auth-form-section">
        <div className="form-card card">
          <div className="form-header">
            <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
            <p>
              {isLogin
                ? "Enter your credentials to manage your DBs."
                : "Join the most powerful SQL client."}
            </p>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type}`}>{message.text}</div>
          )}

          {isLogin ? (
            /* Login Form */
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label>Gmail Address</label>
                <input
                  type="email"
                  name="email"
                  className="input-field"
                  placeholder="name@gmail.com"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  className="input-field"
                  placeholder="••••••••"
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? "Authenticating..." : "Sign In"}
              </button>
            </form>
          ) : (
            /* Signup Flow */
            <form onSubmit={step === 1 ? handleGetOTP : handleSignup}>
              {step === 1 ? (
                <div className="input-group">
                  <label>Gmail Address</label>
                  <input
                    type="email"
                    name="email"
                    className="input-field"
                    placeholder="yourname@gmail.com"
                    onChange={handleChange}
                    required
                  />
                  <p className="hint">
                    We only support @gmail.com for security.
                  </p>
                </div>
              ) : (
                <>
                  <div className="input-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="input-field"
                      placeholder="Rahul ..."
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Create Password</label>
                    <input
                      type="password"
                      name="password"
                      className="input-field"
                      placeholder="••••••••"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>OTP (Sent to Gmail)</label>
                    <input
                      type="text"
                      name="otp"
                      className="input-field code-font"
                      placeholder="123456"
                      maxLength={6}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              )}
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : step === 1
                    ? "Verify Email"
                    : "Complete Registration"}
              </button>
            </form>
          )}

          <div className="form-footer">
            <button
              className="btn-ghost"
              onClick={() => {
                setIsLogin(!isLogin);
                setStep(1);
                setMessage({ type: "", text: "" });
              }}
            >
              {isLogin
                ? "Don't have an account? Sign Up"
                : "Already have an account? Log In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
