import nodemailer from 'nodemailer';
import { 
    orderConfirmationEmail, 
    orderStatusUpdateEmail, 
    orderCancellationEmail,
    orderDeliveredEmail 
} from './emailTemplates.js';

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASSWORD // Your Gmail app password
    }
});

// Send order confirmation email
export const sendOrderConfirmationEmail = async (order, user) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: '🎉 Order Confirmation - HealthCare',
            html: orderConfirmationEmail(order, user.username)
        }; 

        const result = await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent successfully:', result.messageId);
        return { success: true, message: 'Order confirmation email sent successfully!' };
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        return { success: false, message: 'Failed to send order confirmation email.' };
    }
};

// Send order status update email
export const sendOrderStatusUpdateEmail = async (order, user, newStatus) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: '📦 Order Status Update - HealthCare',
            html: orderStatusUpdateEmail(order, user.username, newStatus)
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Order status update email sent successfully:', result.messageId);
        return { success: true, message: 'Order status update email sent successfully!' };
    } catch (error) {
        console.error('Error sending order status update email:', error);
        return { success: false, message: 'Failed to send order status update email.' };
    }
};

// Send order cancellation email
export const sendOrderCancellationEmail = async (order, user, reason) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: '❌ Order Cancellation - HealthCare',
            html: orderCancellationEmail(order, user.username, reason)
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Order cancellation email sent successfully:', result.messageId);
        return { success: true, message: 'Order cancellation email sent successfully!' };
    } catch (error) {
        console.error('Error sending order cancellation email:', error);
        return { success: false, message: 'Failed to send order cancellation email.' };
    }
};

// Send order delivered email
export const sendOrderDeliveredEmail = async (order, user) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: '🎉 Order Delivered Successfully - HealthCare',
            html: orderDeliveredEmail(order, user.username)
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Order delivered email sent successfully:', result.messageId);
        return { success: true, message: 'Order delivered email sent successfully!' };
    } catch (error) {
        console.error('Error sending order delivered email:', error);
        return { success: false, message: 'Failed to send order delivered email.' };
    }
};

// module.exports = {
//     sendOrderConfirmationEmail,
//     sendOrderStatusUpdateEmail,
//     sendOrderCancellationEmail,
//     sendOrderDeliveredEmail
// }; 