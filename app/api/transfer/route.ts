import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Import config from webhook route
let config = {
  evolutionApiUrl: '',
  evolutionApiKey: '',
  telegramBotToken: '',
  telegramChatId: '',
  whatsappSourceGroup: '120363355538668931@g.us',
  whatsappTargetGroup: '💰🎁 REY DEL GREEN 🎁💰 #1',
  replacementLink: 'https://jugar.trylines.com/68b22a207a3857d4dcf79078?utm_source=ganar',
  telegramReplacementLink: 'https://t.me/spinjuiceai',
  isActive: false
};

// Specific links to replace
const SPECIFIC_LINKS = [
  'https://go.aff.7k-partners.com/gq18hxcm?afp=WPP',
  'https://reydelgreen.com/ruleta-premios/'
];

const TELEGRAM_BOT_LINK = 'http://t.me/ReydelgreenDouble_bot';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...configData } = body;

    switch (action) {
      case 'updateConfig':
        // Update configuration
        Object.assign(config, configData);
        return NextResponse.json({ 
          status: 'success', 
          message: 'Configuration updated',
          config 
        });

      case 'start':
        if (!config.evolutionApiUrl || !config.evolutionApiKey) {
          return NextResponse.json({ 
            error: 'Evolution API configuration missing' 
          }, { status: 400 });
        }
        
        config.isActive = true;
        
        // Set up webhook with Evolution API
        try {
          await setupEvolutionWebhook();
          return NextResponse.json({ 
            status: 'success', 
            message: 'Transfer service started with custom link replacement rules',
            isActive: true,
            replacementRules: {
              whatsappLinks: SPECIFIC_LINKS,
              whatsappReplacement: config.replacementLink,
              telegramBotLink: TELEGRAM_BOT_LINK,
              telegramReplacement: config.telegramReplacementLink
            }
          });
        } catch (error) {
          config.isActive = false;
          return NextResponse.json({ 
            error: 'Failed to setup webhook with Evolution API' 
          }, { status: 500 });
        }

      case 'stop':
        config.isActive = false;
        return NextResponse.json({ 
          status: 'success', 
          message: 'Transfer service stopped',
          isActive: false 
        });

      case 'testEvolution':
        try {
          const response = await axios.get(`${config.evolutionApiUrl}/instance/connectionState`, {
            headers: {
              'Authorization': `Bearer ${config.evolutionApiKey}`
            }
          });
          
          return NextResponse.json({ 
            status: 'success', 
            message: 'Evolution API connection successful',
            data: response.data 
          });
        } catch (error) {
          return NextResponse.json({ 
            error: 'Evolution API connection failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 400 });
        }

      case 'testTelegram':
        try {
          const response = await axios.get(`https://api.telegram.org/bot${config.telegramBotToken}/getMe`);
          
          // Test sending a message with link replacement info
          await axios.post(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
            chat_id: config.telegramChatId,
            text: `🤖 Test message from WhatsApp Transfer Bot\n\n✅ Connection successful!\n🔗 Custom link replacement rules active:\n• Specific links → ${config.replacementLink}\n• Telegram bot removal for Telegram messages`
          });
          
          return NextResponse.json({ 
            status: 'success', 
            message: 'Telegram connection successful',
            botInfo: response.data.result 
          });
        } catch (error) {
          return NextResponse.json({ 
            error: 'Telegram connection failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 400 });
        }

      case 'testLinkReplacement':
        // Test the link replacement functionality with specific examples
        const testMessage = `Check out these offers:
${SPECIFIC_LINKS[0]}
${SPECIFIC_LINKS[1]}
Also join our bot: ${TELEGRAM_BOT_LINK}
Visit our site: https://example.com`;

        const whatsappProcessed = processMessageForWhatsApp(testMessage);
        const telegramProcessed = processMessageForTelegram(testMessage);
        
        return NextResponse.json({
          status: 'success',
          message: 'Link replacement test completed',
          original: testMessage,
          whatsappVersion: whatsappProcessed,
          telegramVersion: telegramProcessed,
          rules: {
            whatsappRules: `Replace ${SPECIFIC_LINKS.join(', ')} and ${TELEGRAM_BOT_LINK} with specific links`,
            telegramRules: `Remove ${TELEGRAM_BOT_LINK} only, keep other links unchanged`
          }
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Transfer API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    config: {
      ...config,
      evolutionApiKey: config.evolutionApiKey ? '***' : '',
      telegramBotToken: config.telegramBotToken ? '***' : ''
    },
    status: config.isActive ? 'active' : 'inactive',
    replacementRules: {
      specificLinks: SPECIFIC_LINKS,
      telegramBotLink: TELEGRAM_BOT_LINK,
      whatsappReplacement: config.replacementLink,
      telegramReplacement: config.telegramReplacementLink
    }
  });
}

function processMessageForWhatsApp(message: string): string {
  let processedMessage = message;
  let hasReplacements = false;
  
  // Replace specific links with the main replacement link
  SPECIFIC_LINKS.forEach(link => {
    if (processedMessage.includes(link)) {
      processedMessage = processedMessage.replace(new RegExp(escapeRegExp(link), 'gi'), config.replacementLink);
      hasReplacements = true;
    }
  });
  
  // Replace telegram bot link with spinjuiceai telegram
  if (processedMessage.includes(TELEGRAM_BOT_LINK)) {
    processedMessage = processedMessage.replace(new RegExp(escapeRegExp(TELEGRAM_BOT_LINK), 'gi'), config.telegramReplacementLink);
    hasReplacements = true;
  }
  
  // Add note if replacements were made
  if (hasReplacements) {
    processedMessage += '\n\n🔗 Links have been updated';
  }
  
  return processedMessage;
}

function processMessageForTelegram(message: string): string {
  let processedMessage = message;
  
  // For Telegram: only remove the telegram bot link, don't replace with anything
  if (processedMessage.includes(TELEGRAM_BOT_LINK)) {
    // Remove the telegram bot link and any surrounding whitespace
    processedMessage = processedMessage.replace(new RegExp(escapeRegExp(TELEGRAM_BOT_LINK) + '\\s*', 'gi'), '');
    // Clean up any double spaces or line breaks
    processedMessage = processedMessage.replace(/\s+/g, ' ').trim();
  }
  
  return processedMessage;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function setupEvolutionWebhook() {
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://whatsapp-telegram-transfer.lindy.site'}/api/webhook`;
  
  try {
    await axios.post(`${config.evolutionApiUrl}/webhook/set`, {
      webhook: {
        url: webhookUrl,
        events: ['messages.upsert']
      }
    }, {
      headers: {
        'Authorization': `Bearer ${config.evolutionApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Webhook configured successfully');
  } catch (error) {
    console.error('Failed to setup webhook:', error);
    throw error;
  }
}
