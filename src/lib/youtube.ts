import { callOpenAI } from './openai';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

const REPUTABLE_CHANNELS = [
  'UCxN2D1TyyxHyrD3E3GZVkfA', // AKC
  'UCLRDaR2ywG1APiwUzeTwkVw', // McCann Dog Training
  'UCJDSJjuNQ_NwxmHEGGADVmw', // Zak George's Dog Training
  'UC1J0quSEcaJnhy2yh_hwqOg', // Fenrir Canine Training
  'UCkHxvnvvqcKMIJuFqfNXVlA', // Kikopup
  'UC5QKWz_TeDqfxk8RxmZrYrA', // Simpawtico Dog Training
];

export const searchBreedVideos = async (breedName: string) => {
  try {
    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: `${breedName} dog breed guide training`,
      type: 'video',
      maxResults: '50',
      key: YOUTUBE_API_KEY,
      relevanceLanguage: 'en',
      videoDuration: 'medium',
      videoType: 'any'
    });

    const response = await fetch(`${YOUTUBE_API_BASE}/search?${searchParams}`);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter for reputable channels and educational content
    return data.items.filter((video: any) => {
      const isReputableChannel = REPUTABLE_CHANNELS.includes(video.snippet.channelId);
      const title = video.snippet.title.toLowerCase();
      const description = video.snippet.description.toLowerCase();
      
      // Check for educational keywords
      const isEducational = [
        'guide', 'training', 'tips', 'how to', 'breed information',
        'care', 'grooming', 'behavior', 'health', 'exercise'
      ].some(keyword => 
        title.includes(keyword) || description.includes(keyword)
      );

      return isReputableChannel || isEducational;
    });
  } catch (err) {
    console.error('Error searching YouTube:', err);
    throw err;
  }
};

export const getVideoDetails = async (videoId: string) => {
  try {
    const detailsParams = new URLSearchParams({
      part: 'contentDetails,statistics',
      id: videoId,
      key: YOUTUBE_API_KEY
    });

    const response = await fetch(`${YOUTUBE_API_BASE}/videos?${detailsParams}`);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    const video = data.items[0];

    return {
      duration: video.contentDetails.duration,
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount
    };
  } catch (err) {
    console.error('Error fetching video details:', err);
    throw err;
  }
};

export const determineVideoCategory = async (title: string, description: string): Promise<string> => {
  try {
    const prompt = `
      Analyze this dog video title and description and categorize it into one of these categories:
      - training (for training and behavior content)
      - grooming (for grooming and care tutorials)
      - health (for health and medical information)
      - behavior (for behavior analysis and tips)
      - lifestyle (for daily life and activities)
      - nutrition (for diet and feeding content)
      - exercise (for exercise and activity guides)
      - puppy-care (for puppy-specific content)

      Title: ${title}
      Description: ${description}

      Return ONLY the category name, nothing else.
    `;

    const response = await callOpenAI([
      {
        role: 'system',
        content: 'You are a dog video content analyzer. Respond only with the exact category name that best matches the content.'
      },
      {
        role: 'user',
        content: prompt
      }
    ], {
      temperature: 0.3,
      max_tokens: 10
    });

    const category = response.choices[0].message.content.trim().toLowerCase();
    
    // Validate category
    const validCategories = [
      'training', 'grooming', 'health', 'behavior',
      'lifestyle', 'nutrition', 'exercise', 'puppy-care'
    ];

    return validCategories.includes(category) ? category : 'training';
  } catch (err) {
    console.error('Error determining video category:', err);
    return 'training';
  }
};