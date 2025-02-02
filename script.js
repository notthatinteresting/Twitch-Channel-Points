// Function to fetch channel points for the logged-in user
async function fetchChannelPoints() {
    const authToken = document.getElementById('authToken').value;

    if (!authToken) {
        alert("Please enter your Twitch Auth Token.");
        return;
    }

    // Set up the headers for the request
    const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Client-Id': 'jlj5h3ie7t4q1p6oxft1asrum1jl55' // Replace this with your actual Twitch Client ID
    };

    try {
        // Step 1: Get the user ID
        const userResponse = await fetch('https://api.twitch.tv/helix/users', { headers });
        const userData = await userResponse.json();
        
        if (userData.data && userData.data[0]) {
            const userId = userData.data[0].id;
            console.log('User ID:', userId);

            // Step 2: Get the list of channels the user follows
            const followsResponse = await fetch(`https://api.twitch.tv/helix/users/follows?from_id=${userId}`, { headers });
            const followsData = await followsResponse.json();
            const channels = followsData.data;

            // Clear the previous data in the table
            const tableBody = document.getElementById('pointsTable').getElementsByTagName('tbody')[0];
            tableBody.innerHTML = '';

            // Step 3: Populate the table with the channels and mock points
            for (const channel of channels) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${channel.to_name}</td>
                    <td>Loading...</td> <!-- Placeholder for channel points -->
                `;
                tableBody.appendChild(row);

                // Get channel points (you may need a workaround here since Twitch doesn't expose direct points)
                await getChannelPoints(channel.to_id, row);
            }

        } else {
            alert('Error fetching user data. Please check your OAuth token.');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('An error occurred while fetching data. Please try again later.');
    }
}

// Function to get the channel points for a specific channel (hypothetical)
async function getChannelPoints(channelId, row) {
    // For demonstration, we'll mock the points. You will need to get the actual points data.
    const mockPoints = Math.floor(Math.random() * 10000); // Simulate channel points

    // Update the row with the mock points
    row.cells[1].textContent = mockPoints;
}
