import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

interface VideoAnalysis {
  score: number;
  retentionPotential: number;
  revenuePotential: number;
  viralPotential: number;
  reasons: string[];
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedTags: string[];
}

interface VideoMetadata {
  title: string[];
  description: string[];
  hashtags: string[][];
}

export class AIService {
  private openai?: OpenAI;
  private anthropic?: Anthropic;
  private provider: 'openai' | 'anthropic';

  constructor(config: { openAIKey?: string; anthropicKey?: string }) {
    if (config.openAIKey) {
      this.openai = new OpenAI({ apiKey: config.openAIKey, dangerouslyAllowBrowser: true });
      this.provider = 'openai';
    } else if (config.anthropicKey) {
      this.anthropic = new Anthropic({ apiKey: config.anthropicKey, dangerouslyAllowBrowser: true });
      this.provider = 'anthropic';
    } else {
      throw new Error('At least one AI provider API key is required');
    }
  }

  async analyzeVideo(videoData: {
    title: string;
    description: string;
    viewCount: number;
    likeCount: number;
    duration: number;
  }): Promise<VideoAnalysis> {
    try {
      const prompt = `Analyze this video for viral potential and provide a detailed assessment:

Title: ${videoData.title}
Description: ${videoData.description}
View Count: ${videoData.viewCount}
Like Count: ${videoData.likeCount}
Duration: ${videoData.duration} seconds

Provide a JSON response with:
- score (0-100): Overall viral potential
- retentionPotential (0-100): How likely viewers will watch to completion
- revenuePotential (0-100): Monetization potential
- viralPotential (0-100): Likelihood to be shared
- reasons: Array of 3-5 key reasons for the scores
- suggestedTitle: Optimized title for maximum engagement
- suggestedDescription: Optimized description
- suggestedTags: Array of 5-10 relevant tags

Respond ONLY with valid JSON, no markdown or other formatting.`;

      let responseText: string;

      if (this.provider === 'openai' && this.openai) {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a viral content analyst. Respond only with valid JSON.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7
        });
        responseText = response.choices[0].message.content || '{}';
      } else if (this.provider === 'anthropic' && this.anthropic) {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [
            { role: 'user', content: prompt }
          ]
        });
        const content = response.content[0];
        responseText = content.type === 'text' ? content.text : '{}';
      } else {
        throw new Error('No AI provider configured');
      }

      const analysis = JSON.parse(responseText);
      return {
        score: analysis.score || 50,
        retentionPotential: analysis.retentionPotential || 50,
        revenuePotential: analysis.revenuePotential || 50,
        viralPotential: analysis.viralPotential || 50,
        reasons: analysis.reasons || ['Analysis completed'],
        suggestedTitle: analysis.suggestedTitle || videoData.title,
        suggestedDescription: analysis.suggestedDescription || videoData.description,
        suggestedTags: analysis.suggestedTags || ['video']
      };
    } catch (error) {
      console.error('Error analyzing video:', error);
      return {
        score: 50,
        retentionPotential: 50,
        revenuePotential: 50,
        viralPotential: 50,
        reasons: ['Analysis failed - using default scores'],
        suggestedTitle: videoData.title,
        suggestedDescription: videoData.description,
        suggestedTags: ['shorts', 'viral']
      };
    }
  }

  async generateMetadataVariants(baseTitle: string, baseDescription: string): Promise<VideoMetadata> {
    try {
      const prompt = `Generate 3 variations of social media metadata for maximum engagement:

Original Title: ${baseTitle}
Original Description: ${baseDescription}

For each of 3 platforms (YouTube Shorts, TikTok, Instagram Reels), create:
- title: Engaging, platform-optimized title
- description: Platform-appropriate description
- hashtags: Array of 5-10 trending, relevant hashtags

Respond with JSON in this format:
{
  "title": ["variant1", "variant2", "variant3"],
  "description": ["desc1", "desc2", "desc3"],
  "hashtags": [["tag1", "tag2"], ["tag3", "tag4"], ["tag5", "tag6"]]
}

Respond ONLY with valid JSON.`;

      let responseText: string;

      if (this.provider === 'openai' && this.openai) {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a social media optimization expert. Respond only with valid JSON.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.8
        });
        responseText = response.choices[0].message.content || '{}';
      } else if (this.provider === 'anthropic' && this.anthropic) {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [
            { role: 'user', content: prompt }
          ]
        });
        const content = response.content[0];
        responseText = content.type === 'text' ? content.text : '{}';
      } else {
        throw new Error('No AI provider configured');
      }

      const metadata = JSON.parse(responseText);
      return {
        title: metadata.title || [baseTitle, baseTitle, baseTitle],
        description: metadata.description || [baseDescription, baseDescription, baseDescription],
        hashtags: metadata.hashtags || [['shorts'], ['viral'], ['trending']]
      };
    } catch (error) {
      console.error('Error generating metadata variants:', error);
      return {
        title: [baseTitle, `${baseTitle} 🔥`, `${baseTitle} (MUST WATCH)`],
        description: [baseDescription, `${baseDescription} #viral`, `${baseDescription} - Don't miss this!`],
        hashtags: [['shorts', 'viral'], ['trending', 'fyp'], ['mustsee', 'amazing']]
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      if (this.provider === 'openai' && this.openai) {
        await this.openai.models.list();
        return true;
      } else if (this.provider === 'anthropic' && this.anthropic) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}