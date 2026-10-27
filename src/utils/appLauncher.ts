export interface AppTarget {
  id: string;
  name: string;
  category: string;
  iconName: string;
  webUrl?: string;
  deepLink?: string;
  isInternal?: boolean;
  internalTarget?: 'app_builder' | 'image_studio' | 'code_playground' | 'calculator' | 'camera' | 'app_hub';
  keywords?: string[];
}

export const KNOWN_APPS: AppTarget[] = [
  {
    id: 'app_hub',
    name: 'All Apps Launcher',
    category: 'Application Hub',
    iconName: 'Grid',
    isInternal: true,
    internalTarget: 'app_hub',
    keywords: [
      'app hub', 'all apps', 'another app', 'other app', 'other apps', 'apps',
      'دوسری ایپ', 'کوئی اور ایپ', 'تمام ایپس', 'ایپس', 'دوسری ایپس',
      'दूसरा ऐप', 'दूसरी ऐप', 'कोई दूसरा ऐप', 'अन्य ऐप', 'सारे ऐप', 'ऐप्स', 'कोई ऐप',
      'ऐप खोलो', 'apps kholo'
    ],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    category: 'Video & Streaming',
    iconName: 'Play',
    webUrl: 'https://www.youtube.com',
    deepLink: 'vnd.youtube://',
    keywords: ['youtube', 'یوٹیوب', 'यूट्यूब', 'yt', 'video app', 'videos', 'video'],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    category: 'Messaging',
    iconName: 'MessageCircle',
    webUrl: 'https://web.whatsapp.com',
    deepLink: 'whatsapp://',
    keywords: ['whatsapp', 'واٹس ایپ', 'व्हाट्सएप', 'wa', 'chat app', 'whats app'],
  },
  {
    id: 'google',
    name: 'Google Search',
    category: 'Search Engine',
    iconName: 'Search',
    webUrl: 'https://www.google.com',
    keywords: ['google', 'گوگل', 'गूगल', 'browser', 'search app', 'search'],
  },
  {
    id: 'calculator',
    name: 'Calculator',
    category: 'Utility Tool',
    iconName: 'Calculator',
    isInternal: true,
    internalTarget: 'calculator',
    keywords: ['calculator', 'کیلکولیٹر', 'कैलकुलेटर', 'calc', 'hisab', 'हिसाब'],
  },
  {
    id: 'camera',
    name: 'Camera & Vision',
    category: 'Media & Photo',
    iconName: 'Camera',
    isInternal: true,
    internalTarget: 'camera',
    keywords: ['camera', 'کیمرہ', 'कैमरा', 'photo', 'capture', 'फोटो'],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'Social Media',
    iconName: 'Camera',
    webUrl: 'https://www.instagram.com',
    deepLink: 'instagram://',
    keywords: ['instagram', 'انسٹاگرام', 'इंस्टाग्राम', 'insta', 'reels', 'रील'],
  },
  {
    id: 'maps',
    name: 'Google Maps',
    category: 'Navigation',
    iconName: 'MapPin',
    webUrl: 'https://maps.google.com',
    keywords: ['maps', 'گوگل میپس', 'गूगल मैप्स', 'नक्शा', 'map', 'location', 'navigation', 'direction'],
  },
  {
    id: 'spotify',
    name: 'Spotify',
    category: 'Music & Audio',
    iconName: 'Music',
    webUrl: 'https://open.spotify.com',
    deepLink: 'spotify://',
    keywords: ['spotify', 'سپوٹیفائی', 'स्पॉटिफ़ाई', 'music app', 'songs', 'music', 'गाने'],
  },
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'Email',
    iconName: 'Mail',
    webUrl: 'https://mail.google.com',
    deepLink: 'googlegmail://',
    keywords: ['gmail', 'جی میل', 'ईमेल', 'email', 'mail', 'inbox'],
  },
  {
    id: 'app_builder',
    name: 'AI App Builder Studio',
    category: 'Development Studio',
    iconName: 'Boxes',
    isInternal: true,
    internalTarget: 'app_builder',
    keywords: ['app builder', 'ایپ بلڈر', 'ऐप बिल्डर', 'app maker', 'build app', 'make app'],
  },
  {
    id: 'image_studio',
    name: 'AI Image Studio',
    category: 'Visual Studio',
    iconName: 'Sparkles',
    isInternal: true,
    internalTarget: 'image_studio',
    keywords: ['image studio', 'امیج اسٹوڈیو', 'इमेज स्टूडियो', 'photo studio', 'picture studio'],
  },
  {
    id: 'code_playground',
    name: 'Code Playground',
    category: 'Live Coding Engine',
    iconName: 'Terminal',
    isInternal: true,
    internalTarget: 'code_playground',
    keywords: ['code playground', 'کوڈ پلے گراؤنڈ', 'प्लेग्राउंड', 'code runner', 'playground'],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    category: 'Social Media',
    iconName: 'Share2',
    webUrl: 'https://www.facebook.com',
    deepLink: 'fb://',
    keywords: ['facebook', 'فیس بک', 'फेसबुक', 'fb'],
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    category: 'News & Social',
    iconName: 'Twitter',
    webUrl: 'https://x.com',
    deepLink: 'twitter://',
    keywords: ['twitter', 'ٹویٹر', 'ट्विटर', 'x.com', 'tweets'],
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'Developer Tools',
    iconName: 'Code',
    webUrl: 'https://github.com',
    keywords: ['github', 'گٹ ہب', 'गिटहब', 'git', 'repo', 'code repository'],
  },
  {
    id: 'telegram',
    name: 'Telegram',
    category: 'Messaging',
    iconName: 'Send',
    webUrl: 'https://web.telegram.org',
    deepLink: 'tg://',
    keywords: ['telegram', 'ٹیلیگرام', 'टेलीग्राम'],
  },
  {
    id: 'playstore',
    name: 'Google Play Store',
    category: 'App Store',
    iconName: 'ShoppingBag',
    webUrl: 'https://play.google.com/store',
    keywords: ['playstore', 'play store', 'پلے اسٹور', 'प्ले स्टोर', 'store'],
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    category: 'AI Assistant',
    iconName: 'Sparkles',
    webUrl: 'https://chat.openai.com',
    keywords: ['chatgpt', 'chat gpt', 'چیٹ جی پی ٹی', 'चैटजीपीटी'],
  },
  {
    id: 'netflix',
    name: 'Netflix',
    category: 'Movies & Series',
    iconName: 'Film',
    webUrl: 'https://www.netflix.com',
    keywords: ['netflix', 'نیٹ فلکس', 'नेटफ्लिक्स', 'movies'],
  },
  {
    id: 'canva',
    name: 'Canva',
    category: 'Design Suite',
    iconName: 'Palette',
    webUrl: 'https://www.canva.com',
    keywords: ['canva', 'کینوا', 'कैनवा', 'graphics design'],
  },
  {
    id: 'zoom',
    name: 'Zoom',
    category: 'Video Meetings',
    iconName: 'Video',
    webUrl: 'https://zoom.us',
    keywords: ['zoom', 'زوم', 'ज़ूम', 'meeting', 'video call'],
  },
];

// Detect if user is asking to open or launch an app
export function detectAppLaunchIntent(text: string): AppTarget | null {
  if (!text) return null;
  const lower = text.toLowerCase().trim();

  // Words that indicate debugging/error-fixing requests rather than direct app opening
  const isDebugFixRequest =
    lower.includes('error fix') ||
    lower.includes('fix error') ||
    lower.includes('एरर फिक्स') ||
    lower.includes('فکس کرو') ||
    lower.includes('سکے اس کے لیے') ||
    lower.includes('سکے اسکے لیے') ||
    lower.includes('सके इसके लिए') ||
    lower.includes('error') && (lower.includes('fix') || lower.includes('फिक्स'));

  if (isDebugFixRequest) {
    // Return App Hub target so the assistant fixes the error and shows the launcher hub
    return KNOWN_APPS.find((a) => a.id === 'app_hub') || null;
  }

  // Trigger keywords for opening an app in Hindi, Urdu, English, Roman Urdu
  const openTriggers = [
    'kholo', 'khol do', 'kholna', 'kholo na', 'kholen',
    'open', 'launch', 'run', 'start', 'show me',
    'खोलो', 'खोल दो', 'खोलिए', 'चलाओ', 'ओपन', 'दिखाओ',
    'کھولو', 'کھول دو', 'کھولیں', 'اوپن کرو', 'اوپن', 'دکھاؤ'
  ];

  const hasOpenTrigger = openTriggers.some((trigger) => lower.includes(trigger));

  // 1. Check known apps list
  for (const app of KNOWN_APPS) {
    for (const kw of (app.keywords || [])) {
      if (hasOpenTrigger && lower.includes(kw)) {
        return app;
      }
      // Exact single command like "youtube" or "open youtube" or "open app"
      if (
        lower === kw ||
        lower === `open ${kw}` ||
        lower === `${kw} kholo` ||
        lower === `${kw} खोलो` ||
        lower === `${kw} کھولو`
      ) {
        return app;
      }
    }
  }

  // 2. Generic "open another app" / "open apps" / "دوسری ایپ کھولو" / "दूसरा ऐप खोलो"
  if (
    lower.includes('another app') ||
    lower.includes('other app') ||
    lower.includes('दूसरा ऐप') ||
    lower.includes('दूसरी ऐप') ||
    lower.includes('कोई दूसरा ऐप') ||
    lower.includes('دوسری ایپ') ||
    lower.includes('کوئی اور ایپ')
  ) {
    return KNOWN_APPS.find((a) => a.id === 'app_hub') || null;
  }

  // 3. Dynamic app synthesis ONLY when explicitly saying "open [Name]" or "[Name] kholo"
  // and text is not a long analytical/philosophical question
  if (hasOpenTrigger && lower.split(/\s+/).length <= 4) {
    const cleaned = lower
      .replace(
        /(kholo|khol do|kholna|open|launch|run|start|खोलो|खोल दो|کھولو|اوپن کرو|اوپن|app|ایپ|ऐप|please|کریں|کر دو)/g,
        ''
      )
      .trim();

    // Avoid false positives on common words
    const blacklisted = ['chat', 'message', 'help', 'code', 'image', 'picture', 'सवाल', 'جواب', 'answer', 'error'];
    if (cleaned.length >= 2 && !blacklisted.includes(cleaned)) {
      const cleanName = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      return {
        id: `dynamic-${cleaned.replace(/\s+/g, '-')}`,
        name: cleanName,
        category: 'Web Application',
        iconName: 'ExternalLink',
        webUrl: `https://www.google.com/search?q=${encodeURIComponent(cleaned)}+app`,
        keywords: [cleaned],
      };
    }
  }

  return null;
}

// Error-free, secure external app opener that bypasses popup blocker / iframe restrictions
export function safeLaunchApp(url: string): boolean {
  if (!url) return false;

  try {
    // Strategy 1: Dynamic hidden anchor with user gesture simulation
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        document.body.removeChild(link);
      } catch {}
    }, 250);
    return true;
  } catch (anchorErr) {
    console.warn('Anchor launch fallback:', anchorErr);
    try {
      // Strategy 2: window.open
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (win) {
        win.focus();
        return true;
      }
    } catch (winErr) {
      console.warn('window.open blocked:', winErr);
    }
  }

  // Strategy 3: Top navigation if allowed
  try {
    window.location.assign(url);
    return true;
  } catch {}

  return false;
}
