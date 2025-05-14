import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import { useState } from "react";
import { Navigate } from "react-router-dom";
import Editor from "../Editor";

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState('');
  const [redirect, setRedirect] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (ev) => {
    const file = ev.target.files[0];
    setFiles(ev.target.files);

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);


      // setTimeout(() => {
      //   setPreview(null);
      //   URL.revokeObjectURL(previewUrl); 
      // }, 5000); 
    }
  };
  async function createNewPost(ev) {
    const data = new FormData();
    data.set('title', title);
    data.set('summary', summary);
    data.set('content', content);
    data.set('file', files[0]);
    ev.preventDefault();
    const response = await fetch('http://localhost:4000/post', {
      method: 'POST',
      body: data,
      credentials: 'include',
    });
    if (response.ok) {
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to={'/'} />
  }
  return (
    <form onSubmit={createNewPost} className="create-post-form">
      <input type="title"
        placeholder={'Title'}
        value={title}
        onChange={ev => setTitle(ev.target.value)} maxLength={100} />
      <input type="summary"
        placeholder={'Summary'}
        value={summary}
        onChange={ev => setSummary(ev.target.value)} maxLength={200}  />

      <input
        type="file"
        className="file-input"
        accept="image/*"
        onChange={handleFileChange} />
      {preview && (
        <img
          src={preview}
          alt="Preview"
          style={{
            maxWidth: '100%',
            maxHeight: '500px',
            borderRadius: '8px',
            margin: '10px 0'
          }}
        />
      )}
      <Editor onChange={setContent} value={content} />
      <button type="submit" className="submit-btn">Create Post</button>
    </form>
  );
}

