const mongoose = require('mongoose');
const User = require('../models/User'); 
const { faker } = require('@faker-js/faker');
import dotenv from 'dotenv'

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

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


const indianFirstNames = [
  'Aarav', 'Bhavya', 'Chirag', 'Divya', 'Esha', 'Farhan', 'Gautam', 'Hema', 
  'Ishaan', 'Jyoti', 'Karan', 'Lavanya', 'Manish', 'Neha', 'Omkar', 'Priya',
  'Rahul', 'Shreya', 'Tanmay', 'Urvashi', 'Vikram', 'Yash', 'Zoya'
];

const indianLastNames = [
  'Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Verma', 'Malhotra', 'Reddy',
  'Joshi', 'Choudhary', 'Mehta', 'Iyer', 'Nair', 'Khanna', 'Bose', 'Banerjee'
];


function generateDoctor() {
  const firstName = faker.helpers.arrayElement(indianFirstNames);
  const lastName = faker.helpers.arrayElement(indianLastNames);
  
  return {
    avatar: faker.image.avatar(),
    username: `Dr. ${firstName} ${lastName}`,
    email: faker.internet.email(firstName, lastName).toLowerCase(),
    password: faker.internet.password(),
    role: 'doctor',
    isVerified: faker.datatype.boolean(),
    isActive: true,
    specialization: faker.helpers.arrayElement(doctorSpecializations),
    experience: faker.number.int({ min: 1, max: 30 }),
    age: faker.number.int({ min: 28, max: 65 })
  };
}


function generatePatient() {
  const firstName = faker.helpers.arrayElement(indianFirstNames);
  const lastName = faker.helpers.arrayElement(indianLastNames);
  
  return {
    avatar: faker.image.avatar(),
    username: `${firstName}_${lastName}${faker.number.int(99)}`,
    email: faker.internet.email(firstName, lastName).toLowerCase(),
    password: faker.internet.password(),
    role: 'patient',
    isVerified: faker.datatype.boolean(),
    isActive: true
  };
}


async function seedDatabase() {
  try {
    
    await User.deleteMany({});
    
    
    const doctors = Array.from({ length: 20 }, generateDoctor);
   
    const patients = Array.from({ length: 50 }, generatePatient);
    
   
    await User.insertMany([...doctors, ...patients]);
    
    console.log('Database seeded successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
  }
}

seedDatabase();