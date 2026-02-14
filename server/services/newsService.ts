import axios from 'axios';
import { newsCache } from './cacheService';

// News source configurations
const NEWS_SOURCES = {
  techcrunch: {
    name: 'TechCrunch',
    rssUrl: 'https://techcrunch.com/feed/',
    category: 'tech'
  },
  hackernews: {
    name: 'Hacker News',
    apiUrl: 'https://hacker-news.firebaseio.com/v0/topstories.json',
    itemUrl: 'https://hacker-news.firebaseio.com/v0/item/',
    category: 'tech'
  },
  reddit: {
    name: 'Reddit',
    apiUrl: 'https://www.reddit.com/r/programming+webdev+computerscience+cs_careers+jobs.json',
    category: 'mixed'
  }
};

// RSS Parser for XML feeds
function parseRSSFeed(xmlData: string, source: string) {
  const items: any[] = [];
  
  try {
    // Simple regex-based XML parsing (in production, use a proper XML parser)
    const itemMatches = xmlData.match(/<item>([\s\S]*?)<\/item>/g) || [];
    
    itemMatches.forEach(itemXml => {
      const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || itemXml.match(/<title>(.*?)<\/title>/);
      const linkMatch = itemXml.match(/<link>(.*?)<\/link>/);
      const descMatch = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || itemXml.match(/<description>(.*?)<\/description>/);
      const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);
      
      if (titleMatch && linkMatch) {
        items.push({
          title: titleMatch[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1') || titleMatch[1],
          url: linkMatch[1],
          summary: descMatch ? descMatch[1]?.replace(/<[^>]*>/g, '').substring(0, 300) + '...' : '',
          publishedAt: pubDateMatch ? pubDateMatch[1] : new Date().toISOString(),
          source: source,
          category: 'tech'
        });
      }
    });
  } catch (error) {
    console.error(`Error parsing RSS feed from ${source}:`, error);
  }
  
  return items;
}

// Fetch from Hacker News
async function fetchHackerNews() {
  try {
    const storyIdsResponse = await axios.get(NEWS_SOURCES.hackernews.apiUrl);
    const storyIds = storyIdsResponse.data.slice(0, 20); // Get top 20 stories
    
    const stories = await Promise.all(
      storyIds.map(async (id: string) => {
        try {
          const storyResponse = await axios.get(`${NEWS_SOURCES.hackernews.itemUrl}${id}.json`);
          const story = storyResponse.data;
          
          if (story && story.title && story.url) {
            return {
              id: `hn_${id}`,
              title: story.title,
              url: story.url,
              summary: story.text ? story.text.replace(/<[^>]*>/g, '').substring(0, 300) + '...' : '',
              publishedAt: new Date(story.time * 1000).toISOString(),
              source: 'Hacker News',
              category: categorizeHNStory(story.title),
              tags: extractTagsFromTitle(story.title)
            };
          }
        } catch (error) {
          console.error(`Error fetching HN story ${id}:`, error);
        }
        return null;
      })
    );
    
    return stories.filter(Boolean);
  } catch (error) {
    console.error('Error fetching Hacker News:', error);
    return [];
  }
}

// Fetch from Reddit
async function fetchRedditTech() {
  try {
    const response = await axios.get(NEWS_SOURCES.reddit.apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
      }
    });
    
    const posts = response.data.data.children.map((post: any) => {
      const data = post.data;
      return {
        id: `reddit_${data.id}`,
        title: data.title,
        url: `https://reddit.com${data.permalink}`,
        summary: data.selftext ? data.selftext.substring(0, 300) + '...' : '',
        publishedAt: new Date(data.created_utc * 1000).toISOString(),
        source: 'Reddit',
        category: categorizeRedditPost(data.subreddit),
        tags: extractTagsFromTitle(data.title),
        score: data.score
      };
    });
    
    return posts;
  } catch (error) {
    console.error('Error fetching Reddit:', error);
    return [];
  }
}

// Categorize Hacker News stories
function categorizeHNStory(title: string): string {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('hiring') || lowerTitle.includes('job') || lowerTitle.includes('career')) {
    return 'hiring';
  }
  if (lowerTitle.includes('layoff') || lowerTitle.includes('fired') || lowerTitle.includes('cuts')) {
    return 'layoffs';
  }
  if (lowerTitle.includes('internship') || lowerTitle.includes('intern')) {
    return 'internships';
  }
  if (lowerTitle.includes('launch') || lowerTitle.includes('release') || lowerTitle.includes('project')) {
    return 'projects';
  }
  
  return 'tech';
}

// Categorize Reddit posts
function categorizeRedditPost(subreddit: string): string {
  if (['cs_careers', 'jobs'].includes(subreddit)) return 'hiring';
  if (subreddit === 'programming' || subreddit === 'webdev') return 'tech';
  if (subreddit === 'computerscience') return 'projects';
  return 'tech';
}

// Extract tags from title
function extractTagsFromTitle(title: string): string[] {
  const techKeywords = [
    'ai', 'ml', 'machine learning', 'artificial intelligence',
    'react', 'vue', 'angular', 'javascript', 'typescript',
    'python', 'java', 'go', 'rust', 'c++', 'c#',
    'aws', 'azure', 'gcp', 'cloud', 'kubernetes', 'docker',
    'blockchain', 'web3', 'crypto', 'nft',
    'startup', 'saas', 'api', 'database', 'microservices'
  ];
  
  const lowerTitle = title.toLowerCase();
  const tags: string[] = [];
  
  techKeywords.forEach(keyword => {
    if (lowerTitle.includes(keyword)) {
      tags.push(keyword);
    }
  });
  
  // Extract company names (simplified)
  const companies = ['google', 'microsoft', 'apple', 'amazon', 'meta', 'facebook', 'tesla', 'netflix'];
  companies.forEach(company => {
    if (lowerTitle.includes(company)) {
      tags.push(company.charAt(0).toUpperCase() + company.slice(1));
    }
  });
  
  return tags.slice(0, 5); // Limit to 5 tags
}

// Main news fetching function
export async function fetchTechNews(): Promise<any[]> {
  try {
    // Check cache first
    const cacheKey = 'tech_news_latest';
    const cachedNews = newsCache.get<any[]>(cacheKey);
    if (cachedNews) {
      console.log('Returning cached news data');
      return cachedNews;
    }

    const [hnStories, redditPosts] = await Promise.all([
      fetchHackerNews(),
      fetchRedditTech()
    ]);
    
    // Combine and sort by date
    const allNews = [...hnStories, ...redditPosts];
    
    // Filter for tech-related content only
    const techNews = allNews.filter(item => {
      const title = item.title.toLowerCase();
      const hasTechKeywords = [
        'programming', 'software', 'development', 'code', 'api', 'database',
        'ai', 'machine learning', 'tech', 'startup', 'app', 'web',
        'javascript', 'python', 'java', 'cloud', 'devops'
      ].some(keyword => title.includes(keyword));
      
      return hasTechKeywords || item.category !== 'tech';
    });
    
    // Sort by publication date
    techNews.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    
    const result = techNews.slice(0, 50); // Return latest 50 items
    
    // Cache the result for 5 minutes
    newsCache.set(cacheKey, result, 5 * 60 * 1000);
    
    return result;
  } catch (error) {
    console.error('Error fetching tech news:', error);
    return [];
  }
}

// AI-powered news summarization
export async function summarizeNewsContent(content: string, groqClient: any) {
  try {
    const systemPrompt = `You are an AI news summarization expert. Your task is to:
1. Summarize the given news article into 3-5 concise sentences
2. Extract key information: company names, tech stack, roles, locations
3. Focus on tech-related content only
4. Remove irrelevant information
5. Highlight the impact on the tech industry
6. Return in JSON format with: summary, keyPoints, techStack, impact

Respond only with valid JSON, no additional text.`;

    const completion = await groqClient.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Summarize this news article: ${content}` }
      ],
      max_tokens: 400,
      temperature: 0.3,
    });

    const aiResponse = completion.choices[0]?.message?.content || '{}';
    
    try {
      return JSON.parse(aiResponse);
    } catch (parseError) {
      return {
        summary: aiResponse,
        keyPoints: [],
        techStack: [],
        impact: "Unable to extract structured information"
      };
    }
  } catch (error) {
    console.error('Error summarizing news:', error);
    return {
      summary: content.substring(0, 300) + '...',
      keyPoints: [],
      techStack: [],
      impact: "Summarization failed"
    };
  }
}
