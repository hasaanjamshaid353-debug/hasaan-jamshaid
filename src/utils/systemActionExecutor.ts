import { saveMemory, getStoredMemories, getClassroomDueDatesFromMemory } from './memoryStore';

export interface ActionResult {
  handled: boolean;
  replyText: string;
  actionName?: string;
  urlOpened?: string;
}

// Detect language style
export function detectLanguage(text: string): 'ur' | 'en' {
  if (/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)) {
    return 'ur';
  }
  return 'en';
}

export interface VoiceTaskOptions {
  isJarvis?: boolean;
  address?: string; // 'Sir' | 'Boss' | 'جناب'
  lang?: 'ur' | 'en' | 'auto';
}

/**
 * Universal Autonomous Action Executor
 * Executes browser controls, tab opening, system actions, search, timers, and memory.
 * Adheres to JARVIS personality: professional acknowledgment, precise action, proactive assistance.
 */
export function executeAutonomousVoiceTask(
  rawQuery: string,
  options?: VoiceTaskOptions
): ActionResult {
  const query = (rawQuery || '').trim();
  const lower = query.toLowerCase();
  const isUrdu = (options?.lang === 'ur') || (detectLanguage(query) === 'ur');
  const isJarvis = options?.isJarvis ?? true;
  const address = options?.address || (isUrdu ? 'جناب' : 'Sir');
  const addressUr = address === 'Boss' ? 'باس' : address === 'Sir' ? 'جناب' : address;

  // 0. JARVIS SYSTEM DIAGNOSTICS & STATUS QUERY
  const isExplicitDiagnostics =
    (lower === 'system status' ||
      lower === 'systems check' ||
      lower === 'run diagnostics' ||
      lower === 'system diagnostics' ||
      lower === 'سسٹم چیک' ||
      lower === 'سسٹم کا اسٹیٹس' ||
      lower === 'سسٹم اسٹیٹس' ||
      lower.includes('حکم') ||
      lower.includes('مشن') ||
      lower === 'تیار ہو') &&
    query.split(/\s+/).length <= 4;

  if (isExplicitDiagnostics) {
    return {
      handled: true,
      actionName: 'jarvis_status',
      replyText: isUrdu
        ? `یس سر! میں جارویس ہوں۔ تمام سسٹمز 100 فیصد پر آپریشنل ہیں۔ فرمائیے سر، کیا مشن ہے؟`
        : `Yes Sir! I am JARVIS. All systems are functioning at 100%. Standing by for your mission, Sir.`,
    };
  }

  // 0.1 AMBIGUOUS FILE SEARCH OR COMMANDS
  if (
    lower === 'فائل تلاش کرو' ||
    lower === 'فائل ڈھونڈو' ||
    lower === 'search file' ||
    lower === 'find file'
  ) {
    return {
      handled: true,
      actionName: 'file_search_clarify',
      replyText: isUrdu
        ? `یس سر، آپ کون سی فائل تلاش کرنا چاہتے ہیں؟ براہ کرم نام بتائیے۔`
        : `Yes Sir, which file would you like me to locate? Please state the name.`,
    };
  }

  // 0.2 CREATOR QUERY IN VOICE
  if (
    lower.includes('who made you') ||
    lower.includes('who created you') ||
    lower.includes('kisne banaya') ||
    lower.includes('کس نے بنایا') ||
    lower.includes('تمہیں کس نے بنایا') ||
    lower.includes('آپ کو کس نے بنایا')
  ) {
    return {
      handled: true,
      actionName: 'jarvis_creator',
      replyText: isUrdu ? 'مجھے حسان نے بنایا ہے سر۔' : 'I was created by Hasaan, Sir.',
    };
  }

  // 1. DIRECT SEARCH ON GOOGLE
  const googleSearchMatch =
    lower.match(/(?:search\s+(.+?)\s+on\s+google|google\s+(?:pe|par)\s+(.+?)\s+(?:search\s+karo|dhundo|dekho)|گوگل\s+پر\s+(.+?)\s+تلاش\s+کرو)/i) ||
    lower.match(/^google\s+(.+)$/i);

  if (googleSearchMatch) {
    const term = (googleSearchMatch[1] || googleSearchMatch[2] || googleSearchMatch[3] || '').trim();
    if (term) {
      const url = `https://www.google.com/search?q=${encodeURIComponent(term)}`;
      try {
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch {}
      return {
        handled: true,
        actionName: 'google_search',
        urlOpened: url,
        replyText: isUrdu
          ? `${isJarvis ? `فوراً، ${addressUr}۔ ` : ''}گوگل پر "${term}" تلاش کرنے کے لیے نیا ٹیب کھول دیا ہے۔ کیا میں مزید معلومات حاصل کروں؟`
          : `${isJarvis ? `Right away, ${address}. ` : ''}Searching Google for "${term}" in a new tab. Shall I review the top findings for you, ${address}?`,
      };
    }
  }

  // 2. DIRECT YOUTUBE SEARCH & PLAY
  const youtubeMatch =
    lower.match(/(?:youtube\s+(?:pe|par)\s+(.+?)\s+(?:chalao|play\s+karo|search\s+karo|lagao)|play\s+(.+?)\s+on\s+youtube|search\s+(.+?)\s+on\s+youtube|یوٹیوب\s+پر\s+(.+?)\s+(?:چلاؤ|تلاش\s+کرو))/i) ||
    lower.match(/^youtube\s+(.+)$/i);

  if (youtubeMatch) {
    const term = (youtubeMatch[1] || youtubeMatch[2] || youtubeMatch[3] || youtubeMatch[4] || '').trim();
    if (term) {
      const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(term)}`;
      try {
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch {}
      return {
        handled: true,
        actionName: 'youtube_search',
        urlOpened: url,
        replyText: isUrdu
          ? `${isJarvis ? `حکم کی تعمیل ہو رہی ہے، ${addressUr}۔ ` : ''}یوٹیوب پر "${term}" چلانے کے لیے نیا ٹیب کھول دیا ہے۔`
          : `${isJarvis ? `Initializing now, ${address}. ` : ''}Opening YouTube search for "${term}". Shall I queue up additional playback, ${address}?`,
      };
    }
  }

  // 3. OPEN POPULAR WEBSITES & SERVICES
  const sitesMap: Record<string, { url: string; nameEn: string; nameUr: string }> = {
    google: { url: 'https://www.google.com', nameEn: 'Google', nameUr: 'گوگل' },
    youtube: { url: 'https://www.youtube.com', nameEn: 'YouTube', nameUr: 'یوٹیوب' },
    classroom: { url: 'https://classroom.google.com', nameEn: 'Google Classroom', nameUr: 'گوگل کلاس روم' },
    github: { url: 'https://www.github.com', nameEn: 'GitHub', nameUr: 'گٹ ہب' },
    whatsapp: { url: 'https://web.whatsapp.com', nameEn: 'WhatsApp Web', nameUr: 'واٹس ایپ' },
    chatgpt: { url: 'https://chatgpt.com', nameEn: 'ChatGPT', nameUr: 'چیٹ جی پی ٹی' },
    wikipedia: { url: 'https://www.wikipedia.org', nameEn: 'Wikipedia', nameUr: 'ویکیپیڈیا' },
    gmail: { url: 'https://mail.google.com', nameEn: 'Gmail', nameUr: 'جی میل' },
    facebook: { url: 'https://www.facebook.com', nameEn: 'Facebook', nameUr: 'فیس بک' },
    twitter: { url: 'https://x.com', nameEn: 'X (Twitter)', nameUr: 'ٹوئٹر' },
    x: { url: 'https://x.com', nameEn: 'X (Twitter)', nameUr: 'ایکس' },
    instagram: { url: 'https://www.instagram.com', nameEn: 'Instagram', nameUr: 'انسٹاگرام' },
    linkedin: { url: 'https://www.linkedin.com', nameEn: 'LinkedIn', nameUr: 'لنکڈ ان' },
    netflix: { url: 'https://www.netflix.com', nameEn: 'Netflix', nameUr: 'نیٹ فلکس' },
    amazon: { url: 'https://www.amazon.com', nameEn: 'Amazon', nameUr: 'ایمازون' },
    reddit: { url: 'https://www.reddit.com', nameEn: 'Reddit', nameUr: 'ریڈٹ' },
  };

  // Check if user says "open [site]" or "[site] kholo"
  for (const [key, site] of Object.entries(sitesMap)) {
    if (
      lower.includes(`open ${key}`) ||
      lower.includes(`${key} kholo`) ||
      lower.includes(`${key} open karo`) ||
      lower.includes(`${key} chalao`) ||
      (key === 'classroom' && (lower.includes('open classroom') || lower.includes('classroom kholo') || lower.includes('کلاس روم کھولو')))
    ) {
      try {
        window.open(site.url, '_blank', 'noopener,noreferrer');
      } catch {}
      return {
        handled: true,
        actionName: `open_${key}`,
        urlOpened: site.url,
        replyText: isUrdu
          ? `${isJarvis ? `آپ کی خدمت میں حاضر ہوں، ${addressUr}۔ ` : ''}${site.nameUr} کا نیا ٹیب کھول دیا ہے۔ کیا مزید کوئی حکم ہے؟`
          : `${isJarvis ? `Right away, ${address}. ` : ''}Opening ${site.nameEn} in a new tab for you. What is your next instruction?`,
      };
    }
  }

  // 4. OPEN GENERIC NEW BROWSER TAB
  if (
    lower.includes('open browser') ||
    lower.includes('open new tab') ||
    lower.includes('browser open karo') ||
    lower.includes('browser kholo') ||
    lower.includes('نیا ٹیب کھولو') ||
    lower.includes('براؤزر کھولو') ||
    lower.includes('naya tab kholo')
  ) {
    try {
      window.open('https://www.google.com', '_blank', 'noopener,noreferrer');
    } catch {}
    return {
      handled: true,
      actionName: 'open_browser_tab',
      urlOpened: 'https://www.google.com',
      replyText: isUrdu
        ? `${isJarvis ? `فوراً، ${addressUr}۔ ` : ''}براؤزر کا نیا ٹیب کھول دیا ہے۔`
        : `${isJarvis ? `At your service, ${address}. ` : ''}Opened a new browser tab for you. How may I direct your workflow?`,
    };
  }

  // 5. FULL SCREEN CONTROL
  if (
    lower.includes('full screen') ||
    lower.includes('fullscreen') ||
    lower.includes('بڑی اسکرین کرو') ||
    lower.includes('فول اسکرین کرو') ||
    lower.includes('badi screen karo')
  ) {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    } catch {}
    return {
      handled: true,
      actionName: 'toggle_fullscreen',
      replyText: isUrdu
        ? `فل اسکرین موڈ ٹوگل کر دیا گیا ہے، ${addressUr}۔`
        : `Fullscreen mode toggled, ${address}. Viewport geometry updated to 100%.`,
    };
  }

  // 6. COPY TO CLIPBOARD
  if (
    lower.includes('copy this') ||
    lower.includes('copy karo') ||
    lower.includes('yeh copy karo') ||
    lower.includes('کاپی کرو') ||
    lower.includes('یہ کاپی کرو')
  ) {
    try {
      navigator.clipboard.writeText(query);
    } catch {}
    return {
      handled: true,
      actionName: 'copy_clipboard',
      replyText: isUrdu
        ? `متن کلپ بورڈ پر کاپی کر لیا گیا ہے، ${addressUr}۔`
        : `Copied to clipboard, ${address}. Data is cached for immediate pasting.`,
    };
  }

  // 7. TIME & DATE INQUIRY
  if (
    lower.includes('what time') ||
    lower.includes('time kya') ||
    lower.includes('وقت کیا ہوا') ||
    lower.includes('ٹائم کیا ہوا') ||
    lower.includes('today date') ||
    lower.includes('aaj ki date') ||
    lower.includes('آج کی تاریخ')
  ) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString(isUrdu ? 'ur-PK' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return {
      handled: true,
      actionName: 'check_time_date',
      replyText: isUrdu
        ? `${isJarvis ? `جناب! ` : ''}اس وقت ${timeStr} ہے اور آج ${dateStr} ہے۔`
        : `${isJarvis ? `At your service, ${address}. ` : ''}The current time is ${timeStr} on ${dateStr}. All internal chronometers are synchronized.`,
    };
  }

  // 8. TIMER / ALARM SETTING
  const timerMatch = lower.match(/(\d+)\s*(?:minute|min|منٹ|second|sec|سیکنڈ)/i);
  if (
    (lower.includes('timer') || lower.includes('alarm') || lower.includes('ٹائمر')) &&
    timerMatch
  ) {
    const num = parseInt(timerMatch[1], 10);
    const isSeconds = lower.includes('second') || lower.includes('sec') || lower.includes('سیکنڈ');
    const ms = (isSeconds ? num : num * 60) * 1000;
    setTimeout(() => {
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      } catch {}
    }, ms);

    return {
      handled: true,
      actionName: 'set_timer',
      replyText: isUrdu
        ? `فوراً، ${addressUr}۔ ${num} ${isSeconds ? 'سیکنڈ' : 'منٹ'} کا ٹائمر سیٹ کر دیا گیا ہے۔ مقررہ وقت پر آپ کو مطلع کر دوں گا۔`
        : `Right away, ${address}. Timer set for ${num} ${isSeconds ? 'seconds' : 'minutes'}. I shall alert you the instant it expires.`,
    };
  }

  // 9. PERSISTENT MEMORY COMMIT ("Remember that ...")
  if (
    lower.startsWith('remember that') ||
    lower.startsWith('please remember that') ||
    lower.startsWith('یاد رکھو کہ') ||
    lower.includes('yaad rakhna') ||
    lower.includes('yaad rakho')
  ) {
    const fact = query
      .replace(/^(?:remember that|please remember that|یاد رکھو کہ|yaad rakhna|yaad rakho)\s*/i, '')
      .trim();
    if (fact) {
      saveMemory(fact, 'preference');
      return {
        handled: true,
        actionName: 'memory_commit',
        replyText: isUrdu
          ? `میں نے یہ بات پرسنل میموری میں محفوظ کر لی ہے، ${addressUr}: "${fact}"۔`
          : `Committed to long-term memory, ${address}: "${fact}". It will be recalled whenever required.`,
      };
    }
  }

  // 10. PERSISTENT MEMORY RECALL
  if (
    lower.includes('what do you remember') ||
    lower.includes('میرے بارے میں کیا جانتے ہو') ||
    lower.includes('kya yaad hai') ||
    lower.includes('mera naam kya hai')
  ) {
    const memories = getStoredMemories();
    const list = memories.slice(0, 3).map((m) => m.fact).join('. ');
    return {
      handled: true,
      actionName: 'memory_recall',
      replyText: isUrdu
        ? `${addressUr}! آپ کے بارے میں میرے پاس یہ معلومات محفوظ ہیں: ${list || 'ابھی تک کوئی ذاتی ترجیح ریکارڈ نہیں ہے۔'}`
        : `Accessing memory core, ${address}. Here is what I recall: ${list || 'No personal context stored yet.'}`,
    };
  }

  // 11. CREATOR IDENTITY INQUIRY
  if (
    lower.includes('who made you') ||
    lower.includes('who created you') ||
    lower.includes('kis ne banaya') ||
    lower.includes('kisne banaya') ||
    lower.includes('کس نے بنایا') ||
    lower.includes('تمہیں کس نے')
  ) {
    return {
      handled: true,
      actionName: 'creator_inquiry',
      replyText: isUrdu
        ? `مجھے حسن نے بنایا ہے، ${addressUr}، اور میں آپ کا پرسنل اسسٹنٹ جاروس (JARVIS) ہوں۔`
        : `I am JARVIS, created by Hasan. Operating as your personal intelligent system, ${address}.`,
    };
  }

  // 12. MORNING / DAILY BRIEFING
  if (
    lower.includes('morning briefing') ||
    lower.includes('daily briefing') ||
    lower.includes('صبح کا بریفنگ') ||
    lower.includes('briefing do') ||
    lower.includes('بریفنگ دو') ||
    lower.includes('class due') ||
    lower.includes('assignments due') ||
    lower.includes('classroom deadlines')
  ) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString(isUrdu ? 'ur-PK' : 'en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    const classroomItems = getClassroomDueDatesFromMemory();
    const classroomList = classroomItems.map((m) => m.fact).join(' • ');
    const classroomNoteEn = classroomItems.length > 0
      ? ` Upcoming Google Classroom Deadlines from Persistent Memory: ${classroomList}.`
      : ' No immediate classroom deadlines found in memory.';
    const classroomNoteUr = classroomItems.length > 0
      ? ` گوگل کلاس روم کی آنے والی آخری تاریخیں: ${classroomList}۔`
      : ' میموری میں اس وقت کوئی فوری کلاس اسائنمنٹ نہیں ہے۔';

    return {
      handled: true,
      actionName: 'morning_briefing',
      replyText: isUrdu
        ? `صبح بخیر، ${addressUr}! آج ${dateStr} ہے اور وقت ${timeStr} ہے۔ تمام ٹاسک اور سسٹمز 100 فیصد پر فعال ہیں۔${classroomNoteUr} فرمائیے میں کیا خدمت کروں؟`
        : `Good morning, ${address}. Today is ${dateStr}, time is ${timeStr}. All task and intelligence systems are functioning at 100%.${classroomNoteEn} How may I assist you today?`,
    };
  }

  // No specific system action matched -> hand off to general intelligent answer engine
  return {
    handled: false,
    replyText: '',
  };
}
