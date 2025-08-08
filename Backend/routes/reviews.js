import express from 'express';
import Review from '../models/Review.js';
import Medicine from '../models/Medicine.js';
import User from '../models/User.js';
import auth  from '../middlewares/auth.js';
import  roles  from '../middlewares/roles.js';

const router = express.Router();

// Get reviews for a medicine (limit to 5)
router.get('/medicine/:medicineId', async (req, res) => {
    try {
        const { medicineId } = req.params;
        const reviews = await Review.find({ medicineId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'username avatar');
        
        res.json({ reviews });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
});

// Add a review
router.post('/medicine/:medicineId', auth, roles(['patient']), async (req, res) => {
    try {
        const { medicineId } = req.params;
        const { rating, review } = req.body;
        const userId = req.user.userId;

        // Check if user already reviewed this medicine
        const existingReview = await Review.findOne({ medicineId, userId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this medicine' });
        }

        // Get user info
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create new review
        const newReview = new Review({
            medicineId,
            userId,
            rating,
            review,
            userName: user.username || user.name,
            userAvatar: user.avatar,
            isVerified: true
        });

        await newReview.save();

        // Update medicine average rating
        const allReviews = await Review.find({ medicineId });
        const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
        const averageRating = totalRating / allReviews.length;

        await Medicine.findByIdAndUpdate(medicineId, {
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews: allReviews.length
        });

        res.status(201).json({ 
            message: 'Review added successfully',
            review: newReview
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding review', error: error.message });
    }
});

// Update a review
router.put('/:reviewId', auth, roles(['patient']), async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, review } = req.body;
        const userId = req.user.userId;

        const existingReview = await Review.findOne({ _id: reviewId, userId });
        if (!existingReview) {
            return res.status(404).json({ message: 'Review not found or unauthorized' });
        }

        existingReview.rating = rating;
        existingReview.review = review;
        await existingReview.save();

        // Update medicine average rating
        const allReviews = await Review.find({ medicineId: existingReview.medicineId });
        const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
        const averageRating = totalRating / allReviews.length;

        await Medicine.findByIdAndUpdate(existingReview.medicineId, {
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews: allReviews.length
        });

        res.json({ 
            message: 'Review updated successfully',
            review: existingReview
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating review', error: error.message });
    }
});

// Delete a review
router.delete('/:reviewId', auth, roles(['patient']), async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.userId;

        const existingReview = await Review.findOne({ _id: reviewId, userId });
        if (!existingReview) {
            return res.status(404).json({ message: 'Review not found or unauthorized' });
        }

        await Review.findByIdAndDelete(reviewId);

        // Update medicine average rating
        const allReviews = await Review.find({ medicineId: existingReview.medicineId });
        const averageRating = allReviews.length > 0 
            ? allReviews.reduce((sum, rev) => sum + rev.rating, 0) / allReviews.length 
            : 0;

        await Medicine.findByIdAndUpdate(existingReview.medicineId, {
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews: allReviews.length
        });

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review', error: error.message });
    }
});

export default router;
