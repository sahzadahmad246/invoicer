import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./InvoicePDF.css";
import { useInputContext } from "../InputContext";
import BillTemplate from "./BillTemplate";
import { useNavigate } from "react-router-dom";
const numberToWords = require("number-to-words");

const InvoicePDF = () => {
  const { state } = useInputContext();
  const [userData, setUserData] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState(10001);
  const navigate = useNavigate();
  const discountType = state.discountType;
  const discountValue = state.discountValue;
  const [alertMessage, setAlert] = useState(null);

  const goBack = () => {
    navigate(-1);
  };

  const printPDF = () => {
    const pdf = new jsPDF();

    const content = document.getElementById("pdf-content");

    html2canvas(content).then((canvas) => {
      const imgData = canvas.toDataURL("image/jpeg");
      pdf.addImage(imgData, "JPEG", 10, 10, 190, 0);
      pdf.save("invoice.pdf");

      // Incrementing the invoice number and updating the state
      setInvoiceNumber((prevNumber) => prevNumber + 1);
    });
  };

  useEffect(() => {
    // Fetching the latest invoice number from the database
    const fetchLatestInvoiceNumber = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          "https://invoicerr-backend.onrender.com/get-latest-invoice-number",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          const data = await response.json();
          const latestInvoiceNumber = data.latestInvoiceNumber;

          setInvoiceNumber(latestInvoiceNumber + 1);
        }
      } catch (error) {
        console.error("Error fetching latest invoice number:", error);
      }
    };

    fetchLatestInvoiceNumber();
  }, []);

  const sendDataToBackend = async () => {
    try {
      const dataToSend = {
        customerName: state.customerName,
        customerAddress: state.customerAddress,
        customerMobileNumber: state.mobileNumber,
        invoiceNumber: invoiceNumber,
        selectedProducts: state.selectedProducts,
        paymentType: state.paymentMode,
        gstAmount: gstAmount,
        subtotal: totalAmountBeforeTax,
        discount: discountAmount,
        total: totalAmount,
        dateAndTime: formatDate(currentDateTime),
      };

      // POST request to  backend API endpoint
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/send-data-to-backend",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dataToSend),
        }
      );

      if (response.status === 200) {
        setAlert("Invoice saved successfully");

        setInvoiceNumber((prevNumber) => prevNumber + 1);
      } else {
        setAlert("Failed to save invoice. Please try again.");
      }
    } catch (error) {
      setAlert("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    if (alertMessage) {
      const timeoutId = setTimeout(() => {
        setAlert(null);
      }, 5000);

      return () => clearTimeout(timeoutId);
    }
  }, [alertMessage]);

  const callProductPage = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        "https://invoicerr-backend.onrender.com/product",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      const data = await res.json();
      setUserData(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    callProductPage();
  }, []);

  const formatDate = (date) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  const currentDateTime = new Date();

  // Calculating the total amount before tax without rounding
  const totalAmountBeforeTax = state.selectedProducts.reduce(
    (total, product) => total + (product.price - 0.18 * product.price),
    0
  );

  let discountSymbol = "";
  let discountAmount = discountValue;

  if (discountType === "percent") {
    discountSymbol = "%";
    // Checking if discountValue is a valid number
    const discountValueAsNumber = parseFloat(discountValue);
    if (!isNaN(discountValueAsNumber)) {
      // Calculating the discount amount as a percentage of totalAmountBeforeTax
      discountAmount = (
        (discountValueAsNumber / 100) *
        totalAmountBeforeTax
      ).toFixed(2);
    }
  } else if (discountType === "amount") {
    discountSymbol = "₹";
  }

  // Initializing gstAmount to 0 by default
  let gstAmount = 0;

  state.selectedProducts.forEach((product) => {
    const calculatedGST = product.price * 0.09;

    if (typeof calculatedGST === "number" && !isNaN(calculatedGST)) {
      gstAmount += calculatedGST;
    }
  });
  gstAmount = gstAmount.toFixed(2);

  // Calculating total amount after gst
  const totalAmount =
    typeof totalAmountBeforeTax === "number" && !isNaN(totalAmountBeforeTax)
      ? Math.round(totalAmountBeforeTax + 2 * gstAmount - discountAmount)
      : 0;
  // Converting totalAmount to words
  const totalAmountInWords = numberToWords.toWords(totalAmount);

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Capitalizing the first letter of totalAmountInWords
  const totalAmountInWordsCapitalized =
    capitalizeFirstLetter(totalAmountInWords);

  const saveAndPrint = () => {
    printPDF();
    sendDataToBackend();
  };

  return (
    <div>
      {alertMessage && (
        <div
          className={`update-message ${
            alertMessage.includes("failed") ? "error" : "success"
          }`}
          role="alert"
        >
          {alertMessage}
        </div>
      )}
      <div className="back-button-div">
        <button className="back-button " onClick={goBack}>
          <i class="fa-solid fa-arrow-left"></i>
        </button>
      </div>
      <div className=" my-1 container">
        <button className="print-button container" onClick={saveAndPrint}>
          Print <i class="fa-solid fa-print"></i>
        </button>
      </div>

      <div id="pdf-content" className="page">
        <div className="header">
          <div className="bussinessName">{userData.bussinessName}</div>
          <div className="address">{userData.address}</div>
          <div className="contact">
            <div className="number">
              <i class="fa-solid fa-phone-volume"></i>: {userData.number}
            </div>
            <div className="email">
              <i class="fa-solid fa-envelope"></i>: {userData.email}
            </div>
            <div className="gst">GSTIN: {userData.gst}</div>
          </div>
        </div>

        <div className="customer-info border">
          <div className="left-customer-info">
            <div className="customer-data-title ">Customer Details:</div>
            <div className=" customer-data">
              <div>
                <span className="fw-bold">Name:</span> {state.customerName}
              </div>
              <div>
                <span className="fw-bold">Address:</span>
                {state.customerAddress}
              </div>
              <div>
                <span className="fw-bold">Mobile No :</span>{" "}
                {state.mobileNumber}
              </div>
            </div>
          </div>
          <div className="right-customer-info">
            <div className="customer-data-title ">Basic Details</div>
            <div className=" customer-data">
              <div>
                <span className="fw-bold">Date and Time:</span>{" "}
                {/* <span> {formatDate(currentDateTime)}</span> */}
                Apr 28, 2024, 11:06 AM
              </div>
              <div>
                <span className="fw-bold">Invoice No :</span> {invoiceNumber}
              </div>
              <div>
                <span className="fw-bold">State Code :</span> 27
              </div>
            </div>
          </div>
        </div>

        <div className="table  border">
          <div className=" tableHeader">
            <div className="description">Description</div>
            <div className="quantity">Quantity</div>
            <div className="rate">Rate</div>
            <div className="amount">Amount</div>
          </div>
          {state.selectedProducts.map((product) => {
            const originalPrice = product.price;
            const imei = product.imei;
            const discount = Math.round(0.18 * originalPrice);
            const priceBeforeTax = Math.round(originalPrice - discount);

            return (
              <div className="tableRow " key={product._id}>
                <div className="description">
                  <div className="productName-in-invice p-0 m-0 fw-light">
                    {product.productName} {product.productDescription}
                  </div>
                  <div className="imei-in-invoice p-0 m-0">{imei}</div>
                </div>
                <div className="quantity">1</div>
                <div className="rate">2500</div>
                <div className="amount">2500</div>
              </div>
            );
          })}

          <div className="footer-div ">
            <div className="footer tableRow ">
              <div className="description payment-mode "></div>
              <div className="quantity ">Subtotal</div>
              <div className="rate ">-</div>
              <div className="amount ">2500</div>
            </div>
            <div className="footer tableRow">
              <div className="description payment-mode "></div>
              <div className="quantity">Discount</div>
              <div className="rate">
                {discountValue}
                {""}
                {discountSymbol}
              </div>
              <div className="amount">{discountAmount}</div>
            </div>

            <div class="footer tableRow">
              <div className="description text-start">
                Payment Type: {state.paymentMode}
              </div>
             <div className="quantity ">SGST</div>
              <div className="rate  p-2">0</div>
              <div className="amount ">0</div>
            </div>
            <div className="footer tableRow">
              <div className="description text-start">
                GSTIN: {userData.gst}
              </div>
              <div className="quantity ">CGST</div>
              <div className="rate ">0</div>
              <div className="amount ">0</div>
            </div>
            <div className="footer tableRow">
              <div className="description text-start ">
                Amount in word: {totalAmountInWordsCapitalized} rupees
              </div>
              <div className="quantity ">Total</div>
              <div className="amount ">-</div>
              <div className="amount ">{totalAmount}</div>
            </div>
          </div>
        </div>

        <div className="terms border">
          <div className=" term-top">
            <span className="pe-2 fw-bold">Declaration:</span>
            We declare that this invoice shows actual price of the goods
            described and all the particulars are true and correct
          </div>
          <div className=" term-bottom ">
            <span>Terms & Conditions</span>
            <div className="">
              <span className="fw-bold">1- </span> Once you buy something, you
              can't return it.
            </div>
            <div className="">
              <span className="fw-bold">2- </span> If something goes wrong with
              your product, you need to go to the service center to get it
              fixed. The manufacturer covers this.
            </div>
            <div className="">
              <span className="fw-bold">3- </span> Mobile phones have a warranty
              for 1 year, and accessories have a warranty for 6 months.
            </div>
            <div>
              <span className="fw-bold">4- </span> Warranty doesn't cover things
              like using the product in the wrong way, water damage, or if you
              accidentally break it.
            </div>
          </div>
        </div>
        <div className=" stamp ">
          <div className="sign">Customer's Sign</div>

          <div className=" sign">
            <span> for {userData.bussinessName}</span>
          </div>
        </div>
        <div className="thanks">
          || Thank you for Shopping with us, visit again ||
        </div>
      </div>
    </div>
  );
};

export default InvoicePDF;
