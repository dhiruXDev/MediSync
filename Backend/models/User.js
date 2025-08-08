import mongoose from "mongoose";

const doctorSpecializations = [
    'General Consultation',
    'General Physician',
    'Neurologist',
    'Endocrinologist',
    'Cardiologist',
    'Dermatologist',
    'Psychiatrist / Psychologist',
    'Pediatrician',
    "Gynecologist / Obstetrician",
    'Orthopedic Surgeon / Specialist',
    'Ophthalmologist',
    'Dentist / Dental Surgeon',
    'Other'
  ];

const userSchema = new mongoose.Schema({
    avatar : {
        type : String,
        required : true,
    },
    username : {
        type : String,
        required : true,
        unique : true,
    },
    email : {
        type : String,
        required : true,
        unique : true,
        match : [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
    },
    password:{
        type:String,
        required : true,
    },
    phone: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                
                return /^\+91\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid Indian phone number. Please use +91 followed by 10 digits.`
        },
    },
    createdAt : {
        type : Date,
        default : Date.now,
    },
    updatedAt : {
        type : Date,
    },
    role : {
        type: String,
        enum : ["doctor","patient","admin","seller"],
        default : "patient",
    },
    isVerified : {
        type : Boolean,
        default : false,
    },
    isActive : {
        type : Boolean,
        default : true,
    },
    specialization: {
        type: String,
        enum: doctorSpecializations,
        required: function() { return this.role === 'doctor'; }
    },
    experience: {
        type: Number,
        required: function() { return this.role === 'doctor'; }
    },
    age: {
        type: Number,
        required: function() { return this.role === 'doctor'; }
    },

    totalFeedbacks: {
        type: Number,
        default: 0
    },
    goodFeedbacks: {
        type: Number,
        default: 0
    },
    badFeedbacks: {
        type: Number,
        default: 0
    },
    
    
    weeklyAttendance: [
      {
        date: { type: Date, required: true },
        present: { type: Boolean, default: false }
      }
    ],
    
    availability: [
      {
        day: { type: String },
        slots: [String] 
      }
    ]
}, { timestamps: true });

const User = mongoose.model("User",userSchema);

export default User;