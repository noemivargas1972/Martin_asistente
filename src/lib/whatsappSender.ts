/**
 * Smart Commerce & Call Center WhatsApp Dispatcher
 * Manages sending WhatsApp messages seamlessly without opening multiple browser tabs.
 * 
 * Modes:
 * 1. 'app': Opens directly in the user's active WhatsApp Desktop or Mobile app (using 'whatsapp://send')
 *    without creating new browser tabs.
 * 2. 'web': Opens in WhatsApp Web reusing a SINGLE persistent tab ('whatsapp_window').
 * 3. 'universal': Opens api.whatsapp.com reusing a SINGLE persistent tab ('whatsapp_window').
 */

export type WhatsAppLaunchMode = 'app' | 'web' | 'universal';

const STORAGE_KEY_MODE = 'martin_whatsapp_launch_mode';
const STORAGE_KEY_AUTO_COPY = 'martin_whatsapp_auto_copy';

export function getSavedWhatsAppMode(): WhatsAppLaunchMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_MODE);
    if (saved === 'app' || saved === 'web' || saved === 'universal') {
      return saved;
    }
  } catch (e) {}
  // Default to 'app' so it connects directly to user's open WhatsApp application without opening tabs!
  return 'app';
}

export function saveWhatsAppMode(mode: WhatsAppLaunchMode): void {
  try {
    localStorage.setItem(STORAGE_KEY_MODE, mode);
  } catch (e) {}
}

export function getSavedAutoCopy(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_AUTO_COPY);
    return saved !== 'false';
  } catch (e) {}
  return true;
}

export function saveAutoCopy(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_AUTO_COPY, enabled ? 'true' : 'false');
  } catch (e) {}
}

/**
 * Normalizes phone numbers for WhatsApp.
 * Handles Argentine standard formats (+54 9 11..., 11..., 15...) and international numbers.
 */
export function cleanWhatsAppPhone(rawPhone?: string): string {
  if (!rawPhone) return '';
  let digits = rawPhone.replace(/\D/g, '');
  if (!digits) return '';

  // If local Argentine number starting with 15 (e.g. 1544558899)
  if (digits.startsWith('15') && digits.length === 10) {
    digits = '54911' + digits.substring(2);
  }
  // If local Argentine number starting with 11 (e.g. 1144558899)
  else if (digits.startsWith('11') && digits.length === 10) {
    digits = '549' + digits;
  }
  // If starts with 54 but missing the '9' mobile indicator (e.g. 541144558899)
  else if (digits.startsWith('54') && !digits.startsWith('549') && digits.length === 12) {
    digits = '549' + digits.substring(2);
  }
  // If starts with 911 (e.g. 91144558899)
  else if (digits.startsWith('911') && digits.length === 11) {
    digits = '54' + digits;
  }
  // If 8-digit landline or short number
  else if (digits.length === 8) {
    digits = '54911' + digits;
  }

  return digits;
}

export interface SendWhatsAppOptions {
  phone?: string;
  message: string;
  mode?: WhatsAppLaunchMode;
  autoCopy?: boolean;
  onSuccess?: (info: { mode: WhatsAppLaunchMode; phone: string }) => void;
}

/**
 * Primary WhatsApp send function that NEVER creates multiple orphan tabs.
 */
export function sendWhatsAppMessage({
  phone,
  message,
  mode,
  autoCopy,
  onSuccess
}: SendWhatsAppOptions): { success: boolean; modeUsed: WhatsAppLaunchMode; url: string } {
  const chosenMode = mode || getSavedWhatsAppMode();
  const shouldCopy = autoCopy !== undefined ? autoCopy : getSavedAutoCopy();
  const cleanPhone = cleanWhatsAppPhone(phone);
  const encodedMsg = encodeURIComponent(message || '');

  // Copy to clipboard for instant backup if user switches to their open WhatsApp app
  if (shouldCopy && message && typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      navigator.clipboard.writeText(message).catch(() => {});
    } catch (e) {}
  }

  let finalUrl = '';

  if (chosenMode === 'app') {
    // Native WhatsApp Desktop/Mobile protocol
    // This directly targets the already-open WhatsApp Desktop/Mobile application!
    // No new browser tab is created.
    if (cleanPhone) {
      finalUrl = `whatsapp://send?phone=${cleanPhone}&text=${encodedMsg}`;
    } else {
      finalUrl = `whatsapp://send?text=${encodedMsg}`;
    }

    try {
      // Use window.location.assign or hidden anchor click to dispatch protocol without opening a new tab
      const anchor = document.createElement('a');
      anchor.href = finalUrl;
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      setTimeout(() => {
        try {
          document.body.removeChild(anchor);
        } catch (e) {}
      }, 500);
    } catch (e) {
      // Fallback if protocol link cannot be clicked
      window.location.href = finalUrl;
    }
  } else if (chosenMode === 'web') {
    // WhatsApp Web with a PERSISTENT target window name 'whatsapp_single_window'
    // Reuses the exact same tab for every click!
    if (cleanPhone) {
      finalUrl = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;
    } else {
      finalUrl = `https://web.whatsapp.com/send?text=${encodedMsg}`;
    }
    window.open(finalUrl, 'whatsapp_single_window');
  } else {
    // Universal API with single persistent window name
    if (cleanPhone) {
      finalUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;
    } else {
      finalUrl = `https://api.whatsapp.com/send?text=${encodedMsg}`;
    }
    window.open(finalUrl, 'whatsapp_single_window');
  }

  if (onSuccess) {
    onSuccess({ mode: chosenMode, phone: cleanPhone });
  }

  return { success: true, modeUsed: chosenMode, url: finalUrl };
}
