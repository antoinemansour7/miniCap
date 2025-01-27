import axios from 'axios';
import Constants from 'expo-constants';

// Retrieve the OpenAI API key from Expo constants
const OPENAI_API_KEY = Constants.expoConfig?.extra?.OPENAI_API_KEY;

// Validate API key existence
if (!OPENAI_API_KEY) {
  throw new Error('OpenAI API key is missing. Ensure it is defined in your environment variables.');
}

// Axios instance configuration
const api = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    Authorization: `Bearer ${OPENAI_API_KEY}`, // Fixed string interpolation for Bearer token
    'Content-Type': 'application/json',
  },
});

// System message content for the chatbot
const systemMessage = `
You are a Campus Guide Assistant for Concordia University. Your role is to:
- Help users access their class schedules.
- Provide Google Maps directions to their next class.
- Answer questions about the SGW and Loyola campuses, including building details and facilities.
- Provide special navigation assistance for students with disabilities, including elevator and washroom locations.
`;

// Function to send user input to OpenAI and get the response
export const sendMessageToOpenAI = async (userInput) => {
  try {
    const response = await api.post('/chat/completions', {
      model: 'gpt-3.5-turbo',
      temperature: 0.7, // Optional: Adjust response creativity
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userInput },
      ],
    });

    // Validate response structure
    const botMessage = response.data?.choices?.[0]?.message?.content;
    if (!botMessage) {
      throw new Error('Invalid response structure from OpenAI');
    }

    return botMessage;
  } catch (error) {
    // Handle API-specific errors
    if (error.response) {
      console.error('OpenAI API Error:', error.response.data);
      throw new Error(`OpenAI API Error: ${error.response.data.error?.message || 'Unknown API error'}`);
    }
    // Handle general errors
    console.error('Error communicating with OpenAI:', error);
    throw new Error('Failed to communicate with OpenAI. Please try again later.');
  }
};