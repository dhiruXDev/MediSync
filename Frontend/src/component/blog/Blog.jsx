import React, { useState, useEffect } from 'react';
import { FaUserMd, FaCalendarAlt, FaClock, FaEdit, FaTrash, FaPlus, FaEye, FaHeart, FaComment, FaShare, FaBookmark, FaSearch, FaFilter } from 'react-icons/fa';
import { useUser } from '../shared/UserContext';
import { BASE_URL } from '../../utils/Data';

const Blog = () => {
  const { user } = useUser();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const token = localStorage.getItem('token');

  const [blogForm, setBlogForm] = useState({
    title: '',
    content: '',
    category: '',
    summary: '',
    tags: '',
    imageUrl: ''
  });

  const categories = [
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
  ];

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${BASE_URL}/blogs`);
      if (response.ok) {
        const data = await response.json();
        setBlogs(data);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    try {
      const response = await fetch(`${BASE_URL}/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(blogForm)
      });

      if (response.ok) {
        const newBlog = await response.json();
        setBlogs(prev => [newBlog, ...prev]);
        setBlogForm({
          title: '',
          content: '',
          category: '',
          summary: '',
          tags: '',
          imageUrl: ''
        });
        setView('all');
        alert('Blog published successfully!');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to publish blog');
      }
    } catch (error) {
      console.error('Error publishing blog:', error);
      alert('Error publishing blog');
    }
  };

  const handleDeleteBlog = async (blogId) => {
    try {
      const response = await fetch(`${BASE_URL}/blogs/${blogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setBlogs(prev => prev.filter(blog => blog._id !== blogId));
        setShowDeleteConfirm(false);
        setBlogToDelete(null);
        alert('Blog deleted successfully!');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Error deleting blog');
    }
  };

  const confirmDeleteBlog = (blog) => {
    setBlogToDelete(blog);
    setShowDeleteConfirm(true);
  };

  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setBlogForm({
      title: blog.title,
      content: blog.content,
      category: blog.category,
      summary: blog.summary || '',
      tags: blog.tags || '',
      imageUrl: blog.imageUrl || ''
    });
    setView('edit');
  };

  const handleUpdateBlog = async (e) => {
    e.preventDefault();
    if (!token || !editingBlog) return;

    try {
      const response = await fetch(`${BASE_URL}/blogs/${editingBlog._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(blogForm)
      });

      if (response.ok) {
        const updatedBlog = await response.json();
        setBlogs(prev => prev.map(blog => 
          blog._id === editingBlog._id ? updatedBlog : blog
        ));
        setEditingBlog(null);
        setBlogForm({
          title: '',
          content: '',
          category: '',
          summary: '',
          tags: '',
          imageUrl: ''
        });
        setView('my-blogs');
        alert('Blog updated successfully!');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update blog');
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      alert('Error updating blog');
    }
  };

  const handleInputChange = (e) => {
    setBlogForm({
      ...blogForm,
      [e.target.name]: e.target.value
    });
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.authorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Blog</h1>
          <p className="text-gray-600">Expert health advice and insights from our medical professionals</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'all', name: 'All Blogs', icon: <FaEye /> },
                ...(user?.role === 'doctor' ? [
                  { id: 'write', name: 'Write Blog', icon: <FaPlus /> },
                  { id: 'my-blogs', name: 'My Blogs', icon: <FaEdit /> },
                  ...(view === 'edit' ? [{ id: 'edit', name: 'Edit Blog', icon: <FaEdit /> }] : [])
                ] : [])
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    view === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {view === 'all' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search blogs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div className="text-sm text-gray-600 flex items-center">
                  <FaFilter className="mr-2" />
                  {filteredBlogs.length} blogs found
                </div>
              </div>
            </div>

            {filteredBlogs.length === 0 ? (
              <div className="text-center py-12">
                <FaEdit className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlogs.map((blog) => (
                  <div key={blog._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    {blog.imageUrl && (
                      <div className="h-48 bg-gray-200">
                        <img
                          src={blog.imageUrl}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-center mb-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {blog.category}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                        {blog.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {blog.summary || truncateText(blog.content)}
                      </p>

                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {blog.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{blog.authorName}</p>
                          <p className="text-xs text-gray-500">{blog.authorSpecialization}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-1" />
                          {formatDate(blog.createdAt)}
                        </div>
                        <div className="flex items-center space-x-4">
                          <button className="flex items-center hover:text-blue-600 transition-colors">
                            <FaHeart className="mr-1" />
                            <span>0</span>
                          </button>
                          <button className="flex items-center hover:text-blue-600 transition-colors">
                            <FaComment className="mr-1" />
                            <span>0</span>
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBlog(blog);
                            setShowModal(true);
                          }}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Read More
                        </button>
                        {user?.role === 'doctor' && blog.authorId === user.id && (
                          <>
                            <button
                              onClick={() => handleEditBlog(blog)}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              title="Edit Blog"
                            >
                              <FaEdit className="text-sm" />
                            </button>
                            <button
                              onClick={() => confirmDeleteBlog(blog)}
                              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              title="Delete Blog"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'write' && user?.role === 'doctor' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Write New Blog</h3>
            <form onSubmit={handleBlogSubmit} className="flex flex-col space-y-10">
              {/* Blog Details */}
              <section>
                <div className="flex items-center mb-4">
                  <FaEdit className="mr-2 text-blue-500" />
                  <h4 className="text-xl font-semibold text-gray-900">Blog Details</h4>
                </div>
                <div className="flex flex-col gap-8">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={blogForm.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter blog title"
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={blogForm.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>
              <hr className="my-4" />
              {/* Content Section */}
              <section>
                <div className="flex items-center mb-4">
                  <FaEdit className="mr-2 text-green-500" />
                  <h4 className="text-xl font-semibold text-gray-900">Content</h4>
                </div>
                <div className="flex flex-col gap-8">
                  <div>
                    <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
                    <textarea
                      id="summary"
                      name="summary"
                      value={blogForm.summary}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief summary of the blog"
                    />
                  </div>
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                    <textarea
                      id="content"
                      name="content"
                      value={blogForm.content}
                      onChange={handleInputChange}
                      required
                      rows={10}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Write your blog content here"
                    />
                  </div>
                </div>
              </section>
              <hr className="my-4" />
              {/* Meta Section */}
              <section>
                <div className="flex items-center mb-4">
                  <FaEdit className="mr-2 text-indigo-500" />
                  <h4 className="text-xl font-semibold text-gray-900">Meta Information</h4>
                </div>
                <div className="flex flex-col gap-8">
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={blogForm.tags}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="health, wellness, nutrition"
                    />
                  </div>
                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                    <input
                      type="url"
                      id="imageUrl"
                      name="imageUrl"
                      value={blogForm.imageUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </section>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 bg-white sticky bottom-0 z-10">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold flex items-center justify-center"
                >
                  Publish Blog
                </button>
                <button
                  type="button"
                  onClick={() => setView('all')}
                  className="flex-1 bg-white text-gray-700 py-3 px-6 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {view === 'edit' && user?.role === 'doctor' && editingBlog && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Edit Blog</h3>
            <form onSubmit={handleUpdateBlog} className="flex flex-col space-y-10">
              {/* Blog Details */}
              <section>
                <div className="flex items-center mb-4">
                  <FaEdit className="mr-2 text-blue-500" />
                  <h4 className="text-xl font-semibold text-gray-900">Blog Details</h4>
                </div>
                <div className="flex flex-col gap-8">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={blogForm.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter blog title"
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={blogForm.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>
              <hr className="my-4" />
              {/* Content Section */}
              <section>
                <div className="flex items-center mb-4">
                  <FaEdit className="mr-2 text-green-500" />
                  <h4 className="text-xl font-semibold text-gray-900">Content</h4>
                </div>
                <div className="flex flex-col gap-8">
                  <div>
                    <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
                    <textarea
                      id="summary"
                      name="summary"
                      value={blogForm.summary}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief summary of the blog"
                    />
                  </div>
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                    <textarea
                      id="content"
                      name="content"
                      value={blogForm.content}
                      onChange={handleInputChange}
                      required
                      rows={10}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Write your blog content here"
                    />
                  </div>
                </div>
              </section>
              <hr className="my-4" />
              {/* Meta Section */}
              <section>
                <div className="flex items-center mb-4">
                  <FaEdit className="mr-2 text-indigo-500" />
                  <h4 className="text-xl font-semibold text-gray-900">Meta Information</h4>
                </div>
                <div className="flex flex-col gap-8">
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={blogForm.tags}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="health, wellness, nutrition"
                    />
                  </div>
                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                    <input
                      type="url"
                      id="imageUrl"
                      name="imageUrl"
                      value={blogForm.imageUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </section>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 bg-white sticky bottom-0 z-10">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 font-semibold flex items-center justify-center"
                >
                  Update Blog
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingBlog(null);
                    setBlogForm({
                      title: '',
                      content: '',
                      category: '',
                      summary: '',
                      tags: '',
                      imageUrl: ''
                    });
                    setView('my-blogs');
                  }}
                  className="flex-1 bg-white text-gray-700 py-3 px-6 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {view === 'my-blogs' && user?.role === 'doctor' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">My Published Blogs</h3>
            {blogs.filter(blog => blog.authorId === user.id).length === 0 ? (
              <div className="text-center py-12">
                <FaEdit className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs published yet</h3>
                <p className="text-gray-600">Start writing your first blog post</p>
                <button
                  onClick={() => setView('write')}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Write Your First Blog
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {blogs.filter(blog => blog.authorId === user.id).map((blog) => (
                  <div key={blog._id} className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mr-3">
                            {blog.category}
                          </span>
                          <span className="text-sm text-gray-500">{formatDate(blog.createdAt)}</span>
                        </div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">{blog.title}</h4>
                        <p className="text-gray-600 mb-4">{blog.summary || truncateText(blog.content)}</p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => {
                            setSelectedBlog(blog);
                            setShowModal(true);
                          }}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          title="View Blog"
                        >
                          <FaEye className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleEditBlog(blog)}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          title="Edit Blog"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => confirmDeleteBlog(blog)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          title="Delete Blog"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showModal && selectedBlog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedBlog.title}</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {selectedBlog.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">{selectedBlog.authorName}</p>
                    <p className="text-sm text-gray-500">{selectedBlog.authorSpecialization}</p>
                    <p className="text-sm text-gray-500">{formatDate(selectedBlog.createdAt)}</p>
                  </div>
                </div>

                {selectedBlog.imageUrl && (
                  <div className="mb-6">
                    <img
                      src={selectedBlog.imageUrl}
                      alt={selectedBlog.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {selectedBlog.content}
                  </div>
                </div>

                {selectedBlog.tags && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedBlog.tags.split(',').map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm && blogToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <FaTrash className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Blog</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete "<strong>{blogToDelete.title}</strong>"? 
                  This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setBlogToDelete(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteBlog(blogToDelete._id)}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog; 