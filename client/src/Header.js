import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();  // <-- get current path
  const avatarSrc = userInfo?.avatar
    ? `http://localhost:4000/${userInfo.avatar}`
    : process.env.PUBLIC_URL + "/images/defaultAvatar.jpg";
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:4000/profile", {
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          response.json().then((userInfo) => {
            if (userInfo && userInfo.username) {
              setUserInfo(userInfo);
            } else {
              setUserInfo(null);
            }
          });
        } else {
          setUserInfo(null);
        }
      })
      .catch(() => setUserInfo(null));
  }, []);

  function logout() {
    fetch("http://localhost:4000/logout", {
      credentials: "include",
      method: "POST",
    });
    setUserInfo(null);
    navigate("/login");
  }

  const username = userInfo?.username;

  // Check if current path is admin page
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <header>
      <Link to="/" className="logo">
        My Blog
      </Link>
      <nav>
  {username && (
    <>
      <Link to="/" className="home">
        Home
      </Link>

      {/* Show admin panel link only if user is admin and not currently on admin page */}
      {userInfo.role === "admin" && !isAdminPage && (
        <Link to="/admin" className="adminPanel">
          Admin Panel
        </Link>
      )}

      {/* Show create post only if NOT admin or NOT on admin page */}
      {userInfo.role !== "admin" || !isAdminPage ? (
        <Link to="/create" className="newPost">
          Create new post
        </Link>
      ) : null}

      <div
        className="profile-menu-wrapper"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <img src={avatarSrc} alt="Profile" className="avatar" />
        {menuOpen && (
          <div className="dropdown">
            <Link to="/profile">Profile</Link>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  )}
  {!username && (
    <>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </>
  )}
</nav>
    </header>
  );
}
