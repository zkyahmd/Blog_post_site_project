import {useEffect, useState} from "react";
import {Navigate, useParams} from "react-router-dom";
// import 'react-quill/dist/quill.snow.css';
// import ReactQuill from "react-quill";
import Editor from "../Editor";
//import Editor from "../Editor";

export default function EditPost() {
    const {id} = useParams();
    const [title,setTitle] = useState('');
    const [summary,setSummary] = useState('');
    const [content,setContent] = useState('');
    const [files, setFiles] = useState('');
    const [redirect,setRedirect] = useState(false);

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

    useEffect(() => {
        fetch('http://localhost:4000/post/'+id)
          .then(response => {
            response.json().then(postInfo => {
              setTitle(postInfo.title);
              setContent(postInfo.content);
              setSummary(postInfo.summary);
            });
          });
      }, []);

      async function updatePost(ev) {
        ev.preventDefault();
        const data = new FormData();
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        data.set('id', id);
        if (files?.[0]) {
          data.set('file', files?.[0]);
        }
        const response = await fetch('http://localhost:4000/post', {
          method: 'PUT',
          body: data,
          credentials: 'include',
        });
        if (response.ok) {
          setRedirect(true);
        }
      }
    
      if (redirect) {
        return <Navigate to={'/post/'+id} />
      }
      
// const modules = {
//     toolbar: [
//       [{ header: [1, 2, false] }],
//       ['bold', 'italic', 'underline', 'strike', 'blockquote'],
//       [{ list: 'ordered' }, { list: 'bullet' }],
//       [{ indent: '-1' }, { indent: '+1' }],
//       ['link', 'image'],
//       ['clean']
//     ]
//   };
//   const formats = [
//     'header', 
//     'bold', 'italic', 'underline', 'strike', 'blockquote', 
//     'list', 'bullet', 'indent', 
//     'link', 'image'
//   ];

    return (
            <form onSubmit={updatePost} className="create-post-form">
              <input type="title"
                 placeholder={'Title'}
                 value={title}
                 onChange={ev => setTitle(ev.target.value)} />
          <input type="summary"
                 placeholder={'Summary'}
                 value={summary}
                 onChange={ev => setSummary(ev.target.value)} />
                 
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
              <button type="submit" className="submit-btn">Update Post</button>
            </form>
        );
}