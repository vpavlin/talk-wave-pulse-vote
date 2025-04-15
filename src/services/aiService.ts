
import axios from 'axios';

const STORAGE_KEY = 'akash_api_key';

// Create an axios client for the Akash API
export const createAkashClient = (apiKey: string) => {
  return axios.create({
    baseURL: 'https://chatapi.akash.network/api/v1',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }
  });
};

// Save the API key to localStorage
export const saveApiKey = (apiKey: string): void => {
  localStorage.setItem(STORAGE_KEY, apiKey);
};

// Get the API key from localStorage
export const getApiKey = (): string | null => {
  return localStorage.getItem(STORAGE_KEY);
};

// Check if the API key exists
export const hasApiKey = (): boolean => {
  return !!getApiKey();
};

// Generate a talk suggestion based on existing talks and event details
export const generateTalkSuggestion = async (talks: any[], eventDetails?: any): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('API key not found. Please set your Akash API key.');
  }
  
  const client = createAkashClient(apiKey);
  
  // Sort talks by creation date (newest first) and limit to latest 10 talks
  const latestTalks = [...talks].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  }).slice(0, 10);
  
  // Create a prompt that describes the talks and asks for a suggestion
  let prompt = `
    Here are some recent conference talk submissions across various events:
    ${latestTalks.map((talk, index) => `
    Talk ${index + 1}:
    Title: ${talk.title}
    Event: ${talk.eventTitle || 'Unknown Event'}
    Description: ${talk.description || 'No description provided'}
    `).join('\n')}
    `;
    
  // Add event details if provided
  if (eventDetails) {
    prompt += `
    I'd like to submit a talk for this specific event:
    Event Title: ${eventDetails.title}
    Event Description: ${eventDetails.description || 'No description provided'}
    ${eventDetails.location ? `Location: ${eventDetails.location}` : ''}
    ${eventDetails.eventDate ? `Date: ${eventDetails.eventDate}` : ''}
    
    Based on the event details and existing submissions, suggest a new original lightning talk (5-10 minutes) 
    that would be perfect for this specific event. Include a title and a brief description. 
    Make sure the description is at least 100 and at most 200 characters!
    `;
  } else {
    prompt += `
    Based on these submissions, suggest a new original lightning talk (5-10 minutes) 
    that would complement these topics but cover something missing. 
    Include a title and a brief description. 
    Make sure the description is at least 100 and at most 200 characters!
    `;
  }
  
  prompt += `\n(note: ${Date.now()})`;

  console.log(prompt);
  
  try {
    const response = await client.post('/chat/completions', {
      model: "Meta-Llama-3-3-70B-Instruct",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    
    // Extract the AI's suggestion
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating talk suggestion:', error);
    throw error;
  }
};
