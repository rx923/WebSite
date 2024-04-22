const nodemailer = require('nodemailer');

async function sendPasswordResetEmail(email, newPassword) {
    try {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER, // Your Gmail email address
                pass: process.env.EMAIL_PASS // Your app-specific password 
            },
            tls: {
                // Enable STARTTLS
                ciphers: 'SSLv3',
                rejectUnauthorized: false 
            }
        });

        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: email, // Dynamic email address of the user
            subject: 'Password Reset',
            text: `Your new password is: ${newPassword}`
        };

        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully.');
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email.');
    }
}

module.exports = { sendPasswordResetEmail };