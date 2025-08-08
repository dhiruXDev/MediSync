import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../shared/UserContext';
import { FaSearch, FaShoppingCart, FaFilter, FaTimes, FaPlus, FaMinus, FaStar, FaTruck, FaShieldAlt, FaCreditCard } from 'react-icons/fa';
import { BASE_URL } from '../../utils/Data';
import assuredImg from '../../assets/AssuredTag.png';
const MedicineStore = () => {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);

  const  user  = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Load cart from localStorage on component mount
    const savedCart = localStorage.getItem('medicineCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    
    fetchMedicines();
    fetchCategories();
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever cart changes
    localStorage.setItem('medicineCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (filtersApplied) {
      fetchMedicines();
    }
  }, [searchTerm, selectedCategory, minPrice, maxPrice, sortBy, sortOrder, filtersApplied]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await fetch(`${BASE_URL}/medicines?${params}`);
      const data = await response.json();
      setMedicines(data.medicines || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${BASE_URL}/medicines/categories/list`);
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const addToCart = (medicine) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === medicine._id);
      if (existingItem) {
        return prevCart.map(item =>
          item._id === medicine._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...medicine, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (medicineId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== medicineId));
  };

  const updateQuantity = (medicineId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(medicineId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item._id === medicineId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const applyFilters = () => {
    setFiltersApplied(true);
    fetchMedicines();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('name');
    setSortOrder('asc');
    setFiltersApplied(false);
    fetchMedicines();
  };

  const handleBuyNow = (medicine) => {
    console.log("1" ,user);
    if ( user?.user == null) {
      navigate('/login');
      return;
    }
    console.log("2" ,user?.user);
    navigate('/buy-now', { state: { medicine } });
  };

  const handleCheckout = () => {
    if (!user?.user) {
      navigate('/login');
      return;
    }
    navigate('/checkout', { state: { cart } });
  };

  const handleProductClick = (medicine) => {
    navigate(`/product/${medicine._id}`, { state: { medicine } });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Amazon-style Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <h1 className="text-2xl font-bold text-gray-900">HealthCare Pharmacy</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <FaTruck className="mr-1" />
                    Free Delivery
                  </span>
                  <span className="flex items-center">
                    <FaShieldAlt className="mr-1" />
                    Secure Payment
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowCart(!showCart)}
                  className="relative flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <FaShoppingCart />
                  Cart
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaFilter />
              Filters
            </button>

            {/* Apply Filters Button */}
            {showFilters && (
              <button
                onClick={applyFilters}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Apply Filters
              </button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field);
                      setSortOrder(order);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="price-asc">Price (Low to High)</option>
                    <option value="price-desc">Price (High to Low)</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  <FaTimes />
                  Clear Filters
                </button>
                <button
                  onClick={applyFilters}
                  className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Medicines Grid */}
          <div className={`${showCart ? 'lg:w-2/3' : 'w-full'}`}>
            {medicines.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No medicines found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {medicines.map((medicine) => (
                  <div key={medicine._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200">
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleProductClick(medicine)}
                    >
                      <img
                        src={`${BASE_URL}/${medicine.image}`}
                        alt={medicine.name}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 text-gray-900 hover:text-orange-600 cursor-pointer" onClick={() => handleProductClick(medicine)}>
                        {medicine.name}
                      </h3>
                      <div className=' flex justify-between items-center mb-2'> 
                          <div className="flex items-center mb-2">
                                <div className="flex text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} className="w-4 h-4" />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500 ml-2">(4.5)</span>
                          </div>
                          {/* Image */}
                          <div className="flex items-center mb-2">
                             <img src={assuredImg} alt='Tag' className=' h-4 w-20 ' />
                           </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{medicine.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xl font-bold text-green-600">₹{medicine.price}</span>
                        <span className="text-sm text-gray-500">Stock: {medicine.stock}</span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {medicine.category}
                        </span>
                        {medicine.requiresPrescription && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            Prescription Required
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={() => handleBuyNow(medicine)}
                          disabled={medicine.stock === 0}
                          className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                        >
                          {medicine.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                        </button>
                        <button
                          onClick={() => addToCart(medicine)}
                          disabled={medicine.stock === 0}
                          className="w-full bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-gray-200 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors border border-gray-300"
                        >
                          {medicine.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

                    {/* Cart Sidebar */}
          {showCart && (
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Shopping Cart</h2>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes />
                  </button>
                </div>
                
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <FaShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                    <button
                      onClick={() => setShowCart(false)}
                      className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item._id} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                          <img
                            src={`${BASE_URL}/${item.image}`}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                            }}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{item.name}</h4>
                            <p className="text-gray-600 text-sm">₹{item.price}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                            >
                              <FaMinus className="text-xs" />
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                            >
                              <FaPlus className="text-xs" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="ml-2 text-red-500 hover:text-red-700"
                              title="Remove from cart"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between mb-4">
                        <span className="font-semibold text-lg">Total:</span>
                        <span className="font-bold text-xl text-green-600">₹{getCartTotal()}</span>
                      </div>
                      <button
                        onClick={handleCheckout}
                        className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicineStore; 