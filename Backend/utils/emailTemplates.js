const BASE_URL = process.env.BASE_URL;

export const orderConfirmationEmail = (order, userName) => {
    return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Order Confirmation - HealthCare</title>
        <style>
            body {
                background-color: #ffffff;
                font-family: Arial,sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
            
            .logo {
                max-width: 200px;
                margin-bottom: 20px;
            }
            
            .message {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
                color: #2563eb;
            }
            
            .body {
                font-size: 16px;
                margin-bottom: 20px;
                text-align: left;
            }
            
            .cta {
                display: inline-block;
                padding: 12px 24px;
                background-color: #2563eb;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                margin-top: 20px;
                transition: background-color 0.3s;
            }
            
            .cta:hover {
                background-color: #1d4ed8;
            }
            
            .support {
                font-size: 14px;
                color: #6b7280;
                margin-top: 20px;
            }
            
            .highlight {
                font-weight: bold;
                color: #059669;
            }
            
            .order-details {
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: left;
            }
            
            .order-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e2e8f0;
            }
            
            .order-item:last-child {
                border-bottom: none;
            }
            
            .total {
                font-weight: bold;
                font-size: 18px;
                color: #059669;
                margin-top: 15px;
                padding-top: 15px;
                border-top: 2px solid #e2e8f0;
            }
            
            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                background-color: #dbeafe;
                color: #1e40af;
                border-radius: 20px;
                font-size: 14px;
                font-weight: bold;
            }
            
        </style>
    </head>
    
    <body>
        <div class="container">
            <a href="${BASE_URL}">
                <img class="logo" src="https://res.cloudinary.com/dmhz2zfzs/image/upload/v1754506628/EmailIcon_tpj48d.png" alt="HealthCare Logo">
            </a>
            
            <div class="message">🎉 Order Confirmation</div>
            <div class="body">
                <p>Dear <span class="highlight">${userName}</span>,</p>
                <p>Your order has been successfully confirmed and is being processed! We're excited to deliver your medicines to you.</p>
                
                <div class="order-details">
                    <h3>Order Details</h3>
                    <p><strong>Order ID:</strong> #${order._id.toString().slice(-8)}</p>
                    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> <span class="status-badge">${order.status}</span></p>
                    <p><strong>Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                    <p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                    
                    <h4>Items Ordered:</h4>
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${item.medicineId?.name} (Qty: ${item.quantity})</span>
                            <span>₹${item.price * item.quantity}</span>
                        </div>
                    `).join('')}
                    
                    <div class="total">
                        <span>Total Amount: ₹${order.totalAmount}</span>
                    </div>
                </div>
                
                <p><strong>Delivery Address:</strong><br>
                ${order.deliveryAddress.street}, ${order.deliveryAddress.city}<br>
                ${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}<br>
                Phone: ${order.deliveryAddress.phone}</p>
                
                <a class="cta" href="${BASE_URL}/my-orders">Track Your Order</a>
            </div>
            <div class="support">
                If you have any questions or need assistance, please feel free to reach out to us at 
                <a href="mailto:support@healthcare.com">support@healthcare.com</a>. We are here to help!
            </div>
        </div>
    </body>
    
    </html>`;
};

export const orderStatusUpdateEmail = (order, userName, newStatus) => {
    return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Order Status Update - HealthCare</title>
        <style>
            body {
                background-color: #ffffff;
                font-family: Arial,sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
            
            .logo {
                max-width: 200px;
                margin-bottom: 20px;
            }
            
            .message {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
                color: #2563eb;
            }
            
            .body {
                font-size: 16px;
                margin-bottom: 20px;
                text-align: left;
            }
            
            .cta {
                display: inline-block;
                padding: 12px 24px;
                background-color: #2563eb;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                margin-top: 20px;
                transition: background-color 0.3s;
            }
            
            .cta:hover {
                background-color: #1d4ed8;
            }
            
            .support {
                font-size: 14px;
                color: #6b7280;
                margin-top: 20px;
            }
            
            .highlight {
                font-weight: bold;
                color: #059669;
            }
            
            .status-update {
                background-color: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
            }
            
            .status-badge {
                display: inline-block;
                padding: 6px 16px;
                background-color: #dbeafe;
                color: #1e40af;
                border-radius: 20px;
                font-size: 16px;
                font-weight: bold;
                margin: 10px 0;
            }
            
        </style>
    </head>
    
    <body>
        <div class="container">
            <a href="${BASE_URL}">
                <img class="logo" src="https://res.cloudinary.com/dmhz2zfzs/image/upload/v1754506628/EmailIcon_tpj48d.png" alt="HealthCare Logo">
            </a>
            
            <div class="message">📦 Order Status Update</div>
            <div class="body">
                <p>Dear <span class="highlight">${userName}</span>,</p>
                <p>Your order status has been updated! Here are the latest details:</p>
                
                <div class="status-update">
                    <h3>Status Update</h3>
                    <p>Order ID: <span class="highlight">#${order._id.toString().slice(-8)}</span></p>
                    <p>New Status: <span class="status-badge">${newStatus}</span></p>
                    <p>Updated on: ${new Date().toLocaleDateString()}</p>
                </div>
                
                <p><strong>Current Order Details:</strong></p>
                <p>• Order Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p>• Total Amount: ₹${order.totalAmount}</p>
                <p>• Estimated Delivery: ${new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                
                <a class="cta" href="${BASE_URL}/my-orders">Track Your Order</a>
            </div>
            <div class="support">
                If you have any questions or need assistance, please feel free to reach out to us at 
                <a href="mailto:support@healthcare.com">support@healthcare.com</a>. We are here to help!
            </div>
        </div>
    </body>
    
    </html>`;
};

export const orderCancellationEmail = (order, userName, reason) => {
    return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Order Cancellation - HealthCare</title>
        <style>
            body {
                background-color: #ffffff;
                font-family: Arial,sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
            
            .logo {
                max-width: 200px;
                margin-bottom: 20px;
            }
            
            .message {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
                color: #dc2626;
            }
            
            .body {
                font-size: 16px;
                margin-bottom: 20px;
                text-align: left;
            }
            
            .cta {
                display: inline-block;
                padding: 12px 24px;
                background-color: #2563eb;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                margin-top: 20px;
                transition: background-color 0.3s;
            }
            
            .cta:hover {
                background-color: #1d4ed8;
            }
            
            .support {
                font-size: 14px;
                color: #6b7280;
                margin-top: 20px;
            }
            
            .highlight {
                font-weight: bold;
                color: #dc2626;
            }
            
            .cancellation-notice {
                background-color: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
            }
            
            .status-badge {
                display: inline-block;
                padding: 6px 16px;
                background-color: #fecaca;
                color: #dc2626;
                border-radius: 20px;
                font-size: 16px;
                font-weight: bold;
                margin: 10px 0;
            }
            
        </style>
    </head>
    
    <body>
        <div class="container">
            <a href="${BASE_URL}">
                <img class="logo" src="https://res.cloudinary.com/dmhz2zfzs/image/upload/v1754506628/EmailIcon_tpj48d.png" alt="HealthCare Logo">
            </a>
            
            <div class="message">❌ Order Cancellation</div>
            <div class="body">
                <p>Dear <span class="highlight">${userName}</span>,</p>
                <p>Your order has been cancelled as requested. Here are the details:</p>
                
                <div class="cancellation-notice">
                    <h3>Order Cancelled</h3>
                    <p>Order ID: <span class="highlight">#${order._id.toString().slice(-8)}</span></p>
                    <p>Status: <span class="status-badge">Cancelled</span></p>
                    <p>Cancellation Reason: ${reason}</p>
                    <p>Cancelled on: ${new Date().toLocaleDateString()}</p>
                </div>
                
                <p><strong>Cancelled Order Details:</strong></p>
                <p>• Order Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p>• Total Amount: ₹${order.totalAmount}</p>
                <p>• Payment Method: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                
                <p><strong>Refund Information:</strong></p>
                <p>If you paid online, your refund will be processed within 5-7 business days.</p>
                
                <a class="cta" href="${BASE_URL}/medicine-store">Shop Again</a>
            </div>
            <div class="support">
                If you have any questions or need assistance, please feel free to reach out to us at 
                <a href="mailto:support@healthcare.com">support@healthcare.com</a>. We are here to help!
            </div>
        </div>
    </body>
    
    </html>`;
};

export const orderDeliveredEmail = (order, userName) => {
    return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Order Delivered - HealthCare</title>
        <style>
            body {
                background-color: #ffffff;
                font-family: Arial,sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
            
            .logo {
                max-width: 200px;
                margin-bottom: 20px;
            }
            
            .message {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
                color: #059669;
            }
            
            .body {
                font-size: 16px;
                margin-bottom: 20px;
                text-align: left;
            }
            
            .cta {
                display: inline-block;
                padding: 12px 24px;
                background-color: #059669;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                margin-top: 20px;
                transition: background-color 0.3s;
            }
            
            .cta:hover {
                background-color: #047857;
            }
            
            .support {
                font-size: 14px;
                color: #6b7280;
                margin-top: 20px;
            }
            
            .highlight {
                font-weight: bold;
                color: #059669;
            }
            
            .delivery-success {
                background-color: #f0fdf4;
                border: 1px solid #bbf7d0;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
            }
            
            .status-badge {
                display: inline-block;
                padding: 6px 16px;
                background-color: #bbf7d0;
                color: #059669;
                border-radius: 20px;
                font-size: 16px;
                font-weight: bold;
                margin: 10px 0;
            }
            
        </style>
    </head>
    
    <body>
        <div class="container">
            <a href="${BASE_URL}">
                <img class="logo" src="https://res.cloudinary.com/dmhz2zfzs/image/upload/v1754506628/EmailIcon_tpj48d.png" alt="HealthCare Logo">
            </a>
            
            <div class="message">🎉 Order Delivered Successfully!</div>
            <div class="body">
                <p>Dear <span class="highlight">${userName}</span>,</p>
                <p>Great news! Your order has been successfully delivered to your doorstep.</p>
                
                <div class="delivery-success">
                    <h3>✅ Delivery Complete</h3>
                    <p>Order ID: <span class="highlight">#${order._id.toString().slice(-8)}</span></p>
                    <p>Status: <span class="status-badge">Delivered</span></p>
                    <p>Delivered on: ${new Date().toLocaleDateString()}</p>
                </div>
                
                <p><strong>Order Summary:</strong></p>
                <p>• Order Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p>• Total Amount: ₹${order.totalAmount}</p>
                <p>• Delivery Address: ${order.deliveryAddress.street}, ${order.deliveryAddress.city}</p>
                
                <p><strong>Thank you for choosing HealthCare!</strong></p>
                <p>We hope you're satisfied with your purchase. If you have any feedback or need assistance, please don't hesitate to reach out.</p>
                
                    <a class="cta" href="${BASE_URL}/medicine-store">Shop Again</a>
            </div>
            <div class="support">
                If you have any questions or need assistance, please feel free to reach out to us at 
                <a href="mailto:support@healthcare.com">support@healthcare.com</a>. We are here to help!
            </div>
        </div>
    </body>
    
    </html>`;
}; 