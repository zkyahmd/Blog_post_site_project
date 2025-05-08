import { Link,useNavigate } from "react-router-dom";
import {useContext,useEffect, useState} from "react";
import {UserContext} from "./UserContext";
//import defaultAvatar from './defaultAvatar.png';
//import defaultAvatar from './images/defaultAvatar.jpg';

export default function Header() {
  const {setUserInfo,userInfo} = useContext(UserContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const defaultAvatar = process.env.PUBLIC_URL + "/images/defaultAvatar.jpg";
  const navigate = useNavigate(); 
  useEffect(() => {
    fetch('http://localhost:4000/profile', {
      credentials: 'include',
    }).then(response => {
      response.json().then(userInfo => {
        setUserInfo(userInfo);
      });
    });
  }, []);

    function logout(){
fetch('http://localhost:4000/logout',{
  credentials: 'include',
  method : 'POST',
    });
    setUserInfo(null);
    navigate('/login');
  }
  const username = userInfo?.username;

        return (
            <header>
              <Link to="/" className="logo">My Blog</Link>
              <nav>
                {username && (
                  <>
                  <Link to="/" className="home">Home</Link>
                    <Link to="/create" className="newPost">Create new post</Link>
                    <div className="profile-menu-wrapper" onClick={() => setMenuOpen(!menuOpen)}>
                    <img src={defaultAvatar} alt="Profile" className="avatar" />
              {menuOpen && (
                <div className="dropdown">
                  <Link to="/profile">Profile</Link>
                  <button onClick={logout}>Logout</button>
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
