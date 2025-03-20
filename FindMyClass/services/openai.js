// services/openai.js
import axios from 'axios';
import { openaiAPIKey } from '../app/secrets';

if (!openaiAPIKey) {
  throw new Error('OpenAI API key is missing. Ensure it is defined in your environment variables.');
}

// Create Axios instance
const api = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    Authorization: `Bearer ${openaiAPIKey}`,
    'Content-Type': 'application/json',
  },
});

// A new function that expects an array of messages (system, user, assistant)
export const sendConversationToOpenAI = async (conversation) => {
  try {
    const response = await api.post('/chat/completions', {
      model: 'gpt-3.5-turbo',
      temperature: 0.2,
      messages: conversation, 
    });

    const botMessage = response.data?.choices?.[0]?.message?.content;
    if (!botMessage) {
      throw new Error('Invalid response structure from OpenAI');
    }

    return botMessage;
  } catch (error) {
    if (error.response) {
      console.error('OpenAI API Error:', error.response.data);
      throw new Error(`OpenAI API Error: ${error.response.data.error?.message || 'Unknown API error'}`);
    }
    console.error('Error communicating with OpenAI:', error);
    throw new Error('Failed to communicate with OpenAI. Please try again later.');
  }
};