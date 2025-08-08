import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import appointmentRoutes from './routes/appointments.js';
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blogs.js';
import reportRoutes from './routes/reports.js';
import feedbackRoutes from './routes/feedback.js';
import medicineRoutes from './routes/medicines.js';
import orderRoutes from './routes/orders.js';
import reviewRoutes from './routes/reviews.js';
import GlobalStats from './models/GlobalStats.js';

dotenv.config(); 

const app = express();
const port = process.env.PORT || 8080;


app.use(cors({
  origin: 'https://medi-sync-vhla.vercel.app', 
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({extended : true}));

// Serve static files for medicine images
app.use('/uploads', express.static('uploads'));

app.use('/auth', authRoutes);

app.get("/about",(req,res)=>{
    res.send("api working");
})

app.get('/global-stats', async (req, res) => {
  try {
    let stats = await GlobalStats.findOne();
    if (!stats) {
      stats = await GlobalStats.create({});
    }
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch global stats', err });
  }
});
 

app.use('/appointments', appointmentRoutes);
app.use('/blogs', blogRoutes);
app.use('/reports', reportRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/medicines', medicineRoutes);
app.use('/orders', orderRoutes);
app.use('/reviews', reviewRoutes);


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
    app.listen(port,()=>{
        console.log(`App is listening to port ${port}`);
    });
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});
