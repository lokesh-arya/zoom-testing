const express = require("express");
const crypto = require("crypto");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Webhook server is running");
});

app.post("/webhook", (req, res) => {
    console.log("Webhook received!");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    
    let response;

    const message = `v0:${req.headers["x-zm-request-timestamp"]}:${JSON.stringify(req.body)}`;

    const hashForVerify = crypto.createHmac("sha256", process.env. ZOOM_WEBHOOK_SECRET_TOKEN).update(message).digest("hex");

    const signature = `v0=${hashForVerify}`;
    console.log("Generated Signature", signature);
    if (req.headers["x-zm-signature"] === signature) {
        
        // Webhook request came from Zoom
        if(req.body.event === 'endpoint.url_validation') {
            const hashForValidate = crypto.createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET_TOKEN).update(req.body.payload.plainToken).digest('hex');
            response = {
                message: {
                    plainToken: req.body.payload.plainToken,
                    encryptedToken: hashForValidate
                },
                status: 200
            };

            console.log("Challenge response", response.message)
            res.status(response.status);
            res.json(response.message)
        } else {
            response = {message: 'Authorized request to webhook zoom-testing index.js', status: 200};
            res.status(response.status);
            res.json(response);

        }
    } else {
        // Webhook request did not come from Zoom
        response = {message: 'Unauthorized request to webhook zoom-testing index.js', status: 200};
        res.status(response.status);
        res.json(response);
    }

    
});



app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
