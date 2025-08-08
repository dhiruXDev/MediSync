import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'General Health',
      'Mental Health',
      'Nutrition & Diet',
      'Fitness & Exercise',
      'Disease Prevention',
      'Women\'s Health',
      'Men\'s Health',
      'Child Health',
      'Senior Health',
      'Emergency Care',
      'Medication Guide',
      'Lifestyle Tips'
    ]
  },
  tags: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  authorSpecialization: {
    type: String,
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});


blogSchema.index({ title: 'text', content: 'text', authorName: 'text' });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog; 