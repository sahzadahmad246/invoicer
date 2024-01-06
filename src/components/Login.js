import React, { useContext, useState, useEffect } from "react";
import "./Login.css";

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import LoginImg from "../images/login.png";
import { userContext } from "../App";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Loader from "./Loader";
const Login = () => {
  const { state, dispatch } = useContext(userContext);
  const Navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);
  const { storeDataInLS, setIsLoggedIn } = useAuth();
 

  useEffect(() => {
    if (updateMessage) {
      const timeoutId = setTimeout(() => {
        setUpdateMessage(null);
      }, 5000);

      return () => clearTimeout(timeoutId);
    }
  }, [updateMessage]);

  const loginUser = async (e) => {
    e.preventDefault();
    console.log(email, password);
    try {
      setLoading(true);
      const res = await fetch("https://invoicerr-backend.onrender.com/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();
      // console.log(data);
      
      localStorage.setItem("token", data.token);

      if (res.status === 400) {
        // setUpdateMessage();
        toast.error("Login Failed: Invalid credentials");
      } else if (res.status === 500) {
        toast.error("Login Failed: Server error");
      } else if (res.status === 201) {
        // dispatch({ type: "USER", payload: true });
        setIsLoggedIn(true)
        toast.success("Login success");
        Navigate("/");
      }
    } catch (error) {
      // console.error("Error during login:", error);
      setUpdateMessage("Error during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="login-box">
        <div className="login-container container">
         
          <div className="login-left">
            <div className="login-img container">
              {" "}
              <img src={LoginImg} alt="img" />{" "}
            </div>
          </div>
          <div className="login-right">
            <div className="login-close-btn">
              <i class="fa-solid fa-xmark"></i>
            </div>
            <h2 className="mb-1 fs-5 fw-bolder">Login to you account</h2>
            <form method="POST" className="login-form">
              <div className=" login-element">
                <i class=" pe-3 fa-solid fa-envelope"></i>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Enter email"
                  className="border-0"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className=" login-element">
                <i class=" pe-3 fa-solid fa-lock"></i>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Enter a password"
                  className="border-0"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="login-btn-container">
                <button
                  className="login-btn"
                  type="button"
                  onClick={loginUser}
                  disabled={loading}
                >
                  {loading ? <Loader /> : "Login"}{" "}
                  {/* Conditionally render text */}
                </button>
              </div>
              <p className="fs-9">
                <NavLink className="navbar-brand" to="/register">
                  {" "}
                  New to Invoicer? Create an account
                </NavLink>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;
