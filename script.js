// server.js (Backend for OAuth Authentication with Twitch)

const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// OAuth redirect URL
const OAUTH_URL = 'https://id.twitch.tv/oauth2/authorize';
const TOKEN_URL = 'https://id.twitch.tv/oauth2/token';

// Frontend route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// OAuth login route
app.get('/auth/login', (req, res) => {
    const authUrl = `${OAUTH_URL}?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=user:read:follows`;
    res.redirect(authUrl);
});

// OAuth callback route (Twitch will redirect here after user login)
app.get('/auth/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.send('Error: No code received.');
    }

    // Exchange the authorization code for an access token
    try {
        const tokenResponse = await axios.post(TOKEN_URL, null, {
            params: {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.REDIRECT_URI
            }
        });

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        // Store the token in the session or a database
        req.session.token = access_token;
        
        res.redirect(`/dashboard?access_token=${access_token}`);
    } catch (error) {
        console.error('Error during token exchange:', error);
        res.send('Error during OAuth process.');
    }
});

// Dashboard route to view channel points
app.get('/dashboard', async (req, res) => {
    const { access_token } = req.query;

    if (!access_token) {
        return res.redirect('/');
    }

    try {
        // Fetch user details (using the access token)
        const userResponse = await axios.get('https://api.twitch.tv/helix/users', {
            headers: {
                Authorization: `Bearer ${access_token}`,
                'Client-Id': process.env.CLIENT_ID
            }
        });

        const userData = userResponse.data;
        const userId = userData.data[0].id;

        // Fetch followed channels (again, using the access token)
        const followsResponse = await axios.get(`https://api.twitch.tv/helix/users/follows?from_id=${userId}`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
                'Client-Id': process.env.CLIENT_ID
            }
        });

        const followsData = followsResponse.data;
        res.json(followsData.data);  // Return followed channels as JSON
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.send('Error fetching user data.');
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
