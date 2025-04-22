import { NextResponse } from 'next/server';

// Load Gemini API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Mock responses as fallback
const mockResponses: Record<string, string> = {
  default: "I'm CodeCat's AI assistant. I can help you find projects, explain concepts, or offer coding advice. What would you like to know about?",
  
  ecommerce: "We have several e-commerce projects available:\n\n1. **Full-stack E-commerce Platform** - A complete solution with product catalog, cart, and payment processing\n2. **Admin Dashboard** - For managing products, orders, and customer data\n3. **Mobile E-commerce App** - Built with React Native\n\nWould you like more details about any of these?",
  
  authentication: "For authentication, we recommend these approaches:\n\n1. **JWT Authentication** - Stateless authentication using JSON Web Tokens\n2. **OAuth Integration** - Connect with Google, Facebook, or other providers\n3. **Clerk Authentication** - Our platform uses Clerk for a complete auth solution\n\nThe easiest way to get started is with our authentication starter template.",
  
  beginner: "Great beginner project ideas include:\n\n1. **Todo Application** - Learn state management and basic CRUD\n2. **Weather App** - Practice working with APIs\n3. **Portfolio Website** - Showcase your skills with HTML/CSS\n4. **Quiz App** - Implement basic logic and user interaction\n\nCheck our 'web' category for starter templates!",
  
  trends: "Current web development trends include:\n\n1. **AI Integration** - Like what you're experiencing now\n2. **Server Components** - As seen in Next.js 14\n3. **Edge Computing** - Faster, distributed processing\n4. **TypeScript Adoption** - For type safety\n5. **Micro-frontends** - For scalable architecture\n\nOur latest projects incorporate many of these technologies.",
  
  machine: "Machine learning fundamentals:\n\n1. **Supervised Learning** - Training with labeled data\n2. **Unsupervised Learning** - Finding patterns in unlabeled data\n3. **Neural Networks** - The foundation of deep learning\n4. **Data Preprocessing** - Critical for model accuracy\n\nWe have projects that demonstrate these concepts in the 'AI' and 'ML' categories."
};

function findBestMatch(query: string): string {
  query = query.toLowerCase();
  
  if (query.includes('e-commerce') || query.includes('ecommerce') || query.includes('shop') || query.includes('store')) {
    return mockResponses.ecommerce;
  }
  
  if (query.includes('auth') || query.includes('login') || query.includes('signup') || query.includes('sign in')) {
    return mockResponses.authentication;
  }
  
  if (query.includes('beginner') || query.includes('start') || query.includes('new') || query.includes('ideas')) {
    return mockResponses.beginner;
  }
  
  if (query.includes('trend') || query.includes('latest') || query.includes('modern') || query.includes('new')) {
    return mockResponses.trends;
  }
  
  if (query.includes('machine') || query.includes('ml') || query.includes('ai') || query.includes('learn')) {
    return mockResponses.machine;
  }
  
  return `I searched for information about "${query}" and found these possibilities:\n\n1. Check our project categories for related work\n2. Try using more specific keywords\n3. Browse our explore page for inspiration\n\nIs there something specific about this topic you'd like to know?`;
}

async function queryGeminiAPI(query: string) {
  try {
    // Check if API key is available
    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found in environment variables');
      throw new Error('Gemini API key not configured');
    }

    // Prepare system prompt to contextualize the assistant
    const systemContext = `
You are CodeCat's AI assistant, designed to help users find projects, understand coding concepts, and provide guidance on technical topics.

About CodeCat:
- A platform for discovering and sharing coding projects and templates
- Has categories like web applications, AI, machine learning, automation, PHP, HTML, mobile apps
- Projects can be free or paid (prices in INR)
- Users can search, filter, and browse projects

When responding:
- Be friendly, helpful, and concise
- Recommend project categories when relevant
- For technical questions, give clear explanations
- Use markdown formatting for better readability
- If you don't know something specific about CodeCat, be honest and give general advice
    `;

    // Build the full prompt with user query
    const fullPrompt = `${systemContext}\n\nUser question: ${query}`;

    // Call the Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    const data = await response.json();
    
    // Extract the text from the response
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Unexpected response structure from Gemini API');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Fall back to the mock responses
    return findBestMatch(query);
  }
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Try to use the Gemini API first
    try {
      const result = await queryGeminiAPI(query);
      return NextResponse.json({ result });
    } catch (error) {
      console.error('Gemini API error, falling back to mock responses:', error);
      // Fall back to mock responses if the API call fails
      const fallbackResult = findBestMatch(query);
      return NextResponse.json({ 
        result: fallbackResult,
        usedFallback: true
      });
    }
  } catch (error) {
    console.error('AI search error:', error);
    return NextResponse.json(
      { error: 'Failed to process search query' },
      { status: 500 }
    );
  }
} 