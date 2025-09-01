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

module.exports = eventHandlers;