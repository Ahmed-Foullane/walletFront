"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SendMoneyPage() {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState({ amount: 0, currency: "USD" });
  const [showConfirm, setShowConfirm] = useState(false);
  const [recipientFound, setRecipientFound] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [searchingRecipient, setSearchingRecipient] = useState(false);
  const [savedRecipients, setSavedRecipients] = useState([]);
  const [showSavedRecipients, setShowSavedRecipients] = useState(false);
  const [loadingSavedRecipients, setLoadingSavedRecipients] = useState(false);
  const navigate = useNavigate();

  // Fetch wallet balance and saved recipients when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Fetch wallet data from profile
        const profileResponse = await fetch("http://127.0.0.1:8000/api/profile", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch profile");
        }

        const profileData = await profileResponse.json();
        
        if (profileData.user && profileData.user.wallet) {
          setWallet({
            amount: parseFloat(profileData.user.wallet.amount) || 0,
            currency: profileData.user.wallet.currency || "USD",
          });
        }

        // Fetch saved recipients from backend
        await fetchSavedRecipients();
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage(error.message);
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchSavedRecipients = async () => {
    setLoadingSavedRecipients(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("http://127.0.0.1:8000/api/recipients", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch saved recipients");
      }

      const data = await response.json();
      setSavedRecipients(data.recipients || []);
    } catch (error) {
      console.error("Error fetching saved recipients:", error);
    } finally {
      setLoadingSavedRecipients(false);
    }
  };

  const searchRecipient = async () => {
    if (!recipientEmail) {
      setMessage("Please enter a recipient email");
      setMessageType("error");
      return;
    }

    setSearchingRecipient(true);
    setMessage("");
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Call an API endpoint to verify if the recipient exists
      const response = await fetch("http://127.0.0.1:8000/api/transfer/verify-recipient", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: recipientEmail }),
      });

      const data = await response.json();

      if (response.ok && data.exists) {
        setRecipientFound(true);
        setRecipientInfo(data.user);
        setMessage("");
      } else {
        setRecipientFound(false);
        setRecipientInfo(null);
        setMessage("Recipient not found. Please check the email address.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error searching recipient:", error);
      setRecipientFound(false);
      setRecipientInfo(null);
      setMessage(error.message || "Failed to search for recipient");
      setMessageType("error");
    } finally {
      setSearchingRecipient(false);
    }
  };

  const selectSavedRecipient = (recipient) => {
    setRecipientEmail(recipient.email);
    setRecipientInfo({
      id: recipient.user_id,
      name: recipient.name,
      email: recipient.email
    });
    setRecipientFound(true);
    setShowSavedRecipients(false);
  };

  const saveRecipient = async () => {
    if (!recipientInfo) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("http://127.0.0.1:8000/api/recipients", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipient_id: recipientInfo.id }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh saved recipients list
        await fetchSavedRecipients();
        
        // Show success message
        setMessage(`${recipientInfo.name} has been added to your saved recipients`);
        setMessageType("success");
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage("");
        }, 3000);
      } else {
        throw new Error(data.message || "Failed to save recipient");
      }
    } catch (error) {
      console.error("Error saving recipient:", error);
      setMessage(error.message);
      setMessageType("error");
    }
  };

  const removeSavedRecipient = async (id, e) => {
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`http://127.0.0.1:8000/api/recipients/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Refresh saved recipients list
        await fetchSavedRecipients();
      } else {
        const data = await response.json();
        throw new Error(data.message || "Failed to remove recipient");
      }
    } catch (error) {
      console.error("Error removing recipient:", error);
      setMessage(error.message);
      setMessageType("error");
    }
  };

  const initiateTransfer = () => {
    // Basic validation
    if (!recipientFound) {
      setMessage("Please search and select a valid recipient");
      setMessageType("error");
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setMessage("Please enter a valid amount");
      setMessageType("error");
      return;
    }

    if (amountValue > wallet.amount) {
      setMessage(`Insufficient balance. Your balance is ${wallet.amount.toFixed(2)} ${wallet.currency}`);
      setMessageType("error");
      return;
    }

    // Show confirmation dialog
    setShowConfirm(true);
  };

  const cancelTransfer = () => {
    setShowConfirm(false);
  };

  const confirmTransfer = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("http://127.0.0.1:8000/api/transfer/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient_email: recipientEmail,
          amount: parseFloat(amount),
          description: description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Successfully sent ${amount} ${wallet.currency} to ${recipientEmail}`);
        setMessageType("success");
        
        // Update local wallet balance
        if (data.sender_wallet) {
          setWallet({
            ...wallet,
            amount: parseFloat(data.sender_wallet.amount),
          });
        }
        
        // Reset form but keep the recipient selected
        setAmount("");
        setDescription("");
      } else {
        throw new Error(data.message || "Failed to send money");
      }
    } catch (error) {
      console.error("Transfer error:", error);
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setShowConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen from-slate-100 to-slate-200 dark:bg-gray-800 flex justify-center items-center pt-16">
        <div className="text-lg text-gray-700 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen from-slate-100 to-slate-200 dark:bg-gray-800 py-10 px-4 pt-24">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Send Money</h1>

        {message && (
          <div
            className={`${
              messageType === "success"
                ? "bg-green-100 border-green-400 text-green-700"
                : "bg-red-100 border-red-400 text-red-700"
            } border px-4 py-3 rounded relative mb-6`}
          >
            {message}
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">Your balance:</span>
            <span className="font-bold text-blue-600 dark:text-blue-300">
              {wallet.amount.toFixed(2)} {wallet.currency}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 dark:text-gray-300">Recipient</label>
              {savedRecipients.length > 0 && !recipientFound && (
                <button
                  onClick={() => setShowSavedRecipients(!showSavedRecipients)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showSavedRecipients ? "Hide Saved Recipients" : "Show Saved Recipients"}
                </button>
              )}
            </div>

            {showSavedRecipients && savedRecipients.length > 0 && (
              <div className="mb-4 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                {loadingSavedRecipients ? (
                  <div className="flex justify-center items-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  savedRecipients.map((recipient) => (
                    <div
                      key={recipient.id}
                      onClick={() => selectSavedRecipient(recipient)}
                      className="flex justify-between items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                    >
                      <div>
                        <div className="font-medium">{recipient.name}</div>
                        <div className="text-sm text-gray-500">{recipient.email}</div>
                      </div>
                      <button
                        onClick={(e) => removeSavedRecipient(recipient.id, e)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {!recipientFound && (
              <div className="flex space-x-2">
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => {
                    setRecipientEmail(e.target.value);
                    setRecipientFound(false);
                    setRecipientInfo(null);
                  }}
                  placeholder="Enter recipient email"
                  className="flex-1 p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
                <button
                  onClick={searchRecipient}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={searchingRecipient}
                >
                  {searchingRecipient ? "Searching..." : "Search"}
                </button>
              </div>
            )}

            {recipientFound && recipientInfo && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white">{recipientInfo.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{recipientInfo.email}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!savedRecipients.some(r => r.email === recipientInfo.email) && (
                      <button
                        onClick={saveRecipient}
                        className="text-blue-600 hover:text-blue-800"
                        title="Save recipient"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setRecipientFound(false);
                        setRecipientInfo(null);
                        setRecipientEmail("");
                      }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {recipientFound && (
            <>
              <div>
                <label htmlFor="amount" className="block text-gray-700 dark:text-gray-300 mb-2">
                  Amount to Send
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Amount in ${wallet.currency}`}
                  className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this payment for?"
                  className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <button
                onClick={initiateTransfer}
                className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700"
                disabled={!amount}
              >
                Send Money
              </button>
            </>
          )}

          <button
            onClick={() => navigate("/profile")}
            className="w-full bg-gray-200 text-gray-800 p-3 rounded-lg font-medium hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirm Transfer</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to send {parseFloat(amount).toFixed(2)} {wallet.currency} to{" "}
              <span className="font-medium">{recipientInfo?.name}</span> ({recipientEmail})?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelTransfer}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmTransfer}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}