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

       
        <p className="summary" dangerouslySetInnerHTML={{ __html: highlightText(safeText(summary), searchTerm) }}></p>
        <div className="content" dangerouslySetInnerHTML={{ __html: highlightText(safeText(content), searchTerm) }}></div>
      </div>
    </div>
 

        // <div className="post">
        // <div className="image"><img src="/images/post_one.jpg" alt="post" /></div>

        // <div className="text"> <h2>Flower Business</h2><p className="info"><a className="author">M.S Zaky Ahamed</a><time>2025-01-05 3.03</time></p>
        // <p className="summary"> Flowers are awesome for peaceful life. If we have flowers in our house then our house is naturally amazing one.</p></div>

        // </div>

        // <div className="post">
        // <div className="image"><img src="/images/post_one.jpg" alt="post" /></div>

        // <div className="text"> <h2>Flower Business</h2><p className="info"><a className="author">M.S Zaky Ahamed</a><time>2025-01-05 3.03</time></p>
        // <p className="summary"> Flowers are awesome for peaceful life. If we have flowers in our house then our house is naturally amazing one.</p></div>

        // </div>
    );
}