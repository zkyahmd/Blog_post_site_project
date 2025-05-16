import { Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './Header';
import Post from './Post';

import Layout from './Layout';
import IndexPage from './pages/IndexPage';
import Login from './pages/Login';
import Register from './Register';
import { UserContextProvider } from './UserContext';
import CreatePost from './pages/CreatePost';
import PostPage from './pages/PostPage';
import EditPost from './pages/EditPost';
import ProfilePage from './pages/ProfilePage';
import AdminPage from "./pages/AdminPage";
import ProtectedAdminRoute from './ProtectedAdminRoute';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ManageUserPostsPage from './ManageUserPostsPage';



function App() {
  return (
    <UserContextProvider>
      <>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<main><IndexPage /></main>} />
          <Route path={'/login'} element={<Login />} />
          <Route path={'/register'} element={<Register />} />
          <Route path={'/create'} element={<CreatePost />} />
          <Route path={'/post/:id'} element ={<PostPage />}/>
          <Route path="/edit/:id" element={<EditPost />} />
          <Route path="/admin/manage-posts/:userId" element={<ManageUserPostsPage />} />
             <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminPage />
              </ProtectedAdminRoute>
            }
          />
           <Route
              path="/admin/edit-post/:id"
              element={
                <ProtectedAdminRoute> {/* Optionally protect this route as well */}
                  <EditPost isAdminEdit={true} /> {/* Pass a prop to EditPost */}
                </ProtectedAdminRoute>
              }
            />
        </Route>
        <Route path="/profile" element={<ProfilePage />} />
      
      </Routes>
     
        <ToastContainer position="top-center" autoClose={3000} />
        </>
    </UserContextProvider>



  );
}


export default App;
