const CLIENT_ID = 'YOUR_TWITCH_CLIENT_ID'; // Replace with your Client ID
const REDIRECT_URI = 'https://your-username.github.io/callback'; // Your redirect URI (e.g., for GitHub Pages)
const OAUTH_URL = 'https://id.twitch.tv/oauth2/authorize';
const API_BASE_URL = 'https://api.twitch.tv/helix/';

// Function to initiate the login process (OAuth)
function loginWithTwitch() {
    const authUrl = `${OAUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=user:read:follows`;
    window.location.href = authUrl;  // Redirect to Twitch for login
}

// Function to parse the URL and get the access token
function getAccessTokenFromUrl() {
    const params = new URLSearchParams(window.location.hash.replace('#', '?'));
    const accessToken = params.get('access_token');
    return accessToken;
}

// Function to fetch the user ID and followed channels once logged in
async function fetchChannelPoints() {
    const accessToken = getAccessTokenFromUrl();
    
    if (!accessToken) {
        alert('Error: Missing access token.');
        return;
    }

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Client-Id': CLIENT_ID
    };

    try {
        // Step 1: Get the user's ID
        const userResponse = await fetch(`${API_BASE_URL}users`, { headers });
        const userData = await userResponse.json();
        const userId = userData.data[0].id;

        // Step 2: Get the channels the user is following
        const followsResponse = await fetch(`${API_BASE_URL}users/follows?from_id=${userId}`, { headers });
        const followsData = await followsResponse.json();
        
        const tableBody = document.getElementById('pointsTable').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = '';  // Clear any existing rows

        // Step 3: Display the followed channels (mock points for now)
        followsData.data.forEach((channel) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${channel.to_name}</td>
                <td>Loading...</td>  <!-- Mocked points -->
            `;
            tableBody.appendChild(row);

            // Simulate channel points
            row.cells[1].textContent = Math.floor(Math.random() * 10000);  // Replace with actual points if possible
        });

    } catch (error) {
        console.error('Error fetching data:', error);
        alert('An error occurred while fetching data. Please try again later.');
    }
}

// Check if there's an access token in the URL and fetch data
if (window.location.hash.includes('access_token')) {
    fetchChannelPoints();
}
