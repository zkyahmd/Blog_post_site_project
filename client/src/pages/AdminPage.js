import { useEffect, useState, useContext } from "react";
import { UserContext } from "../UserContext";
import { Navigate, useNavigate } from "react-router-dom";

export default function AdminPage() {
  const { userInfo } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for the search term
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:4000/admin/users", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
      });
  }, []);

  if (!userInfo?.role || userInfo.role !== "admin") {
    return <Navigate to="/" />;
  }

  // Function to handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filter users based on the search term with null checks
  const filteredUsers = users.filter((user) =>
    (user.username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page">
      <h1>Welcome, Admin!</h1>

      {/* Search Bar */}
      <div className="search-bar1" style={{ marginBottom: '20px', width: '400px' }}>
        <input
          type="text"
          placeholder="Search Users..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-bar-field"
        />
      </div>

      <h2>Users List</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers
            .filter((u) => u._id !== userInfo._id) // exclude logged-in admin
            .map((user) => (
              <tr key={user._id}>
                <td data-label="Username">{user.username}</td>
                <td data-label="Email">{user.email}</td>
                <td data-label="Role">{user.role}</td>
                <td data-label="Actions">
                  <button
                    className="bg-blue-500"
                    style={{ marginRight: "10px" }}
                    onClick={() => navigate(`/admin/manage-posts/${user._id}`)}
                  >
                    Manage Posts
                  </button>
                  {/* <button className="bg-red-500">
                    Manage User
                  </button> */}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
