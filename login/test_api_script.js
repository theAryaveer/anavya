
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

async function testApi() {
    try {
        console.log(`Testing API at ${API_BASE_URL}...`);

        // Test 1: Check root/docs (simple ping)
        try {
            const rootRes = await axios.get(`${API_BASE_URL}/docs`);
            console.log('✅ /docs is reachable. Status:', rootRes.status);
        } catch (e) {
            console.error('❌ /docs failed:', e.message);
        }

        // Test 2: Search Endpoint
        try {
            const query = 'harry';
            const searchUrl = `${API_BASE_URL}/search?query=${query}&k=1`;
            console.log(`Testing Search: ${searchUrl}`);
            const searchRes = await axios.get(searchUrl);
            console.log('✅ Search Response Status:', searchRes.status);
            console.log('✅ Search Results:', JSON.stringify(searchRes.data, null, 2));

            if (searchRes.data && (Array.isArray(searchRes.data.results) || Array.isArray(searchRes.data))) {
                console.log('✅ API returned results array correctly.');
            } else {
                console.log('⚠️ API response structure might be unexpected (expected data.results array).');
            }

        } catch (e) {
            console.error('❌ Search API failed:', e.message);
            if (e.response) {
                console.error('Response data:', e.response.data);
                console.error('Response status:', e.response.status);
            }
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

testApi();
