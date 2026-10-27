import { PromptTemplate } from '../types';

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // 1. Text & Script Writing
  {
    id: 'yt-script',
    category: 'writing',
    iconName: 'Video',
    titleEn: 'YouTube Script with Scene Cues',
    titleUr: 'یوٹیوب ویڈیو اسکرپٹ مع کیمرہ ڈائریکشن',
    descriptionEn: 'High-retention video script with visual hook, sound effects, and voiceover cues.',
    descriptionUr: 'پرکشش یوٹیوب اسکرپٹ جس میں ہوک، ساؤنڈ ایفیکٹس اور سین تفصیلات شامل ہوں۔',
    promptEn: `Write a high-retention 5-minute YouTube video script about "How Artificial Intelligence is Transforming Everyday Life". Include:
- Hook (first 15 seconds) to grab viewer attention
- [CAMERA DIRECTION] and [VISUAL CUES] for b-roll footage
- [SFX / MUSIC] suggestions for transitions
- Engaging Voiceover script broken down into 4 clear chapters
- A compelling Call-To-Action (CTA) at the end.`,
    promptUr: `مصنوعی ذہانت (AI) کے روزمرہ زندگی پر اثرات کے بارے میں ایک 5 منٹ کا دلکش یوٹیوب ویڈیو اسکرپٹ تیار کریں۔ اس میں درج ذیل شامل کریں:
- پہلے 15 سیکنڈ کا پرکشش ہوک (Hook)
- کیمرہ اینگلز اور سین بائی سین ویژول کٹس
- پس منظر میوزک اور ساؤنڈ ایفیکٹس کے اشارے
- واضح وائس اوور اور اختتام پر سبسکرائب کرنے کی دلکش دعوت۔`,
  },
  {
    id: 'dramatic-story',
    category: 'writing',
    iconName: 'BookOpen',
    titleEn: 'Engaging Story with Moral Lesson',
    titleUr: 'ایک پر اثر اخلاقی کہانی',
    descriptionEn: 'Narrative storytelling with rich character arcs, suspense, and emotional payoff.',
    descriptionUr: 'سسپنس اور گہرے کرداروں سے سجی ایک جذباتی اور سبق آموز کہانی۔',
    promptEn: `Write a compelling narrative short story about an elderly clockmaker in a mountain village who discovers an unusual brass pocket watch that pauses time for 60 seconds. Weave suspense, vivid environmental imagery, emotional depth, and a profound moral dilemma.`,
    promptUr: `پہاڑی وادی میں رہنے والے ایک بوڑھے گھڑی ساز کے بارے میں ایک گہری اور پراسرار کہانی لکھیں جس کو ایک ایسی قدیم گھڑی ملتی ہے جو وقت کو ایک منٹ کے لیے روک سکتی ہے۔ کہانی میں سسپنس، خوبصورت منظر نگاری اور ایک اہم اخلاقی سبق شامل کریں۔`,
  },
  {
    id: 'formal-email',
    category: 'writing',
    iconName: 'Mail',
    titleEn: 'Executive Business Proposal Email',
    titleUr: 'پیشہ ورانہ کاروباری ای میل و پیشکش',
    descriptionEn: 'Polished proposal with strong value proposition and call-to-action.',
    descriptionUr: 'کاروباری شراکت داری کے لیے باوقار اور پر اثر رسمی ای میل۔',
    promptEn: `Draft a professional business proposal email to a enterprise client pitching our AI-driven software optimization platform. Include an attention-grabbing subject line, concise executive value proposition, bulleted client ROI highlights, and a frictionless call-to-action for a 15-minute demo.`,
    promptUr: `ایک بین الاقوامی کلائنٹ کے لیے ایک باوقار اور پر اثر کاروباری پروپوزل ای میل تحریر کریں۔ جس میں شاندار سبجیکٹ لائن، سروسز کے فوائد، منافع کی یقین دہانی اور مختصر آن لائن میٹنگ کے لیے دوستانہ دعوت شامل ہو۔`,
  },

  // 2. Coding & Software Development
  {
    id: 'python-async',
    category: 'coding',
    iconName: 'Code',
    titleEn: 'Python Async Scraper + Error Handling',
    titleUr: 'پائتھون ایسنک اسکریپر و ایرر ہینڈلنگ',
    descriptionEn: 'Production-ready Python code with concurrency, retries, and typing.',
    descriptionUr: 'مکمل پائتھون کوڈ جس میں ری ٹرائی لاجک اور خرابیوں سے نمٹنے کے طریقے شامل ہوں۔',
    promptEn: `Write a clean, production-ready Python script using aiohttp and asyncio to scrape data from multiple API endpoints concurrently. Include:
1. Exponential backoff and retry mechanism
2. Type annotations and docstrings
3. Rate limiting with asyncio.Semaphore
4. Graceful error handling for timeouts and network drops.`,
    promptUr: `پائتھون میں aiohttp اور asyncio کا استعمال کرتے ہوئے ایک مکمل ایسنکرونس اسکرپٹ لکھیں جو مختلف ویب سائٹس یا اے پی آئی سے بیک وقت ڈیٹا جمع کرے۔ اس میں ایرر ہینڈلنگ، ری ٹرائی میکانزم اور ٹائپنگ شامل ہو۔`,
  },
  {
    id: 'debug-code',
    category: 'coding',
    iconName: 'Bug',
    titleEn: 'Debug & Fix Code Errors',
    titleUr: 'کوڈ میں خرابیوں کی نشاندہی اور درستگی',
    descriptionEn: 'Deep root-cause analysis, corrected code, and performance optimization.',
    descriptionUr: 'کوڈ میں موجود بگس کی جڑ تک پہنچیں اور درست شدہ ورژن حاصل کریں۔',
    promptEn: `Here is a buggy JavaScript function that attempts to debounce an API search query and fetch suggestions, but causes memory leaks and race conditions:

\`\`\`javascript
function searchHandler(e) {
  let timer;
  clearTimeout(timer);
  timer = setTimeout(async () => {
    let res = await fetch('/api/search?q=' + e.target.value);
    let data = await res.json();
    document.getElementById('results').innerHTML = data.map(item => item.name).join('');
  }, 300);
}
\`\`\`

Please analyze the root causes of the bugs (closure scope, race conditions, XSS vulnerability), provide the corrected clean code with AbortController, and explain key improvements.`,
    promptUr: `درج ذیل جاوا اسکرپٹ کوڈ میں میموری لیک اور ریس کنڈیشنز کے مسائل ہیں:
تجزیہ کریں کہ غلطی کہاں ہے، مکمل درست شدہ کوڈ فراہم کریں اور بہتری کی وضاحت کریں۔`,
  },
  {
    id: 'landing-page-html',
    category: 'coding',
    iconName: 'Layout',
    titleEn: 'Modern Responsive Landing Page (HTML/Tailwind)',
    titleUr: 'جدید رسپانسیو ویب سائٹ لے آؤٹ',
    descriptionEn: 'Sleek, modern hero section, feature grid, and pricing cards in HTML/Tailwind.',
    descriptionUr: 'خوبصورت ہیرو سیکشن، فیچرز اور پرائسنگ کارڈز کا مکمل HTML/CSS کوڈ۔',
    promptEn: `Generate a complete, self-contained modern HTML landing page styled with Tailwind CSS CDN for a high-tech AI creative studio. Include:
- Glassmorphic navigation header with logo and CTA
- Hero section with bold gradient typography and interactive search input
- 3-card feature grid with hover scale animations
- Sleek dark theme color palette (slate-900, cyan-400 accents).`,
    promptUr: `ایک جدید ہائی ٹیک اے آئی اسٹوڈیو کے لیے مکمل HTML اور Tailwind CSS کوڈ لکھیں جس میں گلاس مورفک ہیڈر، پرکشش ہیرو سیکشن، فیچر کارڈز اور ڈارک موڈ شامل ہو۔`,
  },

  // 3. Visual & Image Prompt Designing
  {
    id: 'village-character',
    category: 'prompts',
    iconName: 'Sparkles',
    titleEn: '3D Cute Vegetable Vendor (Midjourney / 3D Render)',
    titleUr: '3D سبزیوں کا کیریکٹر دیہاتی ماحول میں',
    descriptionEn: 'Detailed 3D character prompt with lighting, camera angle, and rendering engine specs.',
    descriptionUr: 'مڈجرنی اور دیگر ٹولز کے لیے تفصیلی 3D پرامپٹ مع کیمرہ اینگل و روشنی۔',
    promptEn: `Generate a master 3D character design prompt for Midjourney v6 / Flux:
Subject: A cheerful, animated 3D character of an elderly friendly vegetable vendor wearing traditional colorful embroidered attire in a vibrant traditional village bazaar.
Include:
- 3D Style: Pixar / Disney animated film aesthetic, soft subsurface scattering, tactile textures
- Camera: 50mm portrait lens, shallow depth of field (f/1.8), low angle shot
- Lighting: Golden hour natural sunrays, soft warm bounce, rim lighting on cloth fibers
- Engine specs: Octane Render 8K, Unreal Engine 5 render, raytraced ambient occlusion
- Aspect ratio: --ar 16:9`,
    promptUr: `مڈجرنی (Midjourney) کے لیے ایک تفصیلی 3D کریکٹر پرامپٹ بنائیں:
موضوع: دیہاتی ماحول میں روایتی لباس میں ملبوس سبزیوں کا ایک خوش اخلاق 3D اینیمیٹڈ کردار۔
کیمرہ اینگل، گولڈن آور لائٹنگ، پکسار 3D اسٹائل، اور آکٹین 8K رینڈر کی مکمل تفصیلات شامل کریں۔`,
  },
  {
    id: 'ai-video-cinematic',
    category: 'prompts',
    iconName: 'Video',
    titleEn: 'Cinematic AI Video Prompt (Sora / Runway Gen-3 / Kling)',
    titleUr: 'تفصیلی سنیماٹک AI ویڈیو پرامپٹ (Sora / Runway / Kling)',
    descriptionEn: 'Ultra-detailed video generation prompt with camera motion, frame rate, lighting, and physics dynamics.',
    descriptionUr: 'کیمرہ موومنٹ، رفتار، روشنی اور فزکس کے ساتھ مکمل تفصیلی AI ویڈیو پرامپٹ۔',
    promptEn: `Generate a hyper-detailed cinematic prompt for an AI video generation model (OpenAI Sora / Runway Gen-3 / Kling / Luma Dream Machine):

Theme: [Describe your idea, e.g., "A wandering samurai walking through a cherry blossom forest in mystical morning mist"]

Please structure the prompt with:
1. Master Video Prompt: A dense, evocative, single copy-pasteable paragraph optimized for Runway Gen-3 / Sora / Kling
2. Subject & Environmental Detail: Character appearance, attire, surroundings, and micro-textures
3. Camera Movement & Framing: Camera lens (e.g., 35mm anamorphic), shot type (low-angle tracking, slow push-in, drone pull-back), and depth of field
4. Lighting & Atmospheric Mood: Volumetric light shafts, rim lighting, atmospheric haze, and cinematic color grading
5. Motion Dynamics & Physics: Fluid natural pacing, cloth and hair physics, realistic speed, and particle movement
6. Negative Prompt & Parameters: Aspect ratio (--ar 16:9), seed advice, framerate (24fps), and distortion suppression.`,
    promptUr: `جدید AI ویڈیو ماڈلز (Sora, Runway Gen-3, Kling, Luma) کے لیے ایک انتہائی تفصیلی اور سنیماٹک پرامپٹ تیار کریں۔ جس میں کیمرہ اینگل و موومنٹ، روشنی، رفتار، ماحول اور نیگیٹو پرامپٹ کے تمام تکنیکی نکات شامل ہوں۔`,
  },
  {
    id: 'cyberpunk-city',
    category: 'prompts',
    iconName: 'Image',
    titleEn: 'Cinematic Cyberpunk Neo-City (Octane 8K)',
    titleUr: 'سائبر پنک نیو سٹی (8K سنیماٹک رینڈر)',
    descriptionEn: 'Atmospheric sci-fi cityscape with volumetric fog, neon reflections, and drone shot.',
    descriptionUr: 'نیون لائٹس، بارش کے قطرے اور وسیع ڈرون شاٹ کے ساتھ جدید سائنسی شہر۔',
    promptEn: `Generate a hyper-detailed cinematic prompt for an awe-inspiring rain-slicked Cyberpunk metropolis at midnight:
Include:
- Subject: Towering holographic skyscrapers, flying vehicles weaving through light beams, neon street food stalls below
- Camera: Ultra-wide 24mm anamorphic lens, bird's-eye drone angle with subtle lens flare
- Atmosphere: Wet asphalt reflections, volumetric fog, cyan and magenta chiaroscuro lighting
- Technical keywords: Raytracing, Octane Render 8K, Unreal Engine 5, cinematic color grading, photorealistic photogrammetry
- Aspect Ratio: --ar 21:9.`,
    promptUr: `بارش میں بھیگے ہوئے ایک مستقبل کے سائبر پنک شہر کا الٹرا وائیڈ 8K سنیماٹک پرامپٹ تیار کریں جس میں نیون انعکاس، ڈرون اینگل اور اینامورفک لینس کی تفصیلات ہوں۔`,
  },

  // 4. Data, Tables & Structuring
  {
    id: 'feature-table',
    category: 'formatting',
    iconName: 'Table',
    titleEn: 'Multi-Criteria Feature Comparison Matrix',
    titleUr: 'جامع فیچر موازنہ جدول (Markdown Table)',
    descriptionEn: 'Clean Markdown table comparing architectures, performance, and trade-offs.',
    descriptionUr: 'مختلف ٹیکنالوجیز یا مصنوعات کے درمیان جامع اور واضح موازنہ جدول۔',
    promptEn: `Create a comprehensive Markdown Comparison Table comparing the top modern Frontend Frameworks: React 19, Vue 3, Svelte 5, and Next.js 15.
Columns should include:
| Framework | Core Paradigm | Performance / Bundle Size | State Management | Learning Curve | Best Suited For |
Follow up with an executive 3-bullet summary of recommendations for startups vs enterprise.`,
    promptUr: `جدید ویب فریم ورکس (React 19, Vue 3, Svelte 5, Next.js 15) کا ایک جامع مارک ڈاؤن جدول (Markdown Table) بنائیں جس میں کارکردگی، بنڈل سائز، آسانیاں اور بہترین استعمال کے نکات شامل ہوں۔`,
  },
  {
    id: 'notes-to-table',
    category: 'formatting',
    iconName: 'FileSpreadsheet',
    titleEn: 'Convert Unstructured Notes into Structured Table',
    titleUr: 'بے ترتیب نوٹس کو منظم جدول میں تبدیل کریں',
    descriptionEn: 'Transform messy transcripts or bullet points into an organized executive database.',
    descriptionUr: 'کسی بھی بے ربط متن یا نوٹس کو فوری طور پر خوبصورت جدول میں ترتیب دیں۔',
    promptEn: `Transform the following unstructured project status notes into an immaculate, professional Markdown Table with columns for [Task ID, Work Item, Assignee, Priority, Status, Blockers, Target Date]:

"Need to complete auth module by next Tuesday, John is on it, currently waiting for OAuth client credentials. Sarah is working on the checkout stripe integration, high priority, currently 70% done, target Friday. The landing page SEO optimization is assigned to Alex, low priority, completed yesterday. Database migration script by Dave, urgent priority, encountered index lock bug, deadline tomorrow."`,
    promptUr: `درج ذیل بے ترتیب نوٹس کو ایک منظم مارک ڈاؤن ٹیبل (Task ID, Work Item, Assignee, Priority, Status, Target Date) میں تبدیل کریں تاکہ ٹیم کے لیے سمجھنا آسان ہو۔`,
  },

  // 5. Translation & Language Support
  {
    id: 'en-to-ur',
    category: 'translation',
    iconName: 'Languages',
    titleEn: 'English to Elegant Urdu Translation with Nuance',
    titleUr: 'انگریزی سے شستہ و فصیح اردو ترجمہ',
    descriptionEn: 'Linguistic accuracy with cultural idioms, formality levels, and vocabulary breakdown.',
    descriptionUr: 'معیاری اردو ترجمہ مع جملوں کی خوبصورتی، رسمی انداز اور اہم الفاظ کا تجزیہ۔',
    promptEn: `Translate the following passage into refined, eloquent literary Urdu (شستہ اردو):

"Innovation is not merely the invention of novel gadgets; it is the courage to reimagine what is possible when human empathy converges with technological ingenuity. In the heart of adversity, the most enduring solutions are born."

Provide:
1. The literary translation in Nastaliq/Urdu script
2. A more colloquial / accessible everyday translation
3. Breakdown of key vocabulary terms and their cultural nuances.`,
    promptUr: `مندرجہ بالا انگریزی پیراگراف کا شستہ اور باوقار اردو میں ترجمہ کریں، ساتھ ہی عام بول چال کا ورژن اور اہم الفاظ کے معانی بھی واضح کریں۔`,
  },
  {
    id: 'grammar-polisher',
    category: 'translation',
    iconName: 'CheckCheck',
    titleEn: 'Urdu & English Grammar & Style Polisher',
    titleUr: 'گرامر، املا اور جملوں کی ساخت درست کریں',
    descriptionEn: 'Identifies syntactical errors, awkward phrasing, and provides elegant rewrites.',
    descriptionUr: 'تحریر میں موجود املا، رموزِ اوقاف اور گرائمر کی غلطیوں کی اصلاح۔',
    promptEn: `Please proofread and enhance the following bilingual text. Fix any grammatical, spelling, or structural weaknesses, and present an upgraded version that sounds authoritative and polished:

"ہماری کمپنی جدید ترین حل فراہم کرتی ہے تاکہ آپ کا کاروبار زیادہ ترقی کر سکیں اور ہم امید کرتا ہوں کہ آپ ہمارا پروپوزل کو قبول فرمائیں گے."`,
    promptUr: `درج ذیل اردو تحریر میں املا، تذکیر و تانیث اور گرائمر کی غلطیاں درست کر کے اسے ایک انتہائی پیشہ ورانہ اور باوقار شکل میں دوبارہ تحریر کریں۔`,
  },

  // 6. Learning & Planning System
  {
    id: 'concept-explainer',
    category: 'learning',
    iconName: 'GraduationCap',
    titleEn: 'Explain Complex Concept in 3 Multi-Tier Levels',
    titleUr: 'پیچیدہ سائنسی مفہوم کی سہ سطحی آسان وضاحت',
    descriptionEn: 'Explain Like I\'m 5, High School Student, and Senior Professional.',
    descriptionUr: 'کسی بھی مشکل موضوع کو بچوں، طلباء اور پیشہ ور افراد کے لیے مختلف سطحوں پر سمجھائیں۔',
    promptEn: `Explain the concept of "Quantum Computing & Superposition" in 3 distinct tiers:
1. Level 1: In 5-Year-Old Terms (Use a playful, unforgettable real-world analogy)
2. Level 2: High School Physics Student (Clear mechanisms: qubits vs bits, wave-particle duality)
3. Level 3: Computer Scientist / Engineer (Quantum gates, entanglement, practical algorithms like Shor's, and decoherence challenges)
Include a brief Markdown summary table of classical vs quantum computing at the end.`,
    promptUr: `کوانٹم کمپیوٹنگ (Quantum Computing) کے تصور کو تین مختلف سطحوں پر آسان الفاظ میں سمجھائیں:
1. 5 سال کے بچے کے لیے (دلچسپ تمثیل کے ذریعے)
2. اسکول کے طالب علم کے لیے (بنیادی سائنسی اصول)
3. سافٹ ویئر انجینئر کے لیے (تکنیکی گہرائی اور الگورتھمز)
آخر میں روایتی اور کوانٹم کمپیوٹر کا تقابلی جدول بھی پیش کریں۔`,
  },
  {
    id: 'study-plan',
    category: 'learning',
    iconName: 'Calendar',
    titleEn: '30-Day Full-Stack Mastery Study Timetable',
    titleUr: '30 روزہ جامع تعلیمی و مطالعاتی شیڈول',
    descriptionEn: 'Daily hourly schedule, milestone checkpoints, and habit tracking matrix.',
    descriptionUr: 'ہر ہفتے اور دن کے ٹارگٹس پر مشتمل پریکٹیکل اسٹڈی ٹائم ٹیبل۔',
    promptEn: `Design an intensive, realistic 30-Day Study Schedule for mastering Modern TypeScript and React 19. Structure the plan as:
- Weekly phases (Week 1: Deep JS/TS, Week 2: React 19 Core & Hooks, Week 3: Fullstack Server & State, Week 4: Capstone Project)
- Daily breakdown with 2-hour daily slots (Theory, Practical Coding, Debugging)
- A formatted Markdown checklist table for tracking progress.`,
    promptUr: `جدید ٹیکنالوجی اور پروگرامنگ سیکھنے کے لیے 30 دن کا جامع ٹائم ٹیبل تیار کریں جس میں روزانہ کے اوقات، ہفتہ وار اہداف اور پیشرفت ناپنے کا جدول شامل ہو۔`,
  },

  // 7. Expert Advisor (RAG-Driven Academic Research & Study Engine)
  {
    id: 'rag-academic-thesis',
    category: 'advisor',
    iconName: 'Compass',
    titleEn: 'Academic RAG Synthesis: Transformer Attention Mechanics',
    titleUr: 'علمی ریسرچ RAG تجزیہ: ٹرانسفارمر اٹینشن میکینزم',
    descriptionEn: 'Full academic paper structure with mathematical formulation, comparison table, and citations.',
    descriptionUr: 'مقالے کی مکمل ساخت مع ریاضیاتی مساوات، تقابلی جدول اور پیئر ریویو شدہ حوالہ جات۔',
    promptEn: `Execute an Academic Expert Advisor RAG analysis on:
"Mathematical Foundations, Self-Attention Scaled Dot-Product, and Information Bottlenecks in Transformer Architectures".

Format as a formal graduate-level research brief:
1. [RETRIEVED KNOWLEDGE DOMAIN & RAG INDEX]
2. Abstract & Executive Synthesis
3. Conceptual Taxonomy & Formal Mathematical Formulations (derive Softmax(QK^T / sqrt(d_k))V)
4. Multi-Perspective Comparative Paradigm Table (Transformers vs RNNs vs State-Space Models/Mamba)
5. Methodological Limitations & Future Research Directions
6. Scholarly Bibliography with formal APA/IEEE citations [1], [2], [3].`,
    promptUr: `ماہر تعلیمی مشیر (Academic RAG) کے تحت درج ذیل ریسرچ عنوان پر تفصیلی علمی مقالہ تیار کریں:
"ٹرانسفارمرز میں سیلف اٹینشن (Self-Attention) کے ریاضیاتی اصول اور انفارمیشن تھیوری"
اس میں فارمل اصطلاحات، ریاضیاتی ماڈلنگ، تقابلی جدول، اور سائنسی حوالہ جات شامل کریں۔`,
  },
  {
    id: 'rag-neuro-science',
    category: 'advisor',
    iconName: 'GraduationCap',
    titleEn: 'RAG Study Brief: Neuroplasticity & Memory Consolidation',
    titleUr: 'علمی RAG بریف: نیوروپلاسٹیسٹی اور میموری فریم ورک',
    descriptionEn: 'Deep cognitive neuroscience breakdown with empirical trials and comparative paradigms.',
    descriptionUr: 'سائنسی بنیادوں اور تجرباتی شواہد پر مبنی گہرا علمی تجزیاتی مطالعہ۔',
    promptEn: `Produce an Academic Expert Advisor RAG research synthesis on:
"Synaptic Plasticity, Long-Term Potentiation (LTP), and Systems-Level Memory Consolidation from Hippocampus to Neocortex".

Provide formal conceptual taxonomy, molecular pathway mechanisms (NMDA receptors, CaMKII activation), a comparative paradigm table of consolidation theories, and empirical research citations.`,
    promptUr: `نیورو سائنس اور یادداشت کے عمل (Memory Consolidation) پر ایک جامع اکیڈمک ریسرچ بریف تیار کریں جس میں حیاتیاتی میکانزم، تقابلی ماڈلز اور معتبر سائنسی حوالہ جات شامل ہوں۔`,
  },

  // 8. Custom AI Prompt Generator
  {
    id: 'master-system-prompt',
    category: 'customPrompt',
    iconName: 'Cpu',
    titleEn: 'Master AI Assistant System Prompt Generator',
    titleUr: 'خصوصی جیمنی ماسٹر پرامپٹ جنریٹر',
    descriptionEn: 'Generate, inspect, and copy high-potency system prompts for any LLM task.',
    descriptionUr: 'کسی بھی AI کو ماہر اسسٹنٹ بنانے کے لیے بہترین سسٹم پرامپٹ حاصل کریں۔',
    promptEn: `Generate the ultimate, fully customized Master System Prompt that transforms any AI model into a world-class Full-Stack Technical Architect and Creative Director. Format it with clean sections: Role & Persona, Core Directives, Formatting Rules, Error Protocol, and Output Examples.`,
    promptUr: `کسی بھی مصنوعی ذہانت کے ماڈل کے لیے ایک مکمل ماسٹر سسٹم پرامپٹ تیار کریں تاکہ وہ جیمنی کی طرح تفصیلی، منظم اور بلا جھجک بہترین جوابات فراہم کر سکے۔`,
  },
];
