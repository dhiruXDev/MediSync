import React, { useState, useEffect, useRef } from 'react';
import { FaStar } from 'react-icons/fa';
import { useUser } from '../shared/UserContext';
import { BASE_URL } from '../../utils/Data';
import toast from 'react-hot-toast';

const RatingForm = ({ medicineId }) => {
  const  user  = useUser();
  const token = localStorage.getItem('token');

  const [showReviewForm, setShowReviewForm] = useState(true);
  const [rating, setRating] = useState(2);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [reviews, setReviews] = useState([]);

  const formRef = useRef();

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
        toast.success('Review added successfully!');
        fetchReviews(); // refresh
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
        toast.success('Review updated successfully!');
        setShowReviewForm(false);        
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

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${BASE_URL}/reviews/medicine/${medicineId}`);
      const data = await response.json();
      setReviews(data.reviews || []);
       if (user?.user) {
        const userRev = data.reviews.find(r => r.userId._id === user.user.id);
        setUserReview(userRev);
 
        if (userRev) {
          setRating(userRev.rating);
          setReview(userRev.review);
          setShowReviewForm(true); // open form with existing data
        }
        console.log("first")
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [medicineId, user?.user]);

  useEffect(() => {
    if (showReviewForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showReviewForm]);

  return (
    <div className="mt-6" ref={formRef}>
      <div className="flex items-center justify-between mb-4">
        {!showReviewForm && user?.user && !userReview && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      {showReviewForm && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-lg shadow-lg">
          {/* Left Tips Panel */}
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
                Your review should include facts. If you have an issue with the product, contact our support.
              </p>
            </div>
          </div>

          {/* Right Review Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Star Rating */}
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
                  {{
                    5: 'Excellent',
                    4: 'Very Good',
                    3: 'Good',
                    2: 'Poor',
                    1: 'Very Bad'
                  }[hoveredStar || rating] || ''}
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
              />
              {review.length === 0 && (
                <p className="text-xs text-red-500 mt-1">Description cannot be empty</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="text-right">
              <button
                onClick={userReview ? handleUpdateReview : handleSubmitReview}
                disabled={review.trim().length === 0 || loading}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Submitting...' : userReview ? 'UPDATE REVIEW' : 'SUBMIT REVIEW'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingForm;
