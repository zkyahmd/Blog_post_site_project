import { Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './Header';
import Post from './Post';
// import Login from './Login';
// import Register from './Register';
//import post_one from './images/post_one.jpg';
import Layout from './Layout';
import IndexPage from './pages/IndexPage';
import Login from './pages/Login';
import Register from './Register';
import { UserContextProvider } from './UserContext';
import CreatePost from './pages/CreatePost';
import PostPage from './pages/PostPage';
import EditPost from './pages/EditPost';
import ProfilePage from './pages/ProfilePage';



function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<main><IndexPage /></main>} />
          <Route path={'/login'} element={<Login />} />
          <Route path={'/register'} element={<Register />} />
          <Route path={'/create'} element={<CreatePost />} />
          <Route path={'/post/:id'} element ={<PostPage />}/>
          <Route path="/edit/:id" element={<EditPost />} />
          
        </Route>
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </UserContextProvider>



  );
}


export default App;
