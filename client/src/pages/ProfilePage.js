import { useContext, useEffect, useState } from "react";
import { UserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
    const { userInfo, setUserInfo } = useContext(UserContext);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [preview, setPreview] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUserInfo() {
            const response = await fetch('http://localhost:4000/profile', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                const userRes = await fetch(`http://localhost:4000/user/${data.id}`);
                const fullUserInfo = await userRes.json();
                setUserInfo(fullUserInfo);
            }
        }

        fetchUserInfo();
    }, []);

    useEffect(() => {
        if (userInfo) {
            setUsername(userInfo.username || '');
            setEmail(userInfo.email || '');
            if (userInfo.avatar) {
                setPreview(`http://localhost:4000/${userInfo.avatar}`);
            }
        }
    }, [userInfo]);

    function handleAvatarChange(e) {
        const file = e.target.files[0];
        setAvatar(file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const data = new FormData();
        data.set('username', username);
        data.set('email', email);
        if (password) data.set('password', password);
        if (avatar) data.set('avatar', avatar);

        const response = await fetch('http://localhost:4000/profile', {
            method: 'PUT',
            body: data,
            credentials: 'include',
        });

        if (response.ok) {
            const resUser = await response.json();

            // Refetch fresh user data to ensure avatar updates
            const refetch = await fetch(`http://localhost:4000/user/${resUser.id}`);
            const fullUser = await refetch.json();

            setUserInfo(fullUser);
            navigate('/');
        } else {
            alert('Failed to update profile');
        }
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <button className="back-button" onClick={() => navigate(-1)}>←</button>
                <h2>Edit Profile</h2>
            </div>

            <div className="profile-avatar-wrapper">
                {preview ? (
                    <img src={preview} alt="Avatar" className="profile-avatar" />
                ) : (
                    <div className="profile-avatar placeholder" />
                )}
                <label htmlFor="avatar-upload" className="avatar-upload-label">+</label>
                <input id="avatar-upload" type="file" onChange={handleAvatarChange} hidden />
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
                <label>
                    Name
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your name"
                    />
                </label>
                <label>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                    />
                </label>
                <label>
                    New Password (optional)
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••"
                    />
                </label>
                <button type="submit" className="save-button">Save</button>
            </form>
        </div>
    );
}
