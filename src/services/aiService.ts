
import axios from 'axios';
import { fetchEvents } from './eventService';

const STORAGE_KEY = 'akash_api_key';
const USER_INFO_KEY = 'user_profile_info';

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

// Save user profile information to localStorage
export const saveUserInfo = (name: string, bio: string): void => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify({ name, bio }));
};

// Get user profile information from localStorage
export const getUserInfo = (): { name: string, bio: string } => {
  const defaultInfo = { name: '', bio: '' };
  try {
    const savedInfo = localStorage.getItem(USER_INFO_KEY);
    return savedInfo ? JSON.parse(savedInfo) : defaultInfo;
  } catch (error) {
    console.error('Error parsing user info from localStorage:', error);
    return defaultInfo;
  }
};

// Generate a talk suggestion based on existing talks and event details
export const generateTalkSuggestion = async (talks: any[], eventDetails?: any, userProfile?: {name?: string, bio?: string}): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('API key not found. Please set your Akash API key.');
  }
  
  const client = createAkashClient(apiKey);
  
  let latestTalks = [...talks];
  
  // If current event has no talks, fetch talks from all events
  if (talks.length === 0) {
    console.log("Current event has no talks, fetching talks from all events");
    try {
      const allEvents = await fetchEvents();
      const allTalks = allEvents.flatMap(event => event.talks);
      latestTalks = allTalks;
    } catch (error) {
      console.error("Error fetching talks from all events:", error);
      // Continue with empty talks array if fetching fails
    }
  }
  
  // Sort talks by creation date (newest first) and limit to latest 10 talks
  latestTalks = latestTalks.sort((a, b) => {
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
    
  // Add user profile information if provided
  if (userProfile && (userProfile.name || userProfile.bio)) {
    prompt += `
    I'm creating a talk submission with the following personal information:
    ${userProfile.name ? `Name: ${userProfile.name}` : ''}
    ${userProfile.bio ? `Bio/Experience: ${userProfile.bio}` : ''}
    
    Please suggest a talk that would suit my background and expertise.
    `;
  }
    
  // Add event details if provided
  if (eventDetails) {
    prompt += `
    I'd like to submit a talk for this specific event:
    Event Title: ${eventDetails.title}
    Event Description: ${eventDetails.description || 'No description provided'}
    ${eventDetails.location ? `Location: ${eventDetails.location}` : ''}
    ${eventDetails.eventDate ? `Date: ${eventDetails.eventDate}` : ''}
    
    Based on the event details${userProfile?.bio ? ', my background,' : ''} and existing submissions, suggest a new original lightning talk (5-10 minutes) 
    that would be perfect for this specific event.
    
    IMPORTANT: Follow this exact format in your response:
    Title: [A clear, concise title without any special characters or formatting]
    Description: [A concise description between 100-200 characters]
    
    Make sure your title is plain text without any markdown, hashtags, quotes, or formatting.
    The title should be short (5-10 words) and the description should be between 100-180 characters.
    `;
  } else {
    prompt += `
    Based on these submissions${userProfile?.bio ? ' and my background' : ''}, suggest a new original lightning talk (5-10 minutes) 
    that would complement these topics but cover something missing.
    
    IMPORTANT: Follow this exact format in your response:
    Title: [A clear, concise title without any special characters or formatting]
    Description: [A concise description between 100-200 characters]
    
    Make sure your title is plain text without any markdown, hashtags, quotes, or formatting.
    The title should be short (5-10 words) and the description should be between 100-200 characters.
    `;
  }
  
  prompt += `\n(note: ${Date.now() + Math.random()})`;

  console.log(prompt);
  
  try {
    const response = await client.post('/chat/completions', {
      model: "Meta-Llama-4-Maverick-17B-128E-Instruct",
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
