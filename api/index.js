const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');

const salt = bcrypt.genSaltSync(10);
const secret = 'asdfe45we45w345wegw345werjktjwertkj';

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect("mongodb://localhost:27017/blogDb");

// Register
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      email,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    console.error(e);
    res.status(400).json(e);
  }
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const isEmail = username.includes('@');

  const userDoc = await User.findOne(
    isEmail ? { email: username } : { username }
  );

  const passOk = userDoc && bcrypt.compareSync(password, userDoc.password);

  if (passOk) {
    // Add role to token and response
    jwt.sign(
      { username, id: userDoc._id, role: userDoc.role }, 
      secret,
      {},
      (err, token) => {
        if (err) return res.status(500).json('Token error');
        res.cookie('token', token).json({
          id: userDoc._id,
          username: userDoc.username,
          role: userDoc.role, 
        });
      }
    );
  } else {
    res.status(400).json('wrong credentials');
  }
});

function verifyAdmin(req, res, next) {
  const { token } = req.cookies;
  if (!token) return res.status(401).json('No token provided');

  jwt.verify(token, secret, {}, (err, userInfo) => {
    if (err) return res.status(401).json('Invalid token');

    if (userInfo.role !== 'admin') {
      return res.status(403).json('Access denied: Admins only');
    }
    req.user = userInfo; // attach user info to req
    next();
  });
}
// app.get('/admin/users', verifyAdmin, async (req, res) => {
//   const users = await User.find({});
//   res.json(users);
// });

// Get all users (admin only)
app.get('/admin/users', verifyAdmin, async (req, res) => {
  const users = await User.find({}, '-password'); // exclude passwords
  res.json(users);
});

// Delete a user by id (admin only)
app.delete('/admin/user/:id', verifyAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (e) {
    res.status(500).json('Server error');
  }
});

// Update user role (admin only)
app.put('/admin/user/:id/role', verifyAdmin, async (req, res) => {
  const { role } = req.body; // 'user' or 'admin'
  if (!['user', 'admin'].includes(role)) return res.status(400).json('Invalid role');
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json(updatedUser);
  } catch (e) {
    res.status(500).json('Server error');
  }
});

// List all posts (admin only)
app.get('/admin/posts', verifyAdmin, async (req, res) => {
  const posts = await Post.find().populate('author', 'username email role');
  res.json(posts);
});

// Delete a post by id (admin only)
app.delete('/admin/post/:id', verifyAdmin, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (e) {
    res.status(500).json('Server error');
  }
});


app.get('/admin/posts/:userId', verifyAdmin, async (req, res) => {
  const { userId } = req.params;
  try {
    const posts = await Post.find({ author: userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json('Error fetching posts');
  }
});
// const bcrypt = require('bcryptjs');
// const User = require('./models/User'); // adjust path if needed

async function createDefaultAdmin() {
  const existingAdmin = await User.findOne({ username: 'admin' });
  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
    });
    console.log('✅ Default admin created: username=admin, password=admin123');
  } else {
    console.log('✅ Default admin already exists');
  }
}

createDefaultAdmin();


// Profile
app.get('/profile', async (req, res) => {
    const { token } = req.cookies;
    if (!token) return res.status(401).json('No token');

    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) return res.status(401).json('Invalid token');

        try {
            const userDoc = await User.findById(info.id);
            if (!userDoc) return res.status(404).json('User not found');

            res.json({
                id: userDoc._id,
                username: userDoc.username,
                email: userDoc.email,
                avatar: userDoc.avatar || null,
                role: userDoc.role, 
            });
        } catch (error) {
            console.error('Profile fetch error:', error);
            res.status(500).json('Server error');
        }
    });
});

app.put('/profile', uploadMiddleware.single('avatar'), async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.status(401).json('No token');

    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) return res.status(401).json('Token error');
      const userId = info.id;
      const {
        username,
        email,
        currentPassword,
        newPassword,
        confirmPassword
      } = req.body;

      const user = await User.findById(userId);
      if (!user) return res.status(404).json('User not found');

      // Prepare updates
      const updates = {
        username: username || user.username,
        email: email || user.email
      };

      //  Handle password update with proper validation
      if (currentPassword || newPassword || confirmPassword) {
        if (!currentPassword) {
          return res.status(400).json('Current password is required');
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json('Current password is incorrect');
        }

        if (!newPassword || newPassword.length < 4) {
          return res.status(400).json('New password must be at least 4 characters');
        }

        if (newPassword !== confirmPassword) {
          return res.status(400).json('New passwords do not match');
        }

        updates.password = bcrypt.hashSync(newPassword, salt);
      }

      //  Handle avatar update
      if (req.file) {
        const { originalname, path } = req.file;
        const ext = originalname.split('.').pop();
        const newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
        updates.avatar = newPath;
      }

      //  Save updated user info
      const userDoc = await User.findByIdAndUpdate(userId, updates, { new: true });

      res.json({
        id: userDoc._id,
        username: userDoc.username,
        email: userDoc.email,
        avatar: userDoc.avatar,
      });
    });
  } catch (error) {
    console.error('Profile Update Error:', error);
    res.status(500).json('Server error');
  }
});


app.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json('User not found');
    res.json(user);
  } catch (err) {
    res.status(500).json('Server error');
  }
});

// Logout
app.post('/logout', (req, res) => {
  res.cookie('token', '').json('ok');
});

// Search
app.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Search query is required' });

  try {
    const regex = new RegExp(q, 'i');
    const results = await Post.find({
      $or: [
        { title: regex },
        { summary: regex },
        { content: regex }
      ]
    }).populate('author', ['username']).sort({ createdAt: -1 });

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while searching' });
  }
});

// Create Post
app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
  try {
    const { originalname, path } = req.file;
    const ext = originalname.split('.').pop();
    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) return res.status(401).json('Invalid token');
      const { title, summary, content } = req.body;
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: newPath,
        author: info.id,
      });
      res.json(postDoc);
    });
  } catch (error) {
    console.error('Create Post Error:', error);
    res.status(500).json('Server error');
  }
});

// Update Post
app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
  try {
    let newPath = null;
    if (req.file) {
      const { originalname, path } = req.file;
      const ext = originalname.split('.').pop();
      newPath = path + '.' + ext;
      fs.renameSync(path, newPath);
    }

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) return res.status(401).json('Invalid token');

      const { id, title, summary, content } = req.body;
      const postDoc = await Post.findById(id);
      if (!postDoc) return res.status(404).json('Post not found');

      // Check if the user is the author OR an admin
      const isAuthor = String(postDoc.author) === String(info.id);
      const isAdmin = info.role === 'admin';

      if (!isAuthor && !isAdmin) {
        return res.status(403).json('Not authorized');
      }

      postDoc.title = title;
      postDoc.summary = summary;
      postDoc.content = content;
      postDoc.cover = newPath ? newPath : postDoc.cover;

      await postDoc.save();
      res.json(postDoc);
    });
  } catch (error) {
    console.error('Update Post Error:', error);
    res.status(500).json('Server error');
  }
});
// Get all posts
app.get('/post', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', ['username'])
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(posts);
  } catch (error) {
    console.error('Get Posts Error:', error);
    res.status(500).json('Server error');
  }
});

// Get single post by ID
app.get('/post/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    if (!postDoc) return res.status(404).json('Post not found');
    res.json(postDoc);
  } catch (error) {
    console.error('Get Single Post Error:', error);
    res.status(500).json('Server error');
  }
});


//Delete Post
app.delete('/post/:id', async (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) return res.status(401).json('Unauthorized');

    try {
      const postDoc = await Post.findById(req.params.id);
      if (!postDoc) return res.status(404).json('Post not found');

      const isAuthor = String(postDoc.author) === String(info.id);
      if (!isAuthor) return res.status(403).json('Not authorized');

      await Post.findByIdAndDelete(req.params.id);

      res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Delete Post Error:', error);
      res.status(500).json('Server error');
    }
  });
});


app.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});
