import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaUserMd, FaFileMedical, FaShieldAlt, FaClock, FaMapMarkerAlt, FaPhone, FaEnvelope, FaArrowRight, FaCheckCircle, FaUsers, FaHeartbeat, FaLaptopMedical, FaStar } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import FeedBack from '../RatingFeedBack/feedBack';
import { BASE_URL } from '../../utils/Data';
import img from "../../assets/systemArchitecture.png"
import video from "../../assets/Action2.mp4";
import hero from "../../assets/HeroSection.mp4";
import { useUser } from '../shared/UserContext';
import { LuFolderPen } from "react-icons/lu";

function Landingpage() {
  const navigate = useNavigate();
   const[feedbacks, setFeedbacks] = useState([]);
   const user = useUser();
   const features = [
    {
      icon: <FaCalendarAlt className="text-4xl text-blue-600" />,
      title: "Easy Appointment Booking",
      description: "Book appointments with qualified doctors instantly. Choose from various specialties and convenient time slots."
    },
    {
      icon: <FaFileMedical className="text-4xl text-green-600" />,
      title: "Secure Medical Records",
      description: "Your medical history is safely stored and encrypted. Never lose your important health documents again."
    },
    {
      icon: <FaUserMd className="text-4xl text-purple-600" />,
      title: "Expert Doctors",
      description: "Connect with experienced healthcare professionals across multiple specialties and locations."
    },
    {
      icon: <FaShieldAlt className="text-4xl text-red-600" />,
      title: "Privacy & Security",
      description: "HIPAA compliant platform ensuring your health information remains confidential and secure."
    }
  ];

  const stats = [
    { number: "500+", label: "Qualified Doctors" },
    { number: "10K+", label: "Happy Patients" },
    { number: "50+", label: "Specialties" },
    { number: "24/7", label: "Support" }
  ];


  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await fetch(`${BASE_URL}/feedback/getAll`, {
          method: 'GET',      
          headers: {
            'Content-Type': 'application/json',
          },
        }); 
        const data = await response.json(); // <-- THIS gets you the actual response content  
         if (!response.ok) {
          throw new Error('Failed to fetch feedbacks');
        }
        setFeedbacks(data.message); // Assuming data.message contains the feedbacks array
       } catch (error) {
        console.error('Error fetching feedbacks:', error);
      }
    };
    fetchFeedbacks();
  }, []);
 
  const services = [
    {
      title: "Primary Care",
      description: "Comprehensive health checkups and preventive care",
      image: "https://blog.prevounce.com/hubfs/Featured%20APCM%20illustration.jpg"
    },
    {
      title: "Specialist Consultation",
      description: "Expert consultations across all medical specialties",
      image: "https://bairesdev.mo.cloudinary.net/blog/2022/03/tech-consultant.jpg?tx=w_1512,q_auto"
    },
    {
      title: "Emergency Care",
      description: "24/7 emergency medical services and support",
      image: "https://www.rmf.harvard.edu/-/media/Project/Rmf/CRICO/podcasts/2023/podcast-2023aug-edboarding-16x9.png?h=1125&iar=0&w=2000&hash=2461FA25E56617B81D0D4501196D94AA"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-100 to-green-100 py-10 pb-20 px-6 sm:px-12 lg:px-20">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-8">

    {/* Tagline */}
          <span className="text-blue-700 bg-gray-100  px-3 py-1 rounded-2xl uppercase tracking-wide font-semibold text-sm">
            Trusted by 10,000+ patients
          </span>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
            Your Health, <span className="text-green-600">Our Priority</span>
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
            Book appointments with top doctors, securely store your medical records, and take control of your healthcare journey. Your health information is safe with us - never lost, always accessible.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap  justify-center gap-4">
            <button
              className="bg-green-600 flex flex-row  items-center  gap-3 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-lg font-medium transition-all duration-300"
              onClick={
                () => {
                  if (user.user == null) {
                    navigate("/login");
                  } else if (user?.user?.role === "patent") {
                    navigate("/patient-dashboard");
                  }
                  else if (user?.user?.role === "doctor") {
                    navigate("/doctor-dashboard");
                  } else if (user?.user?.role === "admin") {
                    navigate("/admin-dashboard");
                  }
                }
               }

            >{
              user.user == null ? "Book an Appointment" : user?.user?.role === "patient" ? "Book an Appointment" : user?.user?.role =="doctor" ? "Manage Appointments" : "Admin Dashboard"
            }
              <LuFolderPen />
            </button>
            <button
              className="border flex items-center gap-x-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-6 py-3 rounded-xl text-lg font-medium transition-all duration-300"
              onClick={() => navigate('/doctors')}
            >
              Find a Doctor <FaUserMd />
            </button>
    </div>

    {/* Video Section with shadow & border overlay style */}
    <div className="relative w-full max-w-5xl mt-12">
      {/* Shadow layer (centered) */}
      <div className="absolute inset-0  bg-white/100 shadow-2xl scale-[1.01] translate-x-4 translate-y-2.5 z-0"></div>
   
    <div className=' absolute left-20 w-30 h-30  md:left-60 md:w-96 md:h-96 bg-green-800 blur-3xl '></div>
      {/* Main video with white border */}
      <div className="relative z-10   overflow-hidden">
        <video
          src={hero}
          className="w-full h-auto object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
    </div>

  </div>
     </section>


      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide comprehensive healthcare solutions that put you in control of your health journey
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="mb-6 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-4xl lg:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Healthcare Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive medical care across all specialties with secure record keeping
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

 
      {/* System Management Section */}
    <section className="py-20 bg-gradient-to-br from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-blue-900">How We Manage Our System</h2>
          <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
            Seamless integration, automated workflows, and doctor-patient connectivity — all in one ecosystem.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 place-content-center place-items-center items-start">
          {/* Left Image */}
          <img 
            src={img}
            alt="System Architecture"
            className="  lg:w-full rounded-3xl shadow-xl hover:scale-101 transition-transform duration-500 "
          />

          {/* Features List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              "Automated Appointment Scheduling",
              "Patient Record Integration with Cloud",
              "Real-time Doctor Notifications",
              "Admin Dashboard with Live Metrics",
              "Secure Digital Prescriptions",
              "Smart Billing and Invoice Generation",
              "Lab Report Upload & Instant Access",
              "SMS & Email Alerts for Appointments",
              "Role-Based Access for Staff & Doctors",
              "24/7 Patient Support Chatbot",
              "Medical Inventory Management",
              "Follow-up Reminders & Feedback System",
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition duration-300 border border-gray-200"
              >
                <div className="text-green-500 text-2xl mr-3">
                  <FaCheckCircle />
                </div>
                <p className="text-gray-800 select-none">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>


 


      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                About Our Healthcare Platform
              </h2>
              <div className="space-y-4 text-lg text-gray-600">
                <p>
                  We are dedicated to revolutionizing healthcare access by providing a seamless platform 
                  where patients can easily connect with qualified healthcare professionals.
                </p>
                <p>
                  Our secure medical records system ensures that your health information is never lost, 
                  always accessible, and completely private. We use state-of-the-art encryption and 
                  follow HIPAA compliance standards.
                </p>
                <p>
                  With our platform, you can book appointments, manage your medical history, and 
                  maintain a comprehensive health profile that grows with you throughout your healthcare journey.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <FaCheckCircle className="text-green-500 text-2xl" />
                <span className="text-lg font-semibold text-gray-900">HIPAA Compliant</span>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <FaCheckCircle className="text-green-500 text-2xl" />
                <span className="text-lg font-semibold text-gray-900">24/7 Support Available</span>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <FaLaptopMedical className="text-3xl text-blue-600 mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Digital Records</h3>
                    <p className="text-sm text-gray-600">Secure cloud storage for all medical documents</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <FaUsers className="text-3xl text-green-600 mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Expert Network</h3>
                    <p className="text-sm text-gray-600">Verified healthcare professionals</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <FaClock className="text-3xl text-purple-600 mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Quick Booking</h3>
                    <p className="text-sm text-gray-600">Instant appointment scheduling</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <FaShieldAlt className="text-3xl text-red-600 mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Data Security</h3>
                    <p className="text-sm text-gray-600">End-to-end encryption protection</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Medicine Store Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Online Medicine Store
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get your medicines delivered to your doorstep with our comprehensive online pharmacy. 
              Wide range of medicines, competitive prices, and fast delivery.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FaHeartbeat className="text-2xl text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Wide Range of Medicines</h3>
                  <p className="text-gray-600">From prescription drugs to over-the-counter medications, we have everything you need.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FaShieldAlt className="text-2xl text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentic Products</h3>
                  <p className="text-gray-600">All medicines are sourced from authorized distributors and verified for authenticity.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <FaClock className="text-2xl text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Delivery</h3>
                  <p className="text-gray-600">Get your medicines delivered within 24-48 hours with secure packaging.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <FaStar className="text-2xl text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer Reviews</h3>
                  <p className="text-gray-600">Read genuine reviews from verified customers before making your purchase.</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://img.freepik.com/free-photo/medicine-capsules-global-health-with-geometric-pattern-digital-remix_53876-126742.jpg" 
                alt="Online Medicine Store"
                className="rounded-2xl shadow-2xl  hover:scale-105 transition-all duration-400"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">5000+</div>
                  <div className="text-sm text-gray-600">Medicines Available</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <button 
              onClick={() => navigate('/medicine-store')}
              className="bg-green-600 text-white hover:bg-green-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
            >
              Browse Medicines
            </button>
          </div>
        </div>
      </section>

      {/* AI Report Analysis Section */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              AI-Powered Report Analysis
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get instant insights from your medical reports using advanced Gemini AI technology. 
              Upload your reports and receive detailed analysis in seconds.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src="https://img.freepik.com/free-photo/ai-technology-microchip-background-digital-transformation-concept_53876-124669.jpg" 
                alt="AI Report Analysis"
                className="rounded-2xl shadow-2xl hover:scale-105 transition-all duration-400"
              />
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">99.9%</div>
                  <div className="text-sm text-gray-600">Accuracy Rate</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <FaLaptopMedical className="text-2xl text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced AI Technology</h3>
                  <p className="text-gray-600">Powered by Google's Gemini AI for accurate and comprehensive report analysis.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FaFileMedical className="text-2xl text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Multiple Report Types</h3>
                  <p className="text-gray-600">Support for blood tests, X-rays, MRI scans, and other medical reports.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FaCheckCircle className="text-2xl text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Results</h3>
                  <p className="text-gray-600">Get detailed analysis and explanations within seconds of uploading your report.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <FaShieldAlt className="text-2xl text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
                  <p className="text-gray-600">Your medical reports are encrypted and processed securely with complete privacy.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <button 
              onClick={() => navigate('/AI-pdf-review')}
              className="bg-purple-600 text-white hover:bg-purple-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
            >
              Try AI Analysis
            </button>
          </div>
        </div>
      </section>

      {/* Experience Care section  */}
  <section className="py-20 bg-gradient-to-br from-white to-blue-50">
      <div className=" max-w-7xl gap-3 mx-auto px-4 sm:px-6 lg:px-8 w-full min-h-screen bg-white flex flex-col  lg:flex-row items-center justify-center  py-12">      
      {/* Left Section - Text */}
      <div className="w-11/12 md:w-1/2 flex flex-col gap-6 text-center md:text-left">
        <h2 className="text-4xl md:text-5xl font-bold text-blue-800 leading-tight">
           Experience Care Like Never Before
        </h2>
        <p className="text-lg text-gray-700 lg:max-w-md  ">
          “It saves me hours daily!” says Dr. Ahuja. Our platform is a revolution in patient-doctor interaction, saving time, building trust.
        </p>

        <div className="  lg:hidden w-full lg:w-1/2 mt-10 md:mt-0 flex justify-center">
        <div className="relative w-[480px] h-[580px] shadow-xl rounded-xl overflow-hidden">
          <video
            src={video}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
     
        </div>
      </div>
         <ul className=" hidden lg:flex flex-col text-gray-600 space-y-2 text-base ">
          <li>✅ Book Appointments Instantly</li>
          <li>✅ Get Prescriptions Without the Wait</li>
          <li>✅ Real-Time Admin Insights</li>
        </ul>
        <button
            onClick={() => {
            if (user.user == null) {
              navigate("/login");
            } else if (user?.user?.role === "patent") {
              navigate("/patient-dashboard");
            }
            else if (user?.user?.role === "doctor") {
              navigate("/doctor-dashboard");
            } else if (user?.user?.role === "admin") {
              navigate("/admin-dashboard");
            }
          }
        }
        
         className="mt-4 px-6 py-3  bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Explore Medicare
        </button>
      </div>

      {/* Right Section - Video */}
      <div className="  w-full lg:w-1/2 mt-10 md:mt-0  hidden lg:flex justify-center">
        <div className="relative w-[480px] h-[580px] shadow-xl rounded-xl overflow-hidden">
          <video
            src={video}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
     
        </div>
      </div>
</div>
    </section>



      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of patients who trust us with their healthcare needs. 
            Start your journey to better health today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/signup')}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
            >
              Create Account
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FeedBack  feedbacks={feedbacks}  />
        </div>        
</section>

    </div>
  );
}

export default Landingpage;