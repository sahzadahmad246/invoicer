import React, { useState, useEffect } from "react";
import Nav from "./Nav";
import BillTemplate from "./BillTemplate";
import LandingPage from "./LandingPage";
import Loader from "./Loader";
import InvoicePDF from "./InvoicePDF";

const Home = () => {
  const [userBussinessName, setUserBussinessName] = useState(null);
  const [loading, setLoading] = useState(true);

  const homePage = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("https://invoicerr-backend.onrender.com/getdata", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setUserBussinessName(data.bussinessName);

      if (res.status !== 200) {
        setUserBussinessName(null);
        const error = new Error("Request error");
        throw error;
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    homePage().then(() => {
      setLoading(false);
    });
  }, []);

  return (
    <>
      {loading ? (
        <Loader />
      ) : userBussinessName ? (
        <BillTemplate />
      ) : (
        <LandingPage />
      )}
    </>
  );
};

export default Home;
