import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../shared/UserContext';
import { FaStar, FaTruck, FaShieldAlt, FaArrowLeft, FaShoppingCart, FaCreditCard } from 'react-icons/fa';
import { BASE_URL } from '../../utils/Data';
import ReviewSection from './ReviewSection.jsx';
import assuredImg from '../../assets/AssuredTag.png';
const ProductDetail = () => {
  const [medicine, setMedicine] = useState(null);
  const [relatedMedicines, setRelatedMedicines] = useState([]);
  const [topRatedMedicines, setTopRatedMedicines] = useState([]);
  const [similarMedicines, setSimilarMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  
  const  user  = useUser();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.medicine) {
      setMedicine(location.state.medicine);
      fetchRelatedMedicines(location.state.medicine.category);
      fetchTopRatedMedicines();
      fetchSimilarMedicines(location.state.medicine.category, location.state.medicine.manufacturer);
      setLoading(false);
    } else {
      fetchMedicine();
    }
  }, [id, location.state]);

  const fetchMedicine = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/medicines/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setMedicine(data.medicine);
        fetchRelatedMedicines(data.medicine.category);
        fetchTopRatedMedicines();
        fetchSimilarMedicines(data.medicine.category, data.medicine.manufacturer);
      } else {
        navigate('/medicine-store');
      }
    } catch (error) {
      console.error('Error fetching medicine:', error);
      navigate('/medicine-store');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedMedicines = async (category) => {
    try {
      const response = await fetch(`${BASE_URL}/medicines?category=${category}&limit=4`);
      const data = await response.json();
      setRelatedMedicines(data.medicines?.filter(m => m._id !== id) || []);
    } catch (error) {
      console.error('Error fetching related medicines:', error);
    }
  };

  const fetchTopRatedMedicines = async () => {
    try {
      const response = await fetch(`${BASE_URL}/medicines?sortBy=rating&sortOrder=desc&limit=4`);
      const data = await response.json();
      setTopRatedMedicines(data.medicines?.filter(m => m._id !== id) || []);
    } catch (error) {
      console.error('Error fetching top rated medicines:', error);
    }
  };

  const fetchSimilarMedicines = async (category, manufacturer) => {
    try {
      const response = await fetch(`${BASE_URL}/medicines?category=${category}&manufacturer=${manufacturer}&limit=4`);
      const data = await response.json();
      setSimilarMedicines(data.medicines?.filter(m => m._id !== id) || []);
    } catch (error) {
      console.error('Error fetching similar medicines:', error);
    }
  };

  const addToCart = () => {
    if (!user?.user) {
      navigate('/login');
      return;
    }

    const existingCart = JSON.parse(localStorage.getItem('medicineCart') || '[]');
    const existingItem = existingCart.find(item => item._id === medicine._id);
    
    if (existingItem) {
      const updatedCart = existingCart.map(item =>
        item._id === medicine._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      localStorage.setItem('medicineCart', JSON.stringify(updatedCart));
    } else {
      const updatedCart = [...existingCart, { ...medicine, quantity }];
      localStorage.setItem('medicineCart', JSON.stringify(updatedCart));
    }
    
    alert('Added to cart successfully!');
  };

  const handleBuyNow = () => {
    if (!user?.user) {
      navigate('/login');
      return;
    }
    navigate('/buy-now', { state: { medicine, quantity } });
  };

  const handleMedicineCardClick = async (selectedMedicine) => {
    setRefreshing(true);
    setMedicine(selectedMedicine);
    
    // Fetch related medicines for the new medicine
    await Promise.all([
      fetchRelatedMedicines(selectedMedicine.category),
      fetchTopRatedMedicines(),
      fetchSimilarMedicines(selectedMedicine.category, selectedMedicine.manufacturer)
    ]);
    
    setRefreshing(false);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDeliveryDate = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    return deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (refreshing) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
            <p className="text-gray-600">Loading medicine details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
            <button
              onClick={() => navigate('/medicine-store')}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
            >
              Back to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/medicine-store')}
          className="flex items-center gap-2 text-gray-600 cursor-pointer  hover:text-blue-800 mb-6"
        >
          <FaArrowLeft />
          Back to Store
        </button>

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div>
              <img
                src={`${BASE_URL}/${medicine.image}`}
                alt={medicine.name}
                className="w-full h-96 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                }}
              />
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{medicine.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="w-5 h-5" />
                  ))}
                </div>
                <span className="text-gray-600 ml-2">4.5 out of 5</span>
                <span className="text-gray-500 ml-2">(1,234 reviews)</span>
              </div>

              {/* Price */}
              <div className=' flex justify-between items-center mb-2'>
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-green-600">₹{medicine.price}</span>
                    <span className="text-gray-500 ml-2">per unit</span>
                  </div>
                    {/* Image */}
                    <div className="flex items-center mb-2">
                      <img src={assuredImg} alt='Tag' className=' h-6 w-24 ' />
                    </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <FaTruck className="text-blue-600" />
                  <span className="font-semibold text-blue-800">Free Delivery</span>
                </div>
                <p className="text-blue-700">Get it by {getDeliveryDate()}</p>
              </div>

              {/* Product Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-semibold">{medicine.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Manufacturer:</span>
                  <span className="font-semibold">{medicine.manufacturer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dosage Form:</span>
                  <span className="font-semibold">{medicine.dosageForm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Strength:</span>
                  <span className="font-semibold">{medicine.strength}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stock:</span>
                  <span className={`font-semibold ${medicine.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {medicine.stock > 0 ? `${medicine.stock} units available` : 'Out of Stock'}
                  </span>
                </div>
                {medicine.requiresPrescription && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <span className="text-red-800 font-semibold">⚠️ Prescription Required</span>
                  </div>
                )}
              </div>

              {/* Quantity and Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="font-semibold">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 hover:bg-gray-100"
                      disabled={medicine.stock <= quantity}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleBuyNow}
                    disabled={medicine.stock === 0}
                    className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={addToCart}
                    disabled={medicine.stock === 0}
                    className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 disabled:bg-gray-400 disabled:cursor-not-allowed border border-gray-300"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
            <p className="text-gray-700 leading-relaxed">{medicine.description}</p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8">
          <ReviewSection 
            medicineId={medicine._id} 
            averageRating={medicine.averageRating || 0} 
            totalReviews={medicine.totalReviews || 0} 
          />
        </div>

        {/* Related Products Sections */}
        <div className="space-y-8">
          {/* Top Rated Medicines */}
          {topRatedMedicines.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Rated Medicines</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                 {topRatedMedicines.map((relatedMedicine) => (
                   <div
                     key={relatedMedicine._id}
                     className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105 transition-transform duration-200"
                     onClick={() => handleMedicineCardClick(relatedMedicine)}
                   >
                    <img
                      src={`${BASE_URL}/${relatedMedicine.image}`}
                      alt={relatedMedicine.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{relatedMedicine.name}</h3>
                      <div className="flex gap-x-2 justify-between items-center mb-2">
                        <div className='  flex  items-center'>
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <FaStar key={i} className="w-3 h-3" />
                              ))}
                            </div>
      
                            <span className="text-sm text-gray-500 ml-1">(4.8)</span>
                        </div>
                               
                        <div className="flex items-center mb-2">
                          <img src={assuredImg} alt='Tag' className=' h-4 w-20 ' />
                        </div>
                      </div>
                      <p className="text-lg font-bold text-green-600">₹{relatedMedicine.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar Medicines */}
          {similarMedicines.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Medicines</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                 {similarMedicines.map((relatedMedicine) => (
                   <div
                     key={relatedMedicine._id}
                     className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105 transition-transform duration-200"
                     onClick={() => handleMedicineCardClick(relatedMedicine)}
                   >
                    <img
                      src={`${BASE_URL}/${relatedMedicine.image}`}
                      alt={relatedMedicine.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{relatedMedicine.name}</h3>
                       <div className="flex gap-x-2 justify-between items-center mb-2">
                        <div className='  flex  items-center'>
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <FaStar key={i} className="w-3 h-3" />
                              ))}
                            </div>
      
                            <span className="text-sm text-gray-500 ml-1">(4.8)</span>
                        </div>
                               
                        <div className="flex items-center mb-2">
                          <img src={assuredImg} alt='Tag' className=' h-4 w-20 ' />
                        </div>
                      </div>
                      <p className="text-lg font-bold text-green-600">₹{relatedMedicine.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Products */}
          {relatedMedicines.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                 {relatedMedicines.map((relatedMedicine) => (
                   <div
                     key={relatedMedicine._id}
                     className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105 transition-transform duration-200"
                     onClick={() => handleMedicineCardClick(relatedMedicine)}
                   >
                    <img
                      src={`${BASE_URL}/${relatedMedicine.image}`}
                      alt={relatedMedicine.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{relatedMedicine.name}</h3>
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className="w-3 h-3" />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 ml-1">(4.5)</span>
                      </div>
                      <p className="text-lg font-bold text-green-600">₹{relatedMedicine.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 