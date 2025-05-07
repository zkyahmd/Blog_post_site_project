import { Link,useNavigate } from "react-router-dom";
import {useContext,useEffect, useState} from "react";
import {UserContext} from "./UserContext";

export default function Header() {
  const {setUserInfo,userInfo} = useContext(UserContext);
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
                    <Link to="/create" className="newPost">Create new post</Link>
                    <a onClick={logout} className="logout">Logout</a>
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
