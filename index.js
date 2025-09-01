const express = require("express");
const session = require('express-session');
const crypto = require("crypto");
const axios = require('axios');
const path = require('path');

const eventHandlers = require('./eventHandlers')

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false, // safer to keep this false
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

const users = [
  { email: 'admin@example.com', name: 'admin', password: 'admin123', role: 'admin' },
  { email: 'user1@example.com', name: 'user1', password: 'user123', role: 'member' },
  { email: 'user2@example.com', name: 'user2', password: 'user123', role: 'member' }
];

let meetings = [];

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// 👉 Handle login POST
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Simple validation
  if (!email || !password) {
    return res.status(400).send('Missing email or password. <a href="/">Try again</a>');
  }

  // Check user
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).send('Invalid credentials. <a href="/">Try again</a>');
  }

  // Set session and redirect
  req.session.user = {
    email: user.email,
    name: user.name,
    role: user.role
  };

  res.redirect('/dashboard');
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.redirect('/');
  }

  const file = user.role === 'admin'
    ? 'dashboard-admin.html'
    : 'dashboard-member.html';

  res.sendFile(path.join(__dirname, 'views', file));
});

// Create Zoom meeting (admin only)
app.post('/create-meeting', async (req, res) => {
  const user = req.session.user;

  // Check if user is logged in and is an admin
  if (!user || user.role !== 'admin') {
    return res.status(403).send('🚫 Forbidden: Admins only');
  }

  const { topic, start_time, duration } = req.body;

  // Basic input validation
  if (!topic || !start_time || !duration) {
    return res.status(400).send('❌ Missing required fields');
  }

  try {
    // 🔐 Get access token using OAuth with account credentials grant
    const tokenRes = await axios.post(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
      null,
      {
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64'),
          'Content-Type': 'application/json'
        }
      }
    );
    
    const accessToken = tokenRes.data.access_token;
const options = {
  method: 'POST',
  url: 'https://api.zoom.us/v2/users/me/meetings',
  headers: {'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}`},
  data: {
    agenda: 'My Meeting agenda',
    duration: 40,
    pre_schedule: true,
    schedule_for: 'me',
    settings: {
      encryption_type: 'enhanced_encryption',
      meeting_authentication: true,
      mute_upon_entry: false,
      participant_video: false,
      waiting_room: true
    },
    start_time: start_time,
    timezone: 'Asia/Calcutta',
    topic: 'My Meeting testing okay',
    type: 2
  }
};

  const { data } = await axios.request(options);
  console.log(data);
    
    // 💾 Store meeting locally (or save to DB)
    meetings.push({
      topic,
      start_time,
      join_url: meetingRes.data.join_url
    });

    // ✅ Redirect to dashboard
    res.redirect('/dashboard');
  } catch (err) {
    console.error('❗ Zoom API Error:', err.response?.data || err.message);
    res.status(500).send('Error creating meeting. Please check logs.');
  }
});


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
