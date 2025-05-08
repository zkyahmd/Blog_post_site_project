import { useEffect, useState } from "react";
import Post from "../Post";

export default function IndexPage() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); 

  useEffect(() => {
    fetch('http://localhost:4000/post').then(response => {
      response.json().then(posts => {
        setPosts(posts);
      });
    });
  }, []);

  // Function to handle the search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter the posts based on the search term
  const filteredPosts = posts.filter(post => {
    const titleMatch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const contentMatch = post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || contentMatch; 
  });

  return (
    <>

  
  <div className="search-wrapper">
    <input
      type="text"
      value={searchTerm}
      onChange={handleSearchChange}
      placeholder="Search posts..."
      className="search-bar"
    />
  </div>

  <main>
    {filteredPosts.length > 0 ? (
      filteredPosts.map(post => (
        <Post key={post._id} {...post} searchTerm={searchTerm} />
      ))
    ) : (
      <p>No posts found</p>
    )}
  </main>
</>
  );
}
