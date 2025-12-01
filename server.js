
import express from 'express';
import cors from 'cors';
import { Cashfree } from 'cashfree-pg';

const app = express();

app.use(cors());
app.use(express.json());

// Initialize Cashfree
Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID || "114321026a5f66183345bd82ee50123411";
Cashfree.XClientSecret = process.env.CASHFREE_CLIENT_SECRET || "cfsk_ma_prod_4fed9c52cb45cf5972e9a3b11e7bacde_d081651e";
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION; // Or Cashfree.Environment.SANDBOX

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
                "return_url": `https://4-28b7a.web.app/order-success/{order_id}`
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
