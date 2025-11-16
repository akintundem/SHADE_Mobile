import { Share, Platform, Linking } from 'react-native';
import { Event } from '../types';
import { dateUtils } from './helpers';
import { DATE_FORMATS } from './constants';

export type SharePlatform = 'native' | 'facebook' | 'instagram' | 'whatsapp' | 'twitter' | 'snapchat' | 'telegram' | 'email' | 'sms';

export interface ShareContent {
  message: string;
  title: string;
  url?: string;
  imageUrl?: string;
}

/**
 * Prepares share content for an event
 */
export function prepareEventShareContent(event: Event, shareLink?: string): ShareContent {
  const eventName = event.name || 'Event';
  const description = event.description || '';
  const startDate = event.startDateTime
    ? dateUtils.formatDate(event.startDateTime, DATE_FORMATS.DISPLAY_DATETIME)
    : 'TBD';
  
  const venue = event.venueId ? 'Check location details' : '';
  
  // Build the share message
  let message = `🎉 ${eventName}\n\n`;
  
  if (description) {
    message += `${description}\n\n`;
  }
  
  message += `📅 Starting: ${startDate}\n`;
  
  if (event.endDateTime) {
    const endDate = dateUtils.formatDate(event.endDateTime, DATE_FORMATS.DISPLAY_DATETIME);
    message += `📅 Ending: ${endDate}\n`;
  }
  
  if (shareLink) {
    message += `\n🔗 ${shareLink}`;
  }
  
  if (event.hashtag) {
    message += `\n\n${event.hashtag}`;
  }
  
  return {
    message,
    title: eventName,
    url: shareLink,
    imageUrl: event.coverImageUrl || undefined,
  };
}

/**
 * Shares content using the native share sheet
 */
export async function shareViaNative(content: ShareContent): Promise<void> {
  try {
    const shareOptions: { message?: string; title?: string; url?: string } = {};
    
    if (Platform.OS === 'ios') {
      shareOptions.url = content.url;
      shareOptions.title = content.title;
    }
    
    shareOptions.message = content.message;
    
    await Share.share(shareOptions);
  } catch (error) {
    console.error('Error sharing via native:', error);
    throw error;
  }
}

/**
 * Shares content via WhatsApp
 */
export async function shareViaWhatsApp(content: ShareContent): Promise<void> {
  const text = encodeURIComponent(`${content.title}\n\n${content.message}`);
  const url = `whatsapp://send?text=${text}`;
  
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      // Fallback to web WhatsApp
      const webUrl = `https://wa.me/?text=${text}`;
      await Linking.openURL(webUrl);
    }
  } catch (error) {
    console.error('Error sharing via WhatsApp:', error);
    throw error;
  }
}

/**
 * Shares content via Facebook
 */
export async function shareViaFacebook(content: ShareContent): Promise<void> {
  // Facebook doesn't support direct sharing via URL scheme reliably
  // Use native share or web URL
  if (content.url) {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(content.url)}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error sharing via Facebook:', error);
      throw error;
    }
  } else {
    // Fallback to native share
    await shareViaNative(content);
  }
}

/**
 * Shares content via Twitter/X
 */
export async function shareViaTwitter(content: ShareContent): Promise<void> {
  const text = encodeURIComponent(`${content.title} ${content.url || ''}`);
  const url = `https://twitter.com/intent/tweet?text=${text}`;
  
  try {
    await Linking.openURL(url);
  } catch (error) {
    console.error('Error sharing via Twitter:', error);
    throw error;
  }
}

/**
 * Shares content via Instagram
 * Note: Instagram doesn't support direct sharing via URL scheme
 * Uses native share which allows Instagram as an option
 */
export async function shareViaInstagram(content: ShareContent): Promise<void> {
  // Instagram doesn't support direct sharing via URL
  // Use native share which will show Instagram as an option if installed
  await shareViaNative(content);
}

/**
 * Shares content via Snapchat
 */
export async function shareViaSnapchat(content: ShareContent): Promise<void> {
  // Snapchat doesn't support direct text sharing via URL scheme
  // Use native share as fallback
  try {
    const snapchatUrl = 'snapchat://';
    const canOpen = await Linking.canOpenURL(snapchatUrl);
    
    if (canOpen && content.url) {
      // Try to share URL via Snapchat
      const url = `snapchat://share?text=${encodeURIComponent(content.message)}`;
      await Linking.openURL(url);
    } else {
      // Fallback to native share
      await shareViaNative(content);
    }
  } catch (error) {
    console.error('Error sharing via Snapchat:', error);
    // Fallback to native share
    await shareViaNative(content);
  }
}

/**
 * Shares content via Telegram
 */
export async function shareViaTelegram(content: ShareContent): Promise<void> {
  const text = encodeURIComponent(`${content.title}\n\n${content.message}`);
  const url = `tg://msg?text=${text}`;
  
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      // Fallback to web Telegram
      const webUrl = `https://t.me/share/url?url=${encodeURIComponent(content.url || '')}&text=${text}`;
      await Linking.openURL(webUrl);
    }
  } catch (error) {
    console.error('Error sharing via Telegram:', error);
    throw error;
  }
}

/**
 * Shares content via Email
 */
export async function shareViaEmail(content: ShareContent): Promise<void> {
  const subject = encodeURIComponent(content.title);
  const body = encodeURIComponent(content.message);
  const url = `mailto:?subject=${subject}&body=${body}`;
  
  try {
    await Linking.openURL(url);
  } catch (error) {
    console.error('Error sharing via Email:', error);
    throw error;
  }
}

/**
 * Shares content via SMS
 */
export async function shareViaSMS(content: ShareContent): Promise<void> {
  const body = encodeURIComponent(content.message);
  const url = `sms:?body=${body}`;
  
  try {
    await Linking.openURL(url);
  } catch (error) {
    console.error('Error sharing via SMS:', error);
    throw error;
  }
}

/**
 * Main share function that routes to the appropriate platform
 */
export async function shareEvent(
  event: Event,
  platform: SharePlatform,
  shareLink?: string,
): Promise<void> {
  const content = prepareEventShareContent(event, shareLink);
  
  switch (platform) {
    case 'native':
      await shareViaNative(content);
      break;
    case 'whatsapp':
      await shareViaWhatsApp(content);
      break;
    case 'facebook':
      await shareViaFacebook(content);
      break;
    case 'twitter':
      await shareViaTwitter(content);
      break;
    case 'instagram':
      await shareViaInstagram(content);
      break;
    case 'snapchat':
      await shareViaSnapchat(content);
      break;
    case 'telegram':
      await shareViaTelegram(content);
      break;
    case 'email':
      await shareViaEmail(content);
      break;
    case 'sms':
      await shareViaSMS(content);
      break;
    default:
      await shareViaNative(content);
  }
}

