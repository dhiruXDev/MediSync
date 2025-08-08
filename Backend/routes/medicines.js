import express from 'express';
import Medicine from '../models/Medicine.js';
import auth from '../middlewares/auth.js';
import roles from '../middlewares/roles.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();
    
// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/medicines/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
}); 

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Get all medicines (public)
router.get('/', async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, sortBy = 'name', sortOrder = 'asc' } = req.query;
        
        let query = { isActive: true };
        
        // Search functionality
        if (search) {
            query.$text = { $search: search };
        }
        
        // Category filter
        if (category) {
            query.category = category;
        }
        
        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }
        
        // Sorting
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        const medicines = await Medicine.find(query)
            .populate('sellerId', 'username')
            .sort(sortOptions)
            .limit(50);
            
        res.json({ medicines });
    } catch (error) {
        console.error('Error fetching medicines:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get medicine by ID (public)
router.get('/:id', async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id)
            .populate('sellerId', 'username');
            
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }
        
        res.json({ medicine });
    } catch (error) {
        console.error('Error fetching medicine:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add new medicine (seller only)
router.post('/', auth, roles(['seller']), upload.single('image'), async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            stock,
            category,
            manufacturer,
            dosageForm,
            strength,
            requiresPrescription
        } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: 'Medicine image is required' });
        }
        
        const medicine = new Medicine({
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            image: req.file.path,
            sellerId: req.user.userId,
            category,
            manufacturer,
            dosageForm,
            strength,
            requiresPrescription: requiresPrescription === 'true'
        });
        
        await medicine.save();
        
        res.status(201).json({ 
            message: 'Medicine added successfully',
            medicine 
        });
    } catch (error) {
        console.error('Error adding medicine:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update medicine (seller only - own medicines)
router.put('/:id', auth, roles(['seller']), upload.single('image'), async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }
        
        if (medicine.sellerId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to update this medicine' });
        }
        
        const updateData = { ...req.body };
        
        if (req.file) {
            updateData.image = req.file.path;
        }
        
        if (updateData.price) {
            updateData.price = parseFloat(updateData.price);
        }
        
        if (updateData.stock) {
            updateData.stock = parseInt(updateData.stock);
        }
        
        if (updateData.requiresPrescription) {
            updateData.requiresPrescription = updateData.requiresPrescription === 'true';
        }
        
        const updatedMedicine = await Medicine.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('sellerId', 'username');
        
        res.json({ 
            message: 'Medicine updated successfully',
            medicine: updatedMedicine 
        });
    } catch (error) {
        console.error('Error updating medicine:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete medicine (seller only - own medicines)
router.delete('/:id', auth, roles(['seller']), async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }
        
        if (medicine.sellerId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this medicine' });
        }
        
        await Medicine.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Medicine deleted successfully' });
    } catch (error) {
        console.error('Error deleting medicine:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get seller's medicines (seller only)
router.get('/seller/my-medicines', auth, roles(['seller']), async (req, res) => {
    try {
        const medicines = await Medicine.find({ sellerId: req.user.userId })
            .sort({ createdAt: -1 });
            
        res.json({ medicines });
    } catch (error) {
        console.error('Error fetching seller medicines:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get medicine categories
router.get('/categories/list', async (req, res) => {
    try {
        const categories = [
            'Pain Relief',
            'Antibiotics',
            'Vitamins & Supplements',
            'Diabetes',
            'Heart & Blood Pressure',
            'Respiratory',
            'Digestive Health',
            'Skin Care',
            'Eye Care',
            'Dental Care',
            'Women Health',
            'Men Health',
            'Children Health',
            'Other'
        ];
        
        res.json({ categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router; 