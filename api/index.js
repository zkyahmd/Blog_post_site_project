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
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) return res.status(500).json('Token error');
      res.cookie('token', token).json({ id: userDoc._id, username });
    });
  } else {
    res.status(400).json('wrong credentials');
  }
});

// Profile
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
      const { username, email, password } = req.body;

      const updates = { username, email };

      if (password && password.length >= 4) {
        updates.password = bcrypt.hashSync(password, salt);
      }

      if (req.file) {
        const { originalname, path } = req.file;
        const ext = originalname.split('.').pop();
        const newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
        updates.avatar = newPath;
      }

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

      const isAuthor = String(postDoc.author) === String(info.id);
      if (!isAuthor) return res.status(403).json('Not the author');

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

app.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});
