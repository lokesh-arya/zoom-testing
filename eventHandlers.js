const crypto = require("crypto");
const eventHandlers = {
    "endpoint.url_validation": (req, res) => {
        console.log("Webhook endpoint.url_validation received!");
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
        console.log("Webhook meeting.participant_joined received!");
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
        console.log("Webhook meeting.participant_left received!");
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
        console.log("Webhook meeting.created received!");
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
        console.log("Webhook meeting.deleted received!");
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
        console.log("Webhook meeting.updated received!");
        console.log("Headers:", req.headers);
        console.log("Body:", req.body);
        response = {
            message: "Authorized request, meeting updated",
            status: 200,
        };
        res.status(response.status);
        res.json(response);
    },
    "meeting.started": (req, res) => {
        console.log("Webhook meeting.started received!");
        console.log("Headers:", req.headers);
        console.log("Body:", req.body);
        response = {
            message: "Authorized request, meeting started",
            status: 200,
        };
        res.status(response.status);
        res.json(response);
    },
    "meeting.ended": (req, res) => {
        console.log("Webhook meeting.ended received!");
        console.log("Headers:", req.headers);
        console.log("Body:", req.body);
        response = {
            message: "Authorized request, meeting ended",
            status: 200,
        };
        res.status(response.status);
        res.json(response);
    },
};

module.exports = eventHandlers;