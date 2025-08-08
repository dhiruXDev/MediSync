// import React from 'react';
// import img from '../../assets/AboutUsImage.webp'
// const AboutUs = () => {
//   return (
//     <div className="min-h-screen bg-gray-50 text-gray-800">
//       {/* Hero Section */}
//       <div className="relative w-full h-72 md:h-96">
//         <img
//           src="https://images.unsplash.com/photo-1588776814546-ecb9b5b4bc60?auto=format&fit=crop&w=1500&q=80"
//           alt="Healthcare Team"
//           className="w-full h-full object-cover brightness-75"
//         />
//         <div className="absolute inset-0 flex items-center justify-center">
//           {/* <h1 className="text-black text-3xl md:text-5xl font-bold drop-shadow-lg">
//             About Us
//           </h1> */}
//         </div>
//       </div>

//       {/* Content Section */}
//       <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
//         <div className="grid md:grid-cols-2 gap-10 items-center">
//           {/* Text */}
//           <div>
//             <h2 className="text-2xl md:text-3xl font-bold text-blue-700 mb-4">We Care, We Heal, We Serve</h2>
//             <p className="text-gray-700 text-lg leading-relaxed">
//               At <span className="font-semibold">Medi-Sync</span>, we believe healthcare is not just about treating illnesses — it's about building lasting relationships. Our mission is to bridge the gap between patients and trusted healthcare professionals.
//               <br /><br />
//               With a team of experienced doctors, cutting-edge technology, and compassionate care, we strive to deliver a platform that makes health services accessible, secure, and personal. From remote consultations to appointment bookings, we’ve got you covered — literally.
//             </p>
//           </div>

//           {/* Image */}
//           <div>
//             <img
//                 src={img}             
//                 alt="Doctors discussing"
//               className="rounded-xl shadow-lg w-full hover:scale-102 duration-300"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AboutUs;

import React from 'react';
import img from '../../assets/AboutUsImage.webp'
const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans mt-14">
      {/* Hero Section */}
      <div className="relative w-full h-[24rem] md:h-[32rem] overflow-hidden">
        <img
          src="https://www.praktischarzt.de/wp-content/uploads/2023/03/Becoming-a-medical-doctor-or-physician-in-Germany.jpg"
          alt="Healthcare professionals"
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <h1 className="text-white text-4xl md:text-6xl font-bold drop-shadow-xl text-center px-4">
            Compassion-Driven Digital Healthcare
          </h1>
        </div>
      </div>

      {/* Mission + Vision */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-blue-700 mb-4">Our Mission</h2>
        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
          At <span className="font-semibold">MediSync</span>, we aim to empower lives by making healthcare more accessible, efficient, and humane. We blend technology with empathy to create a seamless platform that connects patients to trusted medical services with just a few clicks.
        </p>

        <h2 className="text-3xl font-bold text-blue-700 mt-12 mb-4">Our Vision</h2>
        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
          We envision a world where healthcare isn't a privilege but a right. A world where every patient is heard, cared for, and guided — no matter where they are.
        </p>
      </section>

      {/* Core Info Section */}
      <section className="max-w-6xl mx-auto px-4 pb-16 mt-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Text */}
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-blue-700 mb-4">
            We Care, We Heal, We Serve
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              <span className="font-semibold">MediSync</span> is a tech-enabled healthcare ecosystem designed to simplify every step of your wellness journey — from online consultations to secure health record management and real-time appointment booking.
              <br /><br />
              With AI-driven tools, a verified network of doctors, and 24/7 support, we are here to revolutionize the way India experiences healthcare — one patient at a time.
            </p>
          </div>

          {/* Image */}
          <div>
            <img
              src={img}
              alt="Doctors working together"
              className="rounded-xl shadow-xl w-full hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
