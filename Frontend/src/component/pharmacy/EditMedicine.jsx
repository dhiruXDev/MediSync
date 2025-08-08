import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../shared/UserContext';
import { FaUpload, FaSave, FaArrowLeft } from 'react-icons/fa';
import { BASE_URL } from '../../utils/Data';

const EditMedicine = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    manufacturer: '',
    dosageForm: '',
    strength: '',
    requiresPrescription: false
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  
  const  user  = useUser();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (!user?.user || user?.user?.role !== 'seller') {
      navigate('/login');
      return;
    }
    fetchCategories();
    fetchMedicine();
  }, [user, navigate, id]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${BASE_URL}/medicines/categories/list`);
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMedicine = async () => {
    try {
      setFetching(true);
      const response = await fetch(`${BASE_URL}/medicines/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Medicine not found');
      }
      
      const data = await response.json();
      const medicine = data.medicine;
      
      setFormData({
        name: medicine.name,
        description: medicine.description,
        price: medicine.price.toString(),
        stock: medicine.stock.toString(),
        category: medicine.category,
        manufacturer: medicine.manufacturer,
        dosageForm: medicine.dosageForm,
        strength: medicine.strength,
        requiresPrescription: medicine.requiresPrescription
      });
      
      setCurrentImage(medicine.image);
      setImagePreview(`${BASE_URL}/${medicine.image}`);
    } catch (error) {
      console.error('Error fetching medicine:', error);
      setError('Failed to load medicine details');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const formDataToSend = new FormData();
      if (image) {
        formDataToSend.append('image', image);
      }
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('manufacturer', formData.manufacturer);
      formDataToSend.append('dosageForm', formData.dosageForm);
      formDataToSend.append('strength', formData.strength);
      formDataToSend.append('requiresPrescription', formData.requiresPrescription);

      const response = await fetch(`${BASE_URL}/medicines/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        alert('Medicine updated successfully!');
        navigate('/seller-dashboard');
      } else {
        setError(data.message || 'Failed to update medicine');
      }
    } catch (error) {
      console.error('Error updating medicine:', error);
      setError('Error updating medicine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const dosageForms = [
    'Tablet',
    'Capsule',
    'Syrup',
    'Injection',
    'Cream',
    'Ointment',
    'Drops',
    'Inhaler',
    'Other'
  ];

  if (fetching) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/seller-dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <FaArrowLeft />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Medicine</h1>
          <p className="text-gray-600">Update medicine information</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medicine Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {imagePreview ? (
                  <div>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto h-48 w-auto object-cover rounded-lg mb-4"
                    />
                    <div className="flex gap-2 justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setImage(null);
                          setImagePreview(`${BASE_URL}/${currentImage}`);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove New Image
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer text-blue-600 hover:text-blue-700"
                      >
                        Change Image
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <FaUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">Click to upload new medicine image</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Choose Image
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter medicine name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter price"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter stock quantity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manufacturer *
                </label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter manufacturer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dosage Form *
                </label>
                <select
                  name="dosageForm"
                  value={formData.dosageForm}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Dosage Form</option>
                  {dosageForms.map((form) => (
                    <option key={form} value={form}>{form}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Strength *
                </label>
                <input
                  type="text"
                  name="strength"
                  value={formData.strength}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 500mg, 10ml"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter medicine description, usage instructions, etc."
              />
            </div>

            {/* Prescription Required */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="requiresPrescription"
                checked={formData.requiresPrescription}
                onChange={handleInputChange}
                id="requiresPrescription"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requiresPrescription" className="ml-2 block text-sm text-gray-900">
                This medicine requires a prescription
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/seller-dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <FaSave />
                )}
                {loading ? 'Updating...' : 'Update Medicine'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMedicine; 