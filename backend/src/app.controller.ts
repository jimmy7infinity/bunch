import { Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument } from './modules/chat/schemas/conversation.schema';
import { readFileSync } from 'fs';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
  ) {}

  @Get()
  getHello(): object {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): object {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Bunch API',
      version: 'oauth2-v1',
    };
  }

  @Post('seed-global-chats')
  async seedGlobalChats() {
    const globalChats = [
      { title: 'General', slug: 'general' },
      { title: 'Politics', slug: 'politics' },
      { title: 'Sports', slug: 'sports' },
      { title: 'Crypto', slug: 'crypto' },
      { title: 'Finance', slug: 'finance' },
      { title: 'Geopolitics', slug: 'geopolitics' },
      { title: 'Earnings', slug: 'earnings' },
      { title: 'Tech', slug: 'tech' },
      { title: 'Culture', slug: 'culture' },
      { title: 'World Economy', slug: 'world-economy' },
      { title: 'Climate & Science', slug: 'climate-science' },
      { title: 'Elections', slug: 'elections' },
      { title: 'Mentions', slug: 'mentions' },
    ];

    const results = [];
    for (const chat of globalChats) {
      const existing = await this.conversationModel.findOne({
        type: 'global',
        slug: chat.slug,
      });

      if (existing) {
        results.push({ chat: chat.title, status: 'already exists' });
      } else {
        await this.conversationModel.create({
          type: 'global',
          title: chat.title,
          slug: chat.slug,
          is_private: false,
          participant_count: 0,
          created_at: new Date(),
          updated_at: new Date(),
        });
        results.push({ chat: chat.title, status: 'created' });
      }
    }

    return {
      success: true,
      message: 'Global chats seeded',
      results,
    };
  }

  @Get('privacy')
  getPrivacyPolicy(@Res() res: Response) {
    const privacyContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy - Bunch</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #333;
        }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        h3 { color: #7f8c8d; }
        a { color: #3498db; }
        .last-updated { color: #7f8c8d; font-style: italic; }
    </style>
</head>
<body>
    <h1>Privacy Policy for Bunch</h1>
    <p class="last-updated"><strong>Last Updated:</strong> January 26, 2026</p>

    <h2>Introduction</h2>
    <p>Bunch ("we", "our", or "us") respects your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our Chrome extension and services.</p>

    <h2>Information We Collect</h2>
    <h3>1. Account Information</h3>
    <ul>
        <li>Twitter username and profile information (if you sign in with Twitter)</li>
        <li>Wallet address (if you connect a crypto wallet)</li>
        <li>Display name and avatar</li>
    </ul>

    <h3>2. Usage Data</h3>
    <ul>
        <li>Messages you send in chats</li>
        <li>Chats you join or create</li>
        <li>Reactions and interactions</li>
        <li>Market pages you visit on Polymarket</li>
    </ul>

    <h3>3. Technical Data</h3>
    <ul>
        <li>Browser type and version</li>
        <li>Extension usage patterns</li>
        <li>Error logs and diagnostics</li>
    </ul>

    <h2>How We Use Your Information</h2>
    <p>We use your information to:</p>
    <ul>
        <li>Provide chat functionality and real-time messaging</li>
        <li>Authenticate your account and maintain security</li>
        <li>Display your profile to other users</li>
        <li>Suggest relevant market chats based on your browsing</li>
        <li>Improve our services and fix bugs</li>
        <li>Moderate content and enforce our Terms of Service</li>
    </ul>

    <h2>Data Sharing</h2>
    <p>We do NOT sell your personal information. We may share data with:</p>
    <ul>
        <li><strong>Other Users:</strong> Your username, avatar, and messages are visible to other users in chats</li>
        <li><strong>Service Providers:</strong> We use third-party services (MongoDB, Railway) to host our infrastructure</li>
        <li><strong>Legal Requirements:</strong> We may disclose information if required by law</li>
    </ul>

    <h2>Data Storage and Security</h2>
    <ul>
        <li>Your data is stored on secure servers</li>
        <li>We use HTTPS/WSS encryption for all data transmission</li>
        <li>Authentication tokens are stored securely in your browser</li>
        <li>We implement industry-standard security practices</li>
    </ul>

    <h2>Your Rights</h2>
    <p>You have the right to:</p>
    <ul>
        <li>Access your personal data</li>
        <li>Request deletion of your account and data</li>
        <li>Update your profile information</li>
        <li>Block other users</li>
        <li>Control auto-join settings for market chats</li>
    </ul>

    <h2>Cookies and Local Storage</h2>
    <p>We use browser local storage to:</p>
    <ul>
        <li>Keep you logged in</li>
        <li>Store your preferences and settings</li>
        <li>Cache chat data for better performance</li>
    </ul>

    <h2>Third-Party Services</h2>
    <p>Our extension interacts with:</p>
    <ul>
        <li><strong>Polymarket:</strong> We detect which market pages you visit to suggest relevant chats</li>
        <li><strong>Twitter OAuth:</strong> For authentication (if you choose to sign in with Twitter)</li>
        <li><strong>Tenor:</strong> For GIF search functionality</li>
        <li><strong>Cloudinary:</strong> For image uploads</li>
    </ul>

    <h2>Children's Privacy</h2>
    <p>Bunch is not intended for users under 18. We do not knowingly collect data from children.</p>

    <h2>Changes to This Policy</h2>
    <p>We may update this Privacy Policy from time to time. We will notify users of significant changes through the extension or via email.</p>

    <h2>Contact Us</h2>
    <p>If you have questions about this Privacy Policy, please contact us at:</p>
    <p><strong>Email:</strong> privacy@bunch.app</p>
    <p><strong>Website:</strong> <a href="https://bunch.up.railway.app">https://bunch.up.railway.app</a></p>

    <hr>
    <p><strong>By using Bunch, you agree to this Privacy Policy.</strong></p>
</body>
</html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(privacyContent);
  }

  @Get('terms')
  getTermsOfService(@Res() res: Response) {
    const termsContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terms of Service - Bunch</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #333;
        }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        h3 { color: #7f8c8d; }
        a { color: #3498db; }
        .last-updated { color: #7f8c8d; font-style: italic; }
    </style>
</head>
<body>
    <h1>Terms of Service for Bunch</h1>
    <p class="last-updated"><strong>Last Updated:</strong> January 26, 2026</p>

    <h2>Acceptance of Terms</h2>
    <p>By using Bunch, you agree to these Terms of Service. If you disagree, do not use the service.</p>

    <h2>Service Description</h2>
    <p>Bunch is a Chrome extension that provides chat functionality for Polymarket traders. It is provided "as is" without warranties.</p>

    <h2>User Accounts</h2>
    <ul>
        <li>You may sign in with Twitter or connect a crypto wallet</li>
        <li>You are responsible for maintaining account security</li>
        <li>One account per person</li>
        <li>You must be 18+ years old to use Bunch</li>
    </ul>

    <h2>Acceptable Use</h2>
    <p>You agree NOT to:</p>
    <ul>
        <li>Spam, harass, or abuse other users</li>
        <li>Share illegal, harmful, or offensive content</li>
        <li>Impersonate others or create fake accounts</li>
        <li>Attempt to hack, exploit, or disrupt the service</li>
        <li>Use bots or automated tools without permission</li>
        <li>Share personal information of others without consent</li>
        <li>Engage in market manipulation or fraudulent activity</li>
    </ul>

    <h2>Content and Moderation</h2>
    <ul>
        <li>You own the content you post</li>
        <li>By posting, you grant us a license to display your content</li>
        <li>We reserve the right to moderate, remove, or ban content/users</li>
        <li>Moderators and admins can delete messages and ban users</li>
        <li>Banned users will be immediately disconnected</li>
    </ul>

    <h2>User Ranks and Leaderboards</h2>
    <ul>
        <li>Ranks are earned through activity and engagement</li>
        <li>We may adjust rank criteria at any time</li>
        <li>Ranks do not confer any legal rights or ownership</li>
    </ul>

    <h2>Privacy</h2>
    <p>Your use of Bunch is also governed by our <a href="/privacy">Privacy Policy</a>.</p>

    <h2>Intellectual Property</h2>
    <ul>
        <li>Bunch name and logo are our property</li>
        <li>Do not use our branding without permission</li>
        <li>Respect others' intellectual property</li>
    </ul>

    <h2>Termination</h2>
    <p>We may suspend or terminate your account at any time for:</p>
    <ul>
        <li>Violating these Terms</li>
        <li>Abusive or harmful behavior</li>
        <li>Legal or security reasons</li>
    </ul>

    <h2>Disclaimers</h2>
    <h3>No Financial Advice</h3>
    <ul>
        <li>Bunch is for discussion only</li>
        <li>Not financial, legal, or investment advice</li>
        <li>Do your own research</li>
        <li>Trade at your own risk</li>
    </ul>

    <h3>No Affiliation</h3>
    <p>Bunch is not affiliated with, endorsed by, or connected to Polymarket. We are an independent, community-driven platform.</p>

    <h3>Service Availability</h3>
    <ul>
        <li>We provide the service "as is"</li>
        <li>No guarantee of uptime or availability</li>
        <li>We may modify or discontinue features at any time</li>
    </ul>

    <h2>Limitation of Liability</h2>
    <p>To the maximum extent permitted by law:</p>
    <ul>
        <li>We are not liable for any damages arising from your use of Bunch</li>
        <li>We are not responsible for user-generated content</li>
        <li>We are not liable for trading losses or financial decisions</li>
    </ul>

    <h2>Indemnification</h2>
    <p>You agree to indemnify and hold us harmless from any claims arising from your use of Bunch or violation of these Terms.</p>

    <h2>Changes to Terms</h2>
    <p>We may update these Terms at any time. Continued use of Bunch after changes constitutes acceptance.</p>

    <h2>Governing Law</h2>
    <p>These Terms are governed by the laws of the United States. Disputes will be resolved in applicable courts.</p>

    <h2>Contact</h2>
    <p>Questions about these Terms? Contact us at:</p>
    <p><strong>Email:</strong> support@bunch.app</p>
    <p><strong>Website:</strong> <a href="https://bunch.up.railway.app">https://bunch.up.railway.app</a></p>

    <hr>
    <p><strong>By using Bunch, you agree to these Terms of Service.</strong></p>
</body>
</html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(termsContent);
  }
}





