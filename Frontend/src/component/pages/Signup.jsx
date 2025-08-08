

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import '../../App.css';
// import { BASE_URL, CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_URL } from '../../utils/Data';
// const DEFAULT_AVATAR = "https://www.w3schools.com/howto/img_avatar.png"; // Replace with your own if needed

// const doctorSpecializations = [
//   'General Physician',
//   'Neurologist',
//   'Endocrinologist',
//   'Cardiologist',
//   'Dermatologist',
//   'Psychiatrist / Psychologist',
//   'Pediatrician',
//   "Gynecologist / Obstetrician",
//   'Orthopedic Surgeon / Specialist',
//   'Ophthalmologist',
//   'Dentist / Dental Surgeon',
//   'Other'
// ];


// //console.log("first", CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_CLOUD_NAME);
// const Signup = () => {
//   const [form, setForm] = useState({ 
//     username: '', 
//     email: '', 
//     password: '', 
//     role: 'patient', 
//     avatar: '', 
//     specialization: '', 
//     experience: '', 
//     age: '',
//     phone: '',
//     secret: ''
//   });

//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setLoading(true);
//     setError('');
//     try {
//       const formData = new FormData();
//       formData.append('file', file);
//       formData.append('upload_preset',CLOUDINARY_UPLOAD_PRESET);
       
//       const res = await fetch(CLOUDINARY_URL, {
//         method: 'POST',
//         body: formData
//       });

//       const data = await res.json();
//       if (data.secure_url) {
//         setForm({ ...form, avatar: data.secure_url });
//         setSuccess("Image uploaded successfully!");
//       } else {
//         setError("Failed to upload image.");
//       }
//     } catch (err) {
//       console.error(err);
//       setError("Error uploading image.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');
//     setLoading(true);
//     try {
//       let res, data;
//       if (form.role === 'admin') {
//         res = await fetch(`${BASE_URL}/auth/register-admin`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             username: form.username,
//             email: form.email,
//             password: form.password,
//             avatar: form.avatar,
//             phone: form.phone,
//             secret: form.secret
//           })
//         });
//         data = await res.json();
//        } else {
//         res = await fetch(`${BASE_URL}/auth/register`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(form)
//         });
//         data = await res.json();
//       }

//       if (res.ok) {
//         setSuccess('Registration successful! Redirecting to login...');
//         setTimeout(() => navigate('/login'), 2000);
//       } else {
//         setError(data.message || 'Registration failed. Please try again.');
//       }
//     } catch (err) {
//       console.log("err",err)
//       setError('Network error. Please check your connection and try again.' ,err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center mt-10 justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 py-6 sm:py-8 px-2">
//       <div className="w-full  sm:max-w-md mx-auto">
//         <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
//           <div className="text-center mb-6 sm:mb-8">
//             <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
//             <p className="text-gray-600 text-base sm:text-lg">Join our healthcare platform</p>
//           </div>
//           <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

//             {/* Image Upload */}
//             {/* Avatar Preview + Upload */}
//             <div className="flex flex-col items-center">
//               <div className="w-24 h-24 rounded-full border-2 border-gray-300 overflow-hidden mb-2">
//                 <img
//                   src={form.avatar || DEFAULT_AVATAR}
//                   alt="Profile Avatar"
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//               <input
//                 id="avatarUpload"
//                 type="file"
//                 accept="image/*"
//                 onChange={handleImageUpload}
//                 className="text-sm text-gray-600 relative left-14 cursor-pointer"
//               />
//             </div>

//             {/* Username */}
//             <div>
//               <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
//                 Username
//               </label>
//               <input
//                 id="username"
//                 type="text"
//                 name="username"
//                 placeholder="Enter your username"
//                 value={form.username}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
//               />
//             </div>

//             {/* Email */}
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 name="email"
//                 placeholder="Enter your email"
//                 value={form.email}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
//               />
//             </div>

//             {/* Password */}
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 type="password"
//                 name="password"
//                 placeholder="Create a password"
//                 value={form.password}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
//               />
//             </div>

//             {/* Role Selection */}
//             <div>
//               <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
//                 I am a
//               </label>
//               <select 
//                 name="role" 
//                 value={form.role} 
//                 onChange={handleChange} 
//                 required
//                 className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
//               >
//                 <option value="patient">Patient</option>
//                 <option value="doctor">Doctor</option>
//                 <option value="seller">Medicine Seller</option>
//                 <option value="admin">Admin</option>
//               </select>
//             </div>

//             {/* Conditional Inputs */}
//             {form.role === 'admin' && (
//               <div>
//                 <label htmlFor="secret" className="block text-sm font-medium text-gray-700 mb-2">
//                   Admin Secret Key
//                 </label>
//                 <input
//                   id="secret"
//                   type="password"
//                   name="secret"
//                   placeholder="Enter the admin secret key"
//                   value={form.secret}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
//                 />
//               </div>
//             )}

//             {form.role === 'doctor' && (
//               <>
//                 <div>
//                   <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
//                     Specialization
//                   </label>
//                   <select
//                     id="specialization"
//                     name="specialization"
//                     value={form.specialization}
//                     onChange={handleChange}
//                     required
//                     className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
//                   >
//                     <option value="">Select Specialization</option>
//                     {doctorSpecializations.map((spec, idx) => (
//                       <option key={idx} value={spec}>{spec}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
//                       Experience (years)
//                     </label>
//                     <input
//                       id="experience"
//                       type="number"
//                       name="experience"
//                       placeholder="Years"
//                       value={form.experience}
//                       onChange={handleChange}
//                       required
//                       className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
//                       Age
//                     </label>
//                     <input
//                       id="age"
//                       type="number"
//                       name="age"
//                       placeholder="Age"
//                       value={form.age}
//                       onChange={handleChange}
//                       required
//                       min="18"
//                       max="100"
//                       className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
//                     />
//                   </div>
//                 </div>
//               </>
//             )}

//             {form.role !== 'doctor' && (
//               <div>
//                 <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
//                   Age
//                 </label>
//                 <input
//                   id="age"
//                   type="number"
//                   name="age"
//                   placeholder="Age"
//                   value={form.age}
//                   onChange={handleChange}
//                   required
//                   min="1"
//                   max="120"
//                   className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
//                 />
//               </div>
//             )}

//             <div>
//               <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
//                 Phone Number
//               </label>
//               <input
//                 id="phone"
//                 type="tel"
//                 name="phone"
//                 placeholder="e.g. +919876543210"
//                 value={form.phone}
//                 onChange={handleChange}
//                 required
//                 pattern="^\+91\d{10}$"
//                 className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
//               />
//             </div>

//             <button 
//               type="submit" 
//               disabled={loading}
//               className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium hover:from-blue-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base sm:text-lg"
//             >
//               {loading ? 'Creating Account...' : 'Create Account'}
//             </button>

//             {error && (
//               <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm">
//                 {error}
//               </div>
//             )}
//             {success && (
//               <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm">
//                 {success}
//               </div>
//             )}
//           </form>
//           <div className="mt-4 sm:mt-6 text-center">
//             <p className="text-gray-600 text-sm sm:text-base">
//               Already have an account?{' '}
//               <button 
//                 onClick={() => navigate('/login')}
//                 className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
//               >
//                 Sign in here
//               </button>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Signup;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL, CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_URL } from '../../utils/Data';
import defaultImg from '../../assets/avatar-default-icon.png'
const DEFAULT_AVATAR = "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pngwing.com%2Fen%2Ffree-png-augve&psig=AOvVaw3Reg_w1f4vtCFq-WEXScnY&ust=1754747693777000&source=images&cd=vfe&opi=89978449&ved=2ahUKEwiaxvfYrvuOAxXg4TgGHXLyHagQjRx6BAgAEBo";

const doctorSpecializations = [
  'General Physician', 'Neurologist', 'Endocrinologist', 'Cardiologist',
  'Dermatologist', 'Psychiatrist / Psychologist', 'Pediatrician',
  'Gynecologist / Obstetrician', 'Orthopedic Surgeon / Specialist',
  'Ophthalmologist', 'Dentist / Dental Surgeon', 'Other'
];

const Signup = () => {
  const [form, setForm] = useState({
    username: '', email: '', password: '', role: 'patient', avatar: '',
    specialization: '', experience: '', age: '', phone: '', secret: '', countryCode: '+91'
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.secure_url) {
        setForm({ ...form, avatar: data.secure_url });
        setSuccess('Image uploaded successfully!');
      } else {
        setError('Failed to upload image.');
      }
    } catch {
      setError('Image upload error');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageUploading) return;
    setError('');
    setSuccess('');
    setLoading(true);

    const finalForm = {
      ...form,
      phone: `${form.countryCode}${form.phone}`
    };

    try {
      const endpoint = form.role === 'admin' ? '/auth/register-admin' : '/auth/register';
      const payload = form.role === 'admin' ? {
        username: form.username, email: form.email, password: form.password,
        avatar: form.avatar, phone: finalForm.phone, secret: form.secret
      } : { ...finalForm };

      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-tr from-blue-100 via-white to-green-100   overflow-hidden px-4 py-10">
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-300 opacity-20 rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-green-300 opacity-20 rounded-full animate-pulse"></div>

      <div className="w-full max-w-md bg-white rounded-2xl mt-10 shadow-2xl p-8 relative z-10 pb-10">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="w-30 h-30 rounded-full overflow-hidden  ">
              <img src={form.avatar || defaultImg} alt="Avatar" className="object-cover w-full h-full  " />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className=" ml-20  text-sm text-gray-600 cursor-pointer"
            />
            {imageUploading && <span className="text-blue-500 text-xs mt-1">Uploading...</span>}
          </div>

            {[
              { label: 'Username', name: 'username', type: 'text' },
              { label: 'Email Address', name: 'email', type: 'email' },
              { label: 'Password', name: 'password', type: 'password' },
              { label: 'Phone Number (+91...)', name: 'phone', type: 'tel', pattern: '^\\+91\\d{10}$' },
              { label: 'Age', name: 'age', type: 'number' }
              ].map(({ label, name, type, pattern }) =>
                type === 'tel' ? (
                  <div key={name} className="relative">
                    <div className="flex space-x-2">
                      <select
                        name="countryCode"
                        value={form.countryCode}
                        onChange={handleChange}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+61">🇦🇺 +61</option>
                        <option value="+81">🇯🇵 +81</option>
                        <option value="+49">🇩🇪 +49</option>
                      </select>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="1234567890"
                        pattern="\d{10}"
                        maxLength={10}
                        required
                        value={form.phone}
                        onChange={handleChange}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div key={name} className="relative">
                    <input
                      type={type}
                      name={name}
                      id={name}
                      value={form[name]}
                      onChange={handleChange}
                      placeholder=" "
                      required
                      pattern={pattern}
                      className="peer w-full px-4 pt-6 pb-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor={name} className="absolute left-4 top-2 text-xs text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs transition-all">
                      {label}
                    </label>
                  </div>
                )
              )}


          <div className="relative">
            <select
              name="role"
              id="role"
              value={form.role}
              onChange={handleChange}
              className="peer w-full px-4 pt-6 pb-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="seller">Medicine Seller</option>
              <option value="admin">Admin</option>
            </select>
            <label htmlFor="role" className="absolute left-4 top-2 text-xs text-gray-500 peer-focus:top-2 peer-focus:text-xs transition-all">
              Select Role
            </label>
          </div>

          {form.role === 'admin' && (
            <div className="relative">
              <input
                type="password"
                name="secret"
                id="secret"
                value={form.secret}
                onChange={handleChange}
                placeholder=" "
                required
                className="peer w-full px-4 pt-6 pb-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="secret" className="absolute left-4 top-2 text-xs text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs transition-all">
                Admin Secret Key
              </label>
            </div>
          )}

          {form.role === 'doctor' && (
            <>
              <div className="relative">
                <select
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  className="peer w-full px-4 pt-6 pb-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Specialization</option>
                  {doctorSpecializations.map((spec, i) => (
                    <option key={i} value={spec}>{spec}</option>
                  ))}
                </select>
                <label htmlFor="specialization" className="absolute left-4 top-2 text-xs text-gray-500 peer-focus:top-2 peer-focus:text-xs transition-all">
                  Specialization
                </label>
              </div>

              <div className="relative">
                <input
                  type="number"
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  placeholder=" "
                  required
                  className="peer w-full px-4 pt-6 pb-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="experience" className="absolute left-4 top-2 text-xs text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs transition-all">
                  Experience (years)
                </label>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading || imageUploading}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-2 rounded-md font-medium hover:from-blue-700 hover:to-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md text-sm">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded-md text-sm">{success}</div>}
        </form>

        <p className="mt-4 text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline  font-medium">
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
