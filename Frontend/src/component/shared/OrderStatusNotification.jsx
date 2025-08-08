import React, { useState, useEffect } from 'react';
import { FaBell, FaTimes, FaCheckCircle, FaTruck, FaBox } from 'react-icons/fa';

const OrderStatusNotification = ({ order, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-hide after 10 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(), 300); // Wait for fade out animation
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FaCheckCircle className="text-green-500" />;
      case 'shipped':
      case 'in_transit':
        return <FaTruck className="text-blue-500" />;
      case 'processing':
        return <FaBox className="text-purple-500" />;
      default:
        return <FaBell className="text-yellow-500" />;
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'delivered':
        return 'Your order has been delivered successfully!';
      case 'shipped':
        return 'Your order has been shipped and is on its way!';
      case 'processing':
        return 'Your order is being processed and prepared for shipment!';
      case 'confirmed':
        return 'Your order has been confirmed!';
      default:
        return `Your order status has been updated to: ${status}`;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-lg border-l-4 border-green-500 p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {getStatusIcon(order.status)}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">
              Order #{order._id.slice(-8)} Updated
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              {getStatusMessage(order.status)}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Order Total: ₹{order.totalAmount}</span>
              <span>•</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose(), 300);
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusNotification;
