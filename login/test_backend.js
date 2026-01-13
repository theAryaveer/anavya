const axios = require('axios');

const API_BASE_URL = 'http://127.0.0.1:8000';

async function testBackend() {
    console.log('Testing FastAPI Backend...\n');

    // Test 1: Health check
    try {
        const health = await axios.get(`${API_BASE_URL}/`);
        console.log('✓ Health check:', health.data);
    } catch (error) {
        console.error('✗ Health check failed:', error.message);
    }

    // Test 2: Search endpoint
    try {
        const search = await axios.get(`${API_BASE_URL}/search`, {
            params: { query: 'Harry', k: 2 }
        });
        console.log('\n✓ Search endpoint response:');
        console.log('Query:', search.data.query);
        console.log('Number of results:', search.data.results?.length || 0);
        if (search.data.results && search.data.results.length > 0) {
            console.log('First result:', JSON.stringify(search.data.results[0], null, 2));
        }
    } catch (error) {
        console.error('✗ Search failed:', error.response?.data || error.message);
    }

    // Test 3: Recommendation endpoint
    try {
        const rec = await axios.get(`${API_BASE_URL}/recommend/123`);
        console.log('\n✓ Recommendation endpoint response:');
        console.log('User ID:', rec.data.user_id);
        console.log('Number of recommendations:', rec.data.recommendations?.length || 0);
        if (rec.data.recommendations && rec.data.recommendations.length > 0) {
            console.log('First recommendation:', JSON.stringify(rec.data.recommendations[0], null, 2));
        }
    } catch (error) {
        console.error('\n✗ Recommendations failed:', error.response?.data || error.message);
    }
}

testBackend();
