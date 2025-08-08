import { useState } from 'react'
import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import Navbar from './component/shared/Navbar.jsx';
import Footer from './component/shared/Footer.jsx';
import Landingpage from './component/pages/Landingpage.jsx';
import Pagenotfound from './component/pages/Pagenotfound.jsx';
import Home from './component/pages/Home.jsx';
import Contact from './component/contact/Contact.jsx'
import Login from './component/pages/Login.jsx';
import Signup from './component/pages/Signup.jsx';
import DoctorDashboard from './component/dashboard/DoctorDashboard.jsx';
import PatientDashboard from './component/dashboard/PatientDashboard.jsx';
import DoctorsList from './component/doctors/DoctorsList.jsx';
import Profile from './component/profile/Profile.jsx';
import EditProfile from './component/profile/EditProfile.jsx';
import Blog from './component/blog/Blog.jsx';
import ProtectedRoute from './component/shared/ProtectedRoute.jsx';
import RoleBasedRedirect from './component/shared/RoleBasedRedirect.jsx';
import PatientReports from './component/reports/PatientReports.jsx';
import AdminDashboard from './component/dashboard/AdminDashboard.jsx';
import AboutUs from './component/AboutUs/About.jsx';
import { useUser } from './component/shared/UserContext.jsx';
import ReportReview from './component/pages/AIPdfReview.jsx';
// main.jsx or App.jsx
import "./pdfWorker";
import DoctorProfile from './component/doctors/DoctorProfilePage.jsx';
import MedicalAIAssistant from './component/MedicalImageAnalyzerAI/MedicalAIAssistant.jsx';
import MedicineStore from './component/pharmacy/MedicineStore.jsx';
import SellerDashboard from './component/dashboard/SellerDashboard.jsx';
import AddMedicine from './component/pharmacy/AddMedicine.jsx';
import EditMedicine from './component/pharmacy/EditMedicine.jsx';
import Checkout from './component/pharmacy/Checkout.jsx';
import MyOrders from './component/pharmacy/MyOrders.jsx';
import ProductDetail from './component/pharmacy/ProductDetail.jsx';
import BuyNow from './component/pharmacy/BuyNow.jsx';
import { Toaster } from 'react-hot-toast';
import OrderTrackingDetails from './component/pharmacy/OrderTrackingDetails .jsx';

function App() {
  const [count, setCount] = useState(0)
  const user = useUser();
   return (
    <>
    <Toaster
  position="top-center"
  reverseOrder={false}
/>
      <Navbar />
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow">
          <Routes>
            
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/AI-pdf-review" element={<ReportReview />} />
             {/* <Route path="/view-profile-doctor" element={<DoctorProfile />} /> */}

            {/* E-Pharmacy Routes */}
            <Route path="/medicine-store" element={<MedicineStore />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/buy-now" element={<ProtectedRoute><BuyNow /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
            <Route path="/orders/:orderId" element={<OrderTrackingDetails />} />


            <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
            <Route path="/doctors" element={<ProtectedRoute><DoctorsList /></ProtectedRoute>} />
            <Route path="/blog" element={<ProtectedRoute><Blog /></ProtectedRoute>} />
            <Route path="/doctor-dashboard" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/patient-dashboard" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
            <Route path="/seller-dashboard" element={<ProtectedRoute allowedRoles={['seller']}><SellerDashboard /></ProtectedRoute>} />
            <Route path="/add-medicine" element={<ProtectedRoute allowedRoles={['seller']}><AddMedicine /></ProtectedRoute>} />
            <Route path="/edit-medicine/:id" element={<ProtectedRoute allowedRoles={['seller']}><EditMedicine /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={['doctor', 'patient', 'admin', 'seller']}><Profile /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute allowedRoles={['doctor', 'patient', 'admin', 'seller']}><EditProfile /></ProtectedRoute>} />
            <Route path="/records" element={<ProtectedRoute allowedRoles={['doctor', 'patient']}><PatientReports /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><RoleBasedRedirect /></ProtectedRoute>} />
            
            <Route path="*" element={<Pagenotfound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    
    </>
  )
}

export default App
