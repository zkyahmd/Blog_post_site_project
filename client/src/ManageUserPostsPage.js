import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

export default function ManageUserPostsPage() {
  const { userId } = useParams();
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    fetch(`http://localhost:4000/admin/posts/${userId}`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => setPosts(data));
  }, [userId]);

  const handleDelete = async (postId) => {
    confirmAlert({
      title: "Confirm Deletion",
      message: "Are you sure you want to delete this post?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              const res = await fetch(`http://localhost:4000/admin/post/${postId}`, {
                method: "DELETE",
                credentials: "include",
              });

              if (res.ok) {
                setPosts(posts.filter((p) => p._id !== postId));
                toast.success("Post deleted successfully");
              } else {
                const errorData = await res.text();
                toast.error(`Failed to delete post: ${errorData}`);
              }
            } catch (err) {
              toast.error("An error occurred");
            }
          },
        },
        {
          label: "No",
          onClick: () => {
            toast.info("Deletion cancelled");
          },
        },
      ],
    });
  };

  const handleEdit = (postId) => {
    navigate(`/admin/edit-post/${postId}`); // Navigate to EditPost page
  };

  const formatDateTime = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="manage-posts-container">
      <h1>User's Posts</h1>
      {posts.map(post => (
        <div key={post._id} className="post-card">
          {post.cover && (
            <Link to={`/post/${post._id}`}>
              <img src={`http://localhost:4000/${post.cover}`} alt="Post" className="post-image" />
            </Link>
          )}
          <h2>
            <Link to={`/post/${post._id}`}>{post.title}</Link>
          </h2>
          <p>{post.summary}</p>
          <p className="post-date">{formatDateTime(post.createdAt)}</p>
          <button className="bg-yellow-500" onClick={() => handleEdit(post._id)}>
            Edit
          </button>
          <button className="bg-red-500" onClick={() => handleDelete(post._id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}