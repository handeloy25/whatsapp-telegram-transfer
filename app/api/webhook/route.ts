import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Store for configuration (in production, use a database)
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

// Store processed message IDs to avoid duplicates
const processedMessages = new Set<string>();

// Specific links to replace
const SPECIFIC_LINKS = [
  'https://go.aff.7k-partners.com/gq18hxcm?afp=WPP',
  'https://reydelgreen.com/ruleta-premios/'
];

const TELEGRAM_BOT_LINK = 'http://t.me/ReydelgreenDouble_bot';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle WhatsApp webhook from Evolution API
    if (body.event === 'messages.upsert' && body.data) {
      const message = body.data;
      
      // Check if message is from the source community
      if (message.key?.remoteJid === config.whatsappSourceGroup && config.isActive) {
        const messageId = message.key.id;
        
        // Avoid processing duplicate messages
        if (processedMessages.has(messageId)) {
          return NextResponse.json({ status: 'duplicate' });
        }
        
        processedMessages.add(messageId);
        
        // Extract message content
        let messageText = message.message?.conversation || 
                         message.message?.extendedTextMessage?.text || 
                         'Media message';
        
        const senderName = message.pushName || 'Unknown';
        
        // Process message for WhatsApp (with link replacements)
        const whatsappMessage = processMessageForWhatsApp(messageText);
        
        // Process message for Telegram (remove telegram bot link only)
        const telegramMessage = processMessageForTelegram(messageText);
        
        // Format messages for forwarding
        const whatsappFormattedMessage = `💰 REY DEL GREEN 💰\n\n👤 ${senderName}:\n${whatsappMessage}\n\n⏰ ${new Date().toLocaleString()}`;
        const telegramFormattedMessage = `💰 REY DEL GREEN 💰\n\n👤 ${senderName}:\n${telegramMessage}\n\n⏰ ${new Date().toLocaleString()}`;
        
        // Forward to Telegram
        if (config.telegramBotToken && config.telegramChatId) {
          await forwardToTelegram(telegramFormattedMessage);
        }
        
        // Forward to WhatsApp target group
        if (config.whatsappTargetGroup) {
          await forwardToWhatsApp(whatsappFormattedMessage);
        }
        
        return NextResponse.json({ 
          status: 'forwarded', 
          messageId,
          originalMessage: messageText,
          whatsappMessage: whatsappMessage,
          telegramMessage: telegramMessage,
          linksProcessed: messageText !== whatsappMessage || messageText !== telegramMessage
        });
      }
    }
    
    return NextResponse.json({ status: 'ignored' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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

async function forwardToTelegram(message: string) {
  try {
    await axios.post(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
      chat_id: config.telegramChatId,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: false
    });
    console.log('Message forwarded to Telegram');
  } catch (error) {
    console.error('Error forwarding to Telegram:', error);
  }
}

async function forwardToWhatsApp(message: string) {
  try {
    await axios.post(`${config.evolutionApiUrl}/message/sendText`, {
      number: config.whatsappTargetGroup,
      text: message
    }, {
      headers: {
        'Authorization': `Bearer ${config.evolutionApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Message forwarded to WhatsApp');
  } catch (error) {
    console.error('Error forwarding to WhatsApp:', error);
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Webhook endpoint active',
    config: {
      isActive: config.isActive,
      hasEvolutionConfig: !!(config.evolutionApiUrl && config.evolutionApiKey),
      hasTelegramConfig: !!(config.telegramBotToken && config.telegramChatId),
      replacementLink: config.replacementLink,
      telegramReplacementLink: config.telegramReplacementLink,
      specificLinks: SPECIFIC_LINKS,
      telegramBotLink: TELEGRAM_BOT_LINK
    }
  });
}

// Export config for other routes
export { config };
