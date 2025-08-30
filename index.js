const express = require("express");
const crypto = require("crypto");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Webhook server is running");
});

const eventHandlers = {
    "endpoint.url_validation": (req, res) => {
        console.log("Webhook received!");
        console.log("Headers:", req.headers);
        console.log("Body:", req.body);
        const hashForValidate = crypto
            .createHmac("sha256", process.env.ZOOM_WEBHOOK_SECRET_TOKEN)
            .update(req.body.payload.plainToken)
            .digest("hex");
        response = {
            message: {
                plainToken: req.body.payload.plainToken,
                encryptedToken: hashForValidate,
            },
            status: 200,
        };

        console.log("Challenge response", response.message);
        res.status(response.status);
        res.json(response.message);
    },

    "meeting.participant_joined": (req, res) => {
        console.log("Webhook received!");
        console.log("Headers:", req.headers);
        console.log("Body:", req.body);
        response = {
            message: "Authorized request, Participants joined",
            status: 200,
        };
        res.status(response.status);
        res.json(response);
    },

    "meeting.participant_left": (req, res) => {
        console.log("Webhook received!");
        console.log("Headers:", req.headers);
        console.log("Body:", req.body);
        response = {
            message: "Authorized request, Participants left",
            status: 200,
        };
        res.status(response.status);
        res.json(response);
    },

    "meeting.created": (req, res) => {
        console.log("Webhook received!");
        console.log("Headers:", req.headers);
        console.log("Body:", req.body);
        response = {
            message: "Authorized request, meeting created",
            status: 200,
        };
        res.status(response.status);
        res.json(response);
    },
    "meeting.deleted": (req, res) => {
        console.log("Webhook received!");
        console.log("Headers:", req.headers);
        console.log("Body:", req.body);
        response = {
            message: "Authorized request, meeting deleted",
            status: 200,
        };
        res.status(response.status);
        res.json(response);
    },
    "meeting.updated": (req, res) => {
        console.log("Webhook received!");
        console.log("Headers:", req.headers);
        console.log("Body:", req.body);
        response = {
            message: "Authorized request, meeting updated",
            status: 200,
        };
        res.status(response.status);
        res.json(response);
    },
};

app.post("/webhook", (req, res) => {
    let response;

    const message = `v0:${
        req.headers["x-zm-request-timestamp"]
    }:${JSON.stringify(req.body)}`;

    const hashForVerify = crypto
        .createHmac("sha256", process.env.ZOOM_WEBHOOK_SECRET_TOKEN)
        .update(message)
        .digest("hex");

    const signature = `v0=${hashForVerify}`;
    console.log("Generated Signature", signature);

    if (req.headers["x-zm-signature"] !== signature) {
        console.log("Webhook received!, but Unauthorized request");

        // Webhook request did not come from Zoom
        response = {
            message: "Unauthorized request to webhook zoom-testing index.js",
            status: 401,
        };
        res.status(response.status);
        res.json(response);
    }

    const event = req.body.event;

    if (eventHandlers[event]) {
        // Call the handler for this event
        eventHandlers[event](req, res);
    } else {
        // Default handler for unknown events
        console.log(`Unhandled event: ${event}`);
        res.sendStatus(204); // No content
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
