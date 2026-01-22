export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        const { name, email, message, botcheck } = req.body;

        // Basic validation
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Spam check (honeypot)
        if (botcheck) {
            return res.status(400).json({ success: false, message: 'Bot detected' });
        }

        // Prepare payload for Web3Forms
        const payload = {
            access_key: process.env.WEB3FORMS_ACCESS_KEY,
            subject: `New Submission from Portfolio - ${name}`,
            name,
            email,
            message,
        };

        // Send to Web3Forms
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            return res.status(200).json({ success: true, message: 'Message sent successfully' });
        } else {
            console.error('Web3Forms Error:', data);
            return res.status(500).json({ success: false, message: 'Failed to send message via Web3Forms' });
        }

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
