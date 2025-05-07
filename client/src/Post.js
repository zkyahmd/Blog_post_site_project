import { formatISO9075 } from "date-fns";
import{Link} from "react-router-dom";

export default function Post({_id,title, summary, cover, content, createdAt, author }) {
    return (
        <div className="post">
            <div className="image">
            <Link to={`/post/${_id}`}>
                <img src={'http://localhost:4000/' + cover} alt="post" />
                </Link>
            </div>

            <div className="text">  <Link to={`/post/${_id}`}><h2>{title} </h2> </Link><p className="info"> 
                <a className="author">{author.username}</a><time>{formatISO9075(new Date(createdAt))}</time></p>
                <p className="summary"> {summary}
                </p></div>

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