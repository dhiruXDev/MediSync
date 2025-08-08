

import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import doctorAvatar from '../../assets/RatingImg.png'; // fallback avatar
import { FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const FeedBack = ({feedbacks}) => {

  return (
    <div className=" py-10 px-4 text-center min-h-[820px] ">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Patients Say</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Hear from our satisfied patients who have experienced the convenience and care of our platform.
        </p>

         <div className="flex justify-center text-yellow-500 text-2xl mb-4 mt-8">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} />
           ))}
       </div>
      </div>
      {feedbacks.length === 0 ? (
        <p className="text-gray-500 text-center">No feedback available yet.</p>
      ) : (
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
           
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          loop
          className="max-w-4xl mx-auto"
        >
          {feedbacks.map((fb, index) => (
            <SwiperSlide key={index}>
              <div className="flex flex-col items-center bg-white shadow-md p-8 rounded-xl">
                <div className="w-32 h-32 mb-4 rounded-full bg-gray-100 p-2">
                  <img
                    src={doctorAvatar}
                    alt="doctor"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                {/* <div className="flex text-yellow-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div> */}

                <p className="text-gray-700 text-lg italic mb-4">“{fb.reason}”</p>
                <p className="text-gray-900 font-semibold">{fb.doctorId?.username}</p>
                <p className="text-gray-600 text-sm">
                  {fb.doctorId?.specialization}
                </p>
                <p className="text-blue-500 text-sm mt-1">Feedback by: {fb.patientId?.username}</p>
                {fb.message && <p className="text-gray-600 mt-2 text-sm">Message: {fb.message}</p>}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default FeedBack;

 
 

