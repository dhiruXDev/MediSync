import express from 'express';
import Blog from '../models/Blog.js';
import User from '../models/User.js';
import auth from '../middlewares/auth.js';
import roles from '../middlewares/roles.js';

const router = express.Router();

import { configDotenv } from 'dotenv';
configDotenv();  
router.get('/', async (req, res) => {
  try {
    const { search, category, author } = req.query;
    let query = {};

   
    if (search) {
      query.$text = { $search: search };
    }

 
    if (category && category !== 'All') {
      query.category = category;
    }

    
    if (author) {
      query.authorName = { $regex: author, $options: 'i' };
    }

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .populate('authorId', 'username specialization');

    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('authorId', 'username specialization avatar');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

   
    blog.views += 1;
    await blog.save();

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.post('/', auth, roles(['doctor']), async (req, res) => {
  try {
    console.log('=== BLOG CREATION REQUEST ===');
    console.log('Request body:', req.body);
    console.log('User from token:', req.user);
    
    const { title, content, summary, category, tags, imageUrl } = req.body;

    if (!title || !content || !category) {
      console.log('Validation failed: missing required fields');
      return res.status(400).json({ message: 'Title, content, and category are required' });
    }

    console.log('Looking for user with ID:', req.user.userId);
    const user = await User.findById(req.user.userId);
    console.log('User found:', user);
    
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }

    const newBlog = new Blog({
      title,
      content,
      summary,
      category,
      tags,
      imageUrl,
      authorId: req.user.userId,
      authorName: user.username,
      authorSpecialization: user.specialization || 'General Practitioner'
    });

    console.log('New blog object:', newBlog);
    const savedBlog = await newBlog.save();
    console.log('Blog saved successfully:', savedBlog);
    res.status(201).json(savedBlog);
  } catch (error) {
    console.error('=== ERROR CREATING BLOG ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.put('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user is the author
    if (blog.authorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to edit this blog' });
    }

    const { title, content, summary, category, tags, imageUrl } = req.body;

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        summary,
        category,
        tags,
        imageUrl
      },
      { new: true, runValidators: true }
    );

    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete blog (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    
    if (blog.authorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get blogs by author
router.get('/author/:authorId', auth, async (req, res) => {
  try {
    const blogs = await Blog.find({ authorId: req.params.authorId })
      .sort({ createdAt: -1 });
    
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like/Unlike blog
router.post('/:id/like', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    
    blog.likes += 1;
    await blog.save();

    res.json({ likes: blog.likes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

   
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newComment = {
      userId: req.user.userId,
      userName: user.username,
      content
    };

    blog.comments.push(newComment);
    await blog.save();

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router; 