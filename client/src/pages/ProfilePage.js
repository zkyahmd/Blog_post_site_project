import { useContext, useEffect, useState } from "react";
import { UserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ProfilePage() {
    const { userInfo, setUserInfo } = useContext(UserContext);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

        if (!username.trim() || !email.trim()) {
            toast.error('Username and Email are required.');
            return;
        }

        if (newPassword && newPassword !== confirmPassword) {
            toast.error("New password and confirmation do not match.");
            return;
        }

        const data = new FormData();
        data.set('username', username);
        data.set('email', email);
        if (currentPassword) data.set('currentPassword', currentPassword);
        if (newPassword) data.set('newPassword', newPassword);
        if (confirmPassword) data.set('confirmPassword', confirmPassword);
        if (avatar) data.set('avatar', avatar);

        try {
            const response = await fetch('http://localhost:4000/profile', {
                method: 'PUT',
                body: data,
                credentials: 'include',
            });

            if (response.ok) {
                const resUser = await response.json();
                const refetch = await fetch(`http://localhost:4000/user/${resUser.id}`);
                const fullUser = await refetch.json();
                setUserInfo(fullUser);

                toast.success('Profile updated successfully!');
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                const errorText = await response.text();
                console.error('Failed to update profile:', errorText);
                toast.error(`Failed to update: ${errorText}`);
            }
        } catch (error) {
            console.error('Network or server error:', error);
            toast.error('Network error while updating profile.');
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
                    Current Password
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                    />
                </label>
                <label>
                    New Password
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                    />
                </label>
                <label>
                    Confirm New Password
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                    />
                </label>
                <button type="submit" className="save-button">Save</button>
            </form>
        </div>
    );
}
