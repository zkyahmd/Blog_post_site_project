import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Login() {
  const [username, setUsername] = useState('');
  // const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);
  const { setUserInfo } = useContext(UserContext);
  async function login(ev) {
    ev.preventDefault();
    const response = await fetch('http://localhost:4000/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
   if (response.ok) {
  const data = await response.json();

  // Fetch full user info including avatar
  const userRes = await fetch(`http://localhost:4000/user/${data.id}`);
  const fullUser = await userRes.json();

  setUserInfo(fullUser);
 toast.success('Login successful!');
    setRedirect(true);
  } else {
    toast.error('Wrong credentials. Try again.');
  }
}
  //   // if (response.ok) {
  //   //   setRedirect(true);
  // }else {
  //            alert('wrong credentials');}}

  if (redirect) {
    return <Navigate to={'/'} />
  }
  return (
    <form className="login" onSubmit={login}>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Username or Email"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input type="password"
        placeholder="password"
        value={password}
        onChange={ev => setPassword(ev.target.value)} />
      <button>Login</button>
      <div className="link-message">
        Don't have an account? <Link to="/register">Register</Link>
      </div>
    </form>
  );
}