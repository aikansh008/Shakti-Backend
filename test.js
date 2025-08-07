const axios = require('axios');

const API_KEY = 'AIzaSyASNkZsC2VbZ-v8BS8SO4vq-iH9PLiDKsI'; // replace with your key
const query = 'OpenAI';

async function checkSerpApiKey() {
  try {
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        q: query,
        api_key: API_KEY,
        engine: 'google'
      }
    });

    console.log('Success:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data.error || error.response.data);
    } else {
      console.error('Request Error:', error.message);
    }
  }
}

checkSerpApiKey();
