const fetch = require('node-fetch');

const testRecommendations = async () => {
    try {
        console.log('Testing recommendations endpoint...');
        
        const requestBody = {
            sport: 'ski',
            category: 'snowboards',
            formData: {
                experience: 'beginner',
                height: '5ft 8in',
                weight: '150lbs',
                preferredStyle: 'all-mountain'
            }
        };
        
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch('http://localhost:3001/api/recommendations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers.raw());
        
        const responseText = await response.text();
        console.log('Response body:', responseText);
        
        if (response.ok) {
            try {
                const data = JSON.parse(responseText);
                console.log('Parsed response:', JSON.stringify(data, null, 2));
            } catch (e) {
                console.error('Failed to parse JSON:', e.message);
            }
        } else {
            console.error('Request failed with status:', response.status);
        }
        
    } catch (error) {
        console.error('Test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
};

testRecommendations();
