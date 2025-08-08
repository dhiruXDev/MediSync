// import React, { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import '../../App.css';
// import { useUser } from '../shared/UserContext';
// import { BASE_URL } from '../../utils/Data';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { login } = useUser();

//   // Get the intended destination from location state
//   const from = location.state?.from?.pathname || '/';

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
    
//     try {
//       const res = await fetch(`${BASE_URL}/auth/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password })
//       });
//       const data = await res.json();
      
//       if (res.ok) {
//         localStorage.setItem('token', data.token);
//         localStorage.setItem('role', data.user.role);
//         login(data.user); // Store user data in context and localStorage
//         // Redirect based on role
//         if (data.user.role === 'admin') {
//           navigate('/admin-dashboard', { replace: true });
//         } else {
//           navigate('/', { replace: true });
//         }
//       } else {
//         setError(data.message || 'Login failed. Please check your credentials.');
//       }
//     } catch (err) {
//       setError('Network error. Please check your connection and try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 sm:py-16 px-2">
//         {/* Decorative Background Image */}
//         <img 
//         src="./LogIn.jpg"
//         alt=""
//         className="absolute left-6 top-1/4   opacity-40  rounded-full  pointer-events-none select-none hidden sm:block  w-[424px]  "
//       />
//         <img 
//         src="./LogIn.jpg"
//         alt=""
//         className="absolute right-38 top-1/3   opacity-40  rounded-full  pointer-events-none select-none hidden sm:block  w-[424px]    "
//       />
//       <div className="w-[100%]   sm:max-w-md mx-auto">
//         <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
//           <div className="text-center mb-6 sm:mb-8">
//             <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
//             <p className="text-gray-600 text-base sm:text-lg">Sign in to your healthcare account</p>
//           </div>
//           <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 placeholder="Enter your email"
//                 value={email}
//                 onChange={e => setEmail(e.target.value)}
//                 required
//                 className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
//               />
//             </div>
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 type="password"
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={e => setPassword(e.target.value)}
//                 required
//                 className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
//               />
//             </div>
//             <button 
//               type="submit" 
//               disabled={loading}
//               className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-green-700 transition-all duration-300 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? 'Signing In...' : 'Sign In'}
//             </button>
//             {error && (
//               <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm">
//                 {error}
//               </div>
//             )}
//           </form>
//           <div className="mt-4 sm:mt-6 text-center">
//             <p className="text-gray-600 text-sm sm:text-base">
//               Don't have an account?{' '}
//               <button 
//                 onClick={() => navigate('/signup')}
//                 className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
//               >
//                 Sign up here
//               </button>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login; 

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../shared/UserContext';
import { BASE_URL } from '../../utils/Data';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUser();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        login(data.user);
        navigate(data.user.role === 'admin' ? '/admin-dashboard' : from, { replace: true });
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 via-white to-green-100 relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-300 opacity-20 rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-green-300 opacity-20 rounded-full animate-pulse"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10 z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-500">Login to continue your health journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-green-600 transition disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don’t have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-blue-600 font-medium hover:underline"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
