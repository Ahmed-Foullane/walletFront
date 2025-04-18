"use client"

import { useState, useEffect } from "react"

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [wallet, setWallet] = useState({
    user_id: 0,
    email: "",
    income: 0,
    outcome: 0,
    currency: "USD",
    amount: 0,
  });

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [allTransactions, setAllTransactions] = useState([]);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const profileResponse = await fetch("http://127.0.0.1:8000/api/profile", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const profileData = await profileResponse.json();
        
        if (!profileResponse.ok) {
          throw new Error(profileData.message || "Failed to load profile");
        }
        
        console.log("Profile data:", profileData);
        setUserData(profileData.user);
        
        
        if (profileData.user && profileData.user.wallet) {
          setWallet({
            user_id: profileData.user.wallet.user_id,
            email: profileData.user.wallet.email,
            income: parseFloat(profileData.user.wallet.income) || 0,
            outcome: parseFloat(profileData.user.wallet.outcome) || 0,
            currency: profileData.user.wallet.currency || "USD",
            amount: parseFloat(profileData.user.wallet.amount) || 0,
            created_at: new Date().toISOString().split('T')[0],
          });
        }
        
     
        try {
          const transactionsResponse = await fetch("http://127.0.0.1:8000/api/wallet/transactions", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          
          const transactionsData = await transactionsResponse.json();
          
          if (transactionsResponse.ok && transactionsData.transactions) {
            const formattedTransactions = transactionsData.transactions.map(tx => ({
              id: `tx-${tx.id}`,
              type: tx.type,
              amount: parseFloat(tx.amount),
              description: tx.description,
              date: new Date(tx.created_at).toISOString().split('T')[0],
              category: tx.category,
            }));
            
            setRecentTransactions(formattedTransactions);
          } else {
            setRecentTransactions([]);
          }
        } catch (txError) {
          console.error("Error fetching transactions:", txError);
          setRecentTransactions([]);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessageType("error");
      setMessage("Please enter a valid amount");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const response = await fetch("http://127.0.0.1:8000/api/wallet/deposit", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.wallet) {
          setWallet({
            ...wallet,
            income: parseFloat(data.wallet.income) || wallet.income,
            amount: parseFloat(data.wallet.amount) || wallet.amount,
          });
        }
        
        if (data.transaction) {
          const newTransaction = {
            id: `tx-${data.transaction.id || Date.now()}`,
            type: data.transaction.type,
            amount: parseFloat(data.transaction.amount),
            description: data.transaction.description,
            date: new Date().toISOString().split('T')[0],
            category: data.transaction.category,
          };
          setRecentTransactions([newTransaction, ...recentTransactions.slice(0, 2)]);
        }
        
        setMessageType("success");
        setMessage(`${amount.toFixed(2)} ${wallet.currency} has been added to your account`);
      } else {
        throw new Error(data.message || "Failed to deposit money");
      }
    } catch (error) {
      console.error("Error depositing money:", error);
      setMessageType("error");
      setMessage(error.message || "Failed to deposit money");
    }
    
    setDepositAmount("");
    
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };
  
  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessageType("error");
      setMessage("Please enter a valid amount");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const response = await fetch("http://127.0.0.1:8000/api/wallet/withdraw", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.wallet) {
          setWallet({
            ...wallet,
            outcome: parseFloat(data.wallet.outcome) || wallet.outcome,
            amount: parseFloat(data.wallet.amount) || wallet.amount,
          });
        }
      if (data.transaction) {
          const newTransaction = {
            id: `tx-${data.transaction.id || Date.now()}`,
            type: data.transaction.type,
            amount: parseFloat(data.transaction.amount),
            description: data.transaction.description,
            date: new Date().toISOString().split('T')[0],
            category: data.transaction.category,
          };
          setRecentTransactions([newTransaction, ...recentTransactions.slice(0, 2)]);
        }
        
        setMessageType("success");
        setMessage(`${amount.toFixed(2)} ${wallet.currency} has been withdrawn from your account`);
      } else {
        throw new Error(data.message || "Failed to withdraw money");
      }
    } catch (error) {
      console.error("Error withdrawing money:", error);
      setMessageType("error");
      setMessage(error.message || "Failed to withdraw money");
    }
    
    setWithdrawAmount("");
    
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const fetchAllTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const response = await fetch(`http://127.0.0.1:8000/api/transactions/all?page=${transactionsPage}&per_page=10`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        const formattedTransactions = data.data.map(tx => ({
          id: `tx-${tx.id}`,
          type: tx.type,
          amount: parseFloat(tx.amount),
          description: tx.description,
          date: new Date(tx.created_at).toISOString().split('T')[0],
          category: tx.category,
        }));
        
       
        if (transactionsPage === 1) {
          setAllTransactions(formattedTransactions);
        } else {
          setAllTransactions([...allTransactions, ...formattedTransactions]);
        }
        
        setHasMoreTransactions(data.current_page < data.last_page);
      } else {
        throw new Error(data.message || "Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Error fetching all transactions:", error);
      setMessageType("error");
      setMessage(error.message || "Failed to fetch transactions");
    }
  };
  
  const loadMoreTransactions = () => {
    setTransactionsPage(transactionsPage + 1);
    fetchAllTransactions();
  };
  
  const viewTransactionHistory = () => {
    setShowAllTransactions(true);
    setTransactionsPage(1);
    fetchAllTransactions();
  };

  const spentPercentage = wallet.income > 0 
    ? Math.round((wallet.outcome / wallet.income) * 100) 
    : 0;
  const remainingPercentage = 100 - spentPercentage;

  if (loading) {
    return (
      <div className="min-h-screen from-slate-100 to-slate-200 dark:bg-gray-800 flex justify-center items-center">
        <div className="text-lg text-gray-700 dark:text-gray-300">Loading profile data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen from-slate-100 to-slate-200 dark:bg-gray-800 flex justify-center items-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen from-slate-100 to-slate-200 dark:bg-gray-800 py-10 px-4">
      <div className="max-w-4xl mt-[50px] mx-auto shadow-xl bg-white dark:bg-gray-900 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-600"></div>
            <div>
              <div className="text-2xl font-semibold text-gray-800 dark:text-white">
                {userData?.name || "User"}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {userData?.email || wallet.email}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Role: {userData?.role?.name || "Client"}
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {message && (
            <div className={`${messageType === "success" ? "bg-green-100 border-green-400 text-green-700" : "bg-red-100 border-red-400 text-red-700"} border px-4 py-3 rounded relative`}>
              {message}
            </div>
          )}

          <div className="bg-slate-50 dark:bg-gray-700 p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Balance Overview</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">{wallet.currency}</span>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Spending Progress</span>
              <span className="text-sm font-medium">{spentPercentage}%</span>
            </div>

            <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
              <div className="h-2 bg-blue-600 dark:bg-blue-400 rounded-full" style={{ width: `${spentPercentage}%` }}></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-green-50 dark:bg-green-800 p-4 rounded-lg">
                <div className="text-sm text-green-700 dark:text-green-300">Income</div>
                <div className="text-xl font-semibold text-green-700 dark:text-green-200">+{wallet.income.toFixed(2)}</div>
              </div>

              <div className="bg-red-50 dark:bg-red-800 p-4 rounded-lg">
                <div className="text-sm text-red-700 dark:text-red-300">Outcome</div>
                <div className="text-xl font-semibold text-red-700 dark:text-red-200">-{wallet.outcome.toFixed(2)}</div>
              </div>

         
              <div className="bg-purple-50 dark:bg-purple-800 p-4 rounded-lg">
                <div className="text-sm text-purple-700 dark:text-purple-300">Balance</div>
                <div className="text-xl font-semibold text-purple-700 dark:text-purple-200">{wallet.amount.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-4">Deposit Money</h3>
              <div className="flex flex-col gap-4">
                <div className="flex-grow">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Amount to deposit"
                    className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                </div>
                <button
                  onClick={handleDeposit}
                  className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition"
                >
                  Deposit
                </button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-4">Withdraw Money</h3>
              <div className="flex flex-col gap-4">
                <div className="flex-grow">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Amount to withdraw"
                    className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                </div>
                <button
                  onClick={handleWithdraw}
                  className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          {!showAllTransactions && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-4">Recent Transactions</h3>
              <div className="space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 rounded-lg bg-white dark:bg-gray-700 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                            <div className={`h-6 w-6 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}></div>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-100">{transaction.description}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === "income" ? "+" : "-"} {transaction.amount.toFixed(2)} {wallet.currency}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                    No transactions found
                  </div>
                )}
              </div>
            </div>
          )}

          {showAllTransactions && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Transaction History</h3>
                <button 
                  onClick={() => setShowAllTransactions(false)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Back to Dashboard
                </button>
              </div>
              <div className="space-y-4">
                {allTransactions.length > 0 ? (
                  <>
                    {allTransactions.map((transaction) => (
                      <div key={transaction.id} className="p-4 rounded-lg bg-white dark:bg-gray-700 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                              <div className={`h-6 w-6 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}></div>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 dark:text-gray-100">{transaction.description}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === "income" ? "+" : "-"} {transaction.amount.toFixed(2)} {wallet.currency}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(transaction.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {hasMoreTransactions && (
                      <div className="text-center mt-4">
                        <button 
                          onClick={loadMoreTransactions}
                          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                        >
                          Load More
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                    No transactions found
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="relative mt-4">
            <button
              onClick={viewTransactionHistory}
              className="w-full py-3 text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Transaction History
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}