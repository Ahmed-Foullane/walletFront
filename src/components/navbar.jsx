import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    checkAuth();

    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const initiateLogout = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const confirmLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (token) {
        await fetch("http://127.0.0.1:8000/api/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setShowLogoutConfirm(false);
      navigate("/login");
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getLinkClass = (path) => {
    return isActive(path) 
      ? "text-blue-600 dark:text-blue-400 font-medium border-b-2 border-blue-600 dark:border-blue-400" 
      : "text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium";
  };

  const getMobileLinkClass = (path) => {
    return isActive(path) 
      ? "block text-blue-600 dark:text-blue-400 font-medium" 
      : "block text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium";
  };

  return (
    <>
      <nav className={`bg-white shadow-md dark:bg-gray-900 w-full fixed`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 text-xl font-bold text-blue-600 dark:text-white">
              <Link to="/">MyWallet</Link>
            </div>

           
            <div className="hidden md:flex space-x-6">
              {!isLoggedIn ? (
                <>
                  <Link
                    to="/login"
                    className={getLinkClass("/login")}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className={getLinkClass("/register")}
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/profile"
                    className={getLinkClass("/profile")}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/send-money"
                    className={getLinkClass("/send-money")}
                  >
                    Send Money
                  </Link>
                  <button
                    onClick={initiateLogout}
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>

          
            <button
              onClick={toggleMenu}
              className="md:hidden text-gray-700 dark:text-gray-300"
            >
              {isOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden px-4 pb-4 space-y-2">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className={getMobileLinkClass("/login")}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={getMobileLinkClass("/register")}
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/profile"
                  className={getMobileLinkClass("/profile")}
                >
                  Profile
                </Link>
                <Link
                  to="/send-money"
                  className={getMobileLinkClass("/send-money")}
                >
                  Send Money
                </Link>
                <button
                  onClick={initiateLogout}
                  className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium text-left w-full"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirm Logout</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}