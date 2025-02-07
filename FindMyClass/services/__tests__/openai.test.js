import axios from 'axios';
import { sendMessageToOpenAI } from '../../services/openai';

// ✅ Ensure `axios` is properly mocked
jest.mock('axios');

describe('sendMessageToOpenAI', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // ✅ Clears all mocks before each test
  });

  it('should return a valid response from OpenAI', async () => {
    const mockResponse = {
      data: {
        choices: [{ message: { content: 'Mocked API Response' } }],
      },
    };

    axios.post.mockResolvedValueOnce(mockResponse); // ✅ Use `mockResolvedValueOnce` instead of overriding `post`

    const userInput = 'Where is the Hall Building?';
    const response = await sendMessageToOpenAI(userInput);

    expect(response).toBe('Mocked API Response');
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      '/chat/completions',
      expect.objectContaining({
        model: 'gpt-3.5-turbo',
        messages: expect.arrayContaining([
          { role: 'system', content: expect.any(String) },
          { role: 'user', content: userInput },
        ]),
      })
    );
  });

  it('should handle an invalid API response structure', async () => {
    axios.post.mockResolvedValueOnce({ data: { choices: [] } });

    await expect(sendMessageToOpenAI('Hello')).rejects.toThrow(
      'Invalid response structure from OpenAI'
    );
  });

  it('should handle API errors properly', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { error: { message: 'API Key is invalid' } } },
    });

    await expect(sendMessageToOpenAI('Test')).rejects.toThrow(
      'OpenAI API Error: API Key is invalid'
    );
  });

  it('should handle general request errors', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network Error'));

    await expect(sendMessageToOpenAI('Tell me about Concordia University')).rejects.toThrow(
      'Failed to communicate with OpenAI. Please try again later.'
    );
  });
});