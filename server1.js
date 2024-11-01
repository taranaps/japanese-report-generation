
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');  // Import CORS

const app = express();
const upload = multer({ dest: 'uploads/' });  // Temporary storage for attachments

// Enable CORS for all origins
app.use(cors());  // Allow requests from any origin
app.use(express.json());  // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));  // Parse URL-encoded request bodies

// Serve static files (like index.html) from the "pages" folder
app.use(express.static(path.join(__dirname, 'pages')));

// Endpoint to handle email sending
app.post('/send-email', upload.single('attachment'), async (req, res) => {
    const { to, subject, message } = req.body;
    const attachment = req.file;

    // Split the 'to' field by commas and trim spaces
    const recipients = to.split(',').map(email => email.trim()).join(',');

    // Set up Nodemailer transporter
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'hishampallickalll@gmail.com',  // Replace with your email
            pass: 'gdzg edjq bzrp iqif'  // Replace with your app password
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // Configure email options
    const mailOptions = {
        from: 'hishampallickalll@gmail.com',
        to: recipients,  // Use the joined string of recipients
        subject,
        html: `<p>${message}</p>`,
        attachments: attachment
            ? [
                {
                    filename: attachment.originalname,
                    path: attachment.path
                }
            ]
            : []
    };

    try {
        // Send the email
        const info = await transporter.sendMail(mailOptions);
    
        // Optionally delete the uploaded file
        if (attachment) {
            fs.unlinkSync(attachment.path);
        }
    
        // Send a success response
        res.status(200).json({ message: 'Email sent successfully: ' + info.messageId });
        console.log(res.status);

    } catch (error) {
        console.error("Error sending email:", error);
        console.log(res.status);
        
        res.status(500).json({ message: 'Failed to send email: ' + error.message });
    }
});

// Start the server
app.listen(3001, () => {
    console.log('Server started on http://localhost:3001');
});


