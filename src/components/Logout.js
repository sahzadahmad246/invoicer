import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Logout = () => {
  const navigate = useNavigate();
  const { LogoutUser } = useAuth();

  useEffect(() => {
    const logoutAndRedirect = async () => {
      await LogoutUser();
      toast.success("Logged out: see you soon")
      navigate("/login"); 
    };

    logoutAndRedirect();
  }, [LogoutUser, navigate]);

  return null; // Return null or any other content you need for the component
};

export default Logout;
