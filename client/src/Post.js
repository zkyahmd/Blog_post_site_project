import { formatISO9075 } from "date-fns";
import { Link } from "react-router-dom";

// Function to highlight search term in the text
const highlightText = (text, searchTerm) => {
  if (!searchTerm) return text;

  // Escape HTML characters
  const escapedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  
  const regex = new RegExp(`(${searchTerm})`, 'gi'); // case insensitive, global search
  return escapedText.replace(regex, '<span class="highlight">$1</span>');
};

export default function Post({ _id, title, summary, cover, content, createdAt, author, searchTerm }) {

  // Function to remove unwanted HTML tags
  const safeText = (text) => {
    // Remove tags except <b>, <i>, <u>, <a> (can modify as per need)
    const div = document.createElement('div');
    div.innerHTML = text;
    return div.textContent || div.innerText || '';
  };

  // Limit the number of characters in the summary
  const truncatedSummary = summary.length > 200 ? `${summary.substring(0, 200)}...` : summary;

  return (
    <div className="post">
      <div className="image">
        <Link to={`/post/${_id}`}>
          <img src={'http://localhost:4000/' + cover} alt="post" />
        </Link>
      </div>

      <div className="text">
        <Link to={`/post/${_id}`}>
          <h2 dangerouslySetInnerHTML={{ __html: highlightText(title, searchTerm) }}></h2>
        </Link>
        <p className="info">
          <a className="author">{author.username}</a>
          <time>{formatISO9075(new Date(createdAt))}</time>
        </p>

   
        <p className="summary" dangerouslySetInnerHTML={{ __html: highlightText(safeText(truncatedSummary), searchTerm) }}></p>

        <Link to={`/post/${_id}`} className="see-more" style={{ cursor: 'pointer', color: '#007bff' }}>See more...</Link>
      </div>
    </div>
  );
}
