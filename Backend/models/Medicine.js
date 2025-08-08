import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    image: {
        type: String,
        required: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requiresPrescription: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        required: true,
        enum: [
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
        ]
    },
    manufacturer: {
        type: String,
        required: true
    },
    dosageForm: {
        type: String,
        required: true,
        enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Other']
    },
    strength: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Index for search functionality
medicineSchema.index({ name: 'text', description: 'text', category: 'text' });

const Medicine = mongoose.model("Medicine", medicineSchema);

export default Medicine; 