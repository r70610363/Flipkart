
const express = require('express');
const cors = require('cors');
const { Cashfree } = require('cashfree-pg');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// --- Static File Serving ---
// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

// --- API Routes ---
// Initialize Cashfree
Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID || "114321026a5f66183345bd82ee50123411";
Cashfree.XClientSecret = process.env.CASHFREE_CLIENT_SECRET || "cfsk_ma_prod_4fed9c52cb45cf5972e9a3b11e7bacde_d081651e";
Cashfree.XEnvironment = "production"; // Or "sandbox"

app.post('/api/payment/initiate', async (req, res) => {
    const { amount, orderId, email, name } = req.body;

    try {
        const request = {
            "order_amount": amount,
            "order_currency": "INR",
            "order_id": orderId,
            "customer_details": {
                "customer_id": `customer_${Date.now()}`,
                "customer_email": email,
                "customer_phone": "9999999999", // Add a valid phone number
                "customer_name": name
            },
            "order_meta": {
                "return_url": `https://flipkart-1dqd.onrender.com/order-success/{order_id}`
            }
        };

        const response = await Cashfree.PGCreateOrder("2023-08-01", request);
        res.json({
            success: true,
            payment_session_id: response.data.payment_session_id
        });

    } catch (error) {
        console.error("Cashfree Error", error);
        res.status(500).json({ success: false, message: "Payment initiation failed" });
    }
});

// --- Fallback Route ---
// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
