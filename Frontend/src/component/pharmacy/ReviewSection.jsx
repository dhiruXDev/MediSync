import React, { useState, useEffect, useRef } from 'react';
import { FaStar, FaUser, FaEdit, FaTrash } from 'react-icons/fa';
import { useUser } from '../shared/UserContext';
import { BASE_URL } from '../../utils/Data';
import toast from 'react-hot-toast';

const ReviewSection = ({ medicineId, averageRating, totalReviews, triggerReview }) => {
  const  user  = useUser();
  const token = localStorage.getItem('token');

  const [showReviewForm, setShowReviewForm] = useState(triggerReview || false); // 💡 pre-open if triggered
  const [rating, setRating] = useState(2);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [reviews, setReviews] = useState([]);


  useEffect(() => {
    fetchReviews();
  }, [medicineId]);

  // 🆕 Trigger from parent effect
  useEffect(() => {
    if (triggerReview) 
      setShowReviewForm(true);
  }, [triggerReview]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${BASE_URL}/reviews/medicine/${medicineId}`);
      const data = await response.json();
      setReviews(data.reviews || []);
      
      // Check if user has already reviewed
      if (user?.user) {
        const userRev = data.reviews.find(r => r.userId === user.user._id);
        setUserReview(userRev);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const formRef = useRef();

useEffect(() => {
  if (showReviewForm && formRef.current) {
    formRef.current.scrollIntoView({ behavior: 'smooth' });
  }
}, [showReviewForm]);


  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token || !user?.user) {
      toast.error('Please login to add a review');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/reviews/medicine/${medicineId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, review })
      });

      if (response.ok) {
        setRating(5);
        setReview('');
        setShowReviewForm(false);
        fetchReviews();
        toast.success('Review added successfully!');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to add review');
      }
    } catch (error) {
      console.error('Error adding review:', error);
      toast.error('Error adding review');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!userReview) return;

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/reviews/${userReview._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, review })
      });

      if (response.ok) {
        setShowReviewForm(false);
        fetchReviews();
        toast.success('Review updated successfully!');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update review');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Error updating review');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;
    
    if (!window.confirm('Are you sure you want to delete your review?')) return;

    try {
      const response = await fetch(`${BASE_URL}/reviews/${userReview._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setUserReview(null);
        fetchReviews();
        toast.success('Review deleted successfully!');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Error deleting review');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={`text-lg ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Customer Reviews</h3>
          <div className="flex items-center mt-2">
            <div className="flex items-center mr-4">
              {renderStars(Math.round(averageRating))}
              <span className="ml-2 text-sm text-gray-600">
                {averageRating?.toFixed(1)} ({totalReviews} reviews)
              </span>
            </div>
          </div>
        </div>
        
        {user?.user && !userReview && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
         <div  className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-lg shadow-lg">
                        {/* Left Panel – Tips */}
                        <div className="md:col-span-1 space-y-6 border-r pr-4">
                          <h2 className="text-xl font-semibold text-gray-800">What makes a good review</h2>

                          <div>
                            <h4 className="font-medium text-gray-700 mb-1">Have you used this product?</h4>
                            <p className="text-sm text-gray-500">Your review should be about your experience with the product.</p>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-700 mb-1">Why review a product?</h4>
                            <p className="text-sm text-gray-500">Your valuable feedback will help fellow shoppers decide!</p>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-700 mb-1">How to review a product?</h4>
                            <p className="text-sm text-gray-500">
                              Your review should include facts. An honest opinion is always appreciated. If you have an issue with the product or service, contact our support.
                            </p>
                          </div>
                        </div>

                        {/* Right Panel – Review Form */}
                        <div className="md:col-span-2 space-y-6">
                          {/* Rating */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rate this product</label>
                                <div className="flex items-center space-x-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setRating(star)}
                                      onMouseEnter={() => setHoveredStar(star)}
                                      onMouseLeave={() => setHoveredStar(0)}
                                      className="focus:outline-none"
                                    >
                                      <FaStar
                                        className={`text-2xl transition-colors cursor-pointer ${
                                          (hoveredStar || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                      />
                                    </button>
                                  ))}
                                  <span
                                    className={`text-sm ${
                                      (hoveredStar || rating) >= 3 ? 'text-green-600' : 'text-orange-400'
                                    } ml-2 font-medium`}
                                  >
                                    {(() => {
                                      const val = hoveredStar || rating;
                                      if (val === 5) return 'Excellent';
                                      if (val === 4) return 'Very Good';
                                      if (val === 3) return 'Good';
                                      if (val === 2) return 'Poor';
                                      if (val === 1) return 'Very Bad';
                                      return '';
                                    })()}
                                  </span>
                                </div>
                          </div>

                            {/* Review Textarea */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Review this product</label>
                              <textarea
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Tell us why you liked or disliked this product"
                              ></textarea>
                              {review.length === 0 && (
                                <p className="text-xs text-red-500 mt-1">Description cannot be empty</p>
                              )}
                            </div>

                            {/* Submit Button */}
                            <div className="text-right">
                              <button
                                onClick={handleSubmitReview}
                                disabled={review.trim().length === 0}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg transition-all disabled:opacity-50"
                              >
                                SUBMIT
                              </button>
                            </div>
                          </div>
         </div>

        )}


      {/* User's Review */}
      {userReview && !showReviewForm && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <FaUser className="text-gray-500 mr-2" />
              <span className="font-medium">Your Review</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setRating(userReview.rating);
                  setReview(userReview.review);
                  setShowReviewForm(true);
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                <FaEdit />
              </button>
              <button
                onClick={handleDeleteReview}
                className="text-red-600 hover:text-red-800"
              >
                <FaTrash />
              </button>
            </div>
          </div>
          <div className="flex items-center mb-2">
            {renderStars(userReview.rating)}
          </div>
          <p className="text-gray-700">{userReview.review}</p>
        </div>
      )}

      {/* Other Reviews */}
      <div className="space-y-4">
        {reviews
          .filter(r => !userReview || r._id !== userReview._id)
          .map((review) => (
            <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <img
                    src={review.userAvatar || 'https://via.placeholder.com/32'}
                    alt="User"
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{review.userName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {review.isVerified && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Verified Purchase
                  </span>
                )}
              </div>
              <div className="flex items-center mb-2">
                {renderStars(review.rating)}
              </div>
              <p className="text-gray-700">{review.review}</p>
            </div>
          ))}
      </div>

      {reviews.length === 0 && !userReview && (
        <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review this product!</p>
      )}
    </div>
  );
};

export default ReviewSection;
