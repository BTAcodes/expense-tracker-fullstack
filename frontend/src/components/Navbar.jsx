import { useEffect, useRef, useState } from "react";
import { navbarStyles } from "../assets/dummyStile";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, User } from "lucide-react";
import axios from "axios";

const BASE_URL = `http://localhost:4000/api`;

const Navbar = ({ user: propUser, onLogout }) => {
  const navigate = useNavigate();
  const menRef = useRef();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = propUser || {
    name: "",
    email: "",
  };
  // to fetch the user data from server
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${BASE_URL}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = response.data.user || response.data;
        setUser(userData);
      } catch (error) {
        console.error(`failed to load profile` + error);
      }
    };
    if (!propUser) {
      fetchUserData();
    }
  }, [propUser]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleLoguot = () => {
    setMenuOpen(false);
    localStorage.removeItem("token");
    onLogout?.();
    navigate("/login");
  };

  // close the toggle menu if click outside the box

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menRef.current && !menRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={navbarStyles.header}>
      <div className={navbarStyles.container}>
        <div
          onClick={() => navigate("/")}
          className={navbarStyles.logoContainer}
        >
          <span className={navbarStyles.logoText}>Expense Tracker</span>
        </div>
        {/* if the user is present  */}
        {user && (
          <div className={navbarStyles.userContainer} ref={menRef}>
            <button onClick={toggleMenu} className={navbarStyles.userButton}>
              <div className="relative">
                <div className={navbarStyles.userAvatar}>
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className={navbarStyles.statusIndicator}></div>
              </div>
              <div className={navbarStyles.userTextContainer}>
                <p className={navbarStyles.userName}>{user?.name || "User"}</p>
                <p className={navbarStyles.userEmail}>
                  {user?.email || "user@expensetracker.com"}
                </p>
              </div>
              <ChevronDown className={navbarStyles.chevronIcon(menuOpen)} />
            </button>
            {/* dropDown menu */}
            {menuOpen && (
              <div className={navbarStyles.dropdownMenu}>
                <div className={navbarStyles.dropdownHeader}>
                  <div className="flex items-center gap-3">
                    <div className={navbarStyles.dropdownAvatar}>
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className={navbarStyles.dropdownName}>
                        {user?.name || "User"}
                      </div>
                      <div className={navbarStyles.dropdownEmail}>
                        {user?.email || "user@expensetracker.com"}
                      </div>
                    </div>
                  </div>
                  <div className={navbarStyles.menuItemContainer}>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/profile");
                      }}
                      className={navbarStyles.menuItem}
                    >
                      <User className="w-4 h-4" />
                      <span>My profile</span>
                    </button>
                  </div>
                </div>
                <div className={navbarStyles.menuItemBorder}>
                  <button
                    onClick={handleLoguot}
                    className={navbarStyles.logoutButton}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
