export type MemoryCategory = 'preference' | 'project' | 'profile' | 'system' | 'classroom' | 'schedule';

export interface MemoryFact {
  id: string;
  category: MemoryCategory;
  fact: string;
  learnedAt: number;
}

const STORAGE_KEY = 'export_ai_persistent_memory';

const DEFAULT_MEMORIES: MemoryFact[] = [
  {
    id: 'mem-creator',
    category: 'system',
    fact: 'Created and engineered by Hasan as Export AI with Gemini 3.8 Flash intelligence.',
    learnedAt: 1718000000000,
  },
  {
    id: 'mem-lang',
    category: 'preference',
    fact: 'Bilingual fluency in English and Urdu with automatic dialect detection.',
    learnedAt: 1718000050000,
  },
  {
    id: 'mem-classroom-1',
    category: 'classroom',
    fact: 'Google Classroom: Computer Science 101 - Algorithm Analysis & Big-O Notation due on Friday at 11:59 PM.',
    learnedAt: 1718000075000,
  },
  {
    id: 'mem-classroom-2',
    category: 'classroom',
    fact: 'Google Classroom: Linear Algebra - Vector Spaces & Eigenvalues Assignment due Tomorrow at 5:00 PM.',
    learnedAt: 1718000085000,
  },
  {
    id: 'mem-classroom-3',
    category: 'classroom',
    fact: 'گوگل کلاس روم: فزکس لیب رپورٹ 2 کل شام 5 بجے تک جمع کروانی ہے۔',
    learnedAt: 1718000095000,
  },
  {
    id: 'mem-mode',
    category: 'profile',
    fact: 'Equipped with software-rendered holographic avatar HUD, push-to-talk, and offline engine.',
    learnedAt: 1718000100000,
  },
];

export function getStoredMemories(): MemoryFact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load memories:', err);
  }
  return DEFAULT_MEMORIES;
}

export function saveMemory(fact: string, category: MemoryFact['category'] = 'preference'): MemoryFact {
  const current = getStoredMemories();
  const newMem: MemoryFact = {
    id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    category,
    fact: fact.trim(),
    learnedAt: Date.now(),
  };
  const updated = [newMem, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return newMem;
}

export function deleteMemory(id: string): void {
  const current = getStoredMemories();
  const updated = current.filter((m) => m.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export function clearAllMemories(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch {}
}

/**
 * Retrieve all Google Classroom assignments and deadlines stored in Persistent Memory.
 */
export function getClassroomDueDatesFromMemory(): MemoryFact[] {
  const memories = getStoredMemories();
  return memories.filter(
    (m) =>
      m.category === 'classroom' ||
      m.category === 'schedule' ||
      m.fact.toLowerCase().includes('classroom') ||
      m.fact.toLowerCase().includes('due') ||
      m.fact.toLowerCase().includes('assignment') ||
      m.fact.includes('کلاس روم') ||
      m.fact.includes('اسائنمنٹ')
  );
}

/**
 * Sync Google Classroom assignments into Persistent Memory
 */
export function syncGoogleClassroomCoursework(
  items: { course: string; assignment: string; dueDate: string }[]
): void {
  const current = getStoredMemories();
  const existingFacts = new Set(current.map((c) => c.fact.toLowerCase()));

  for (const item of items) {
    const factText = `Google Classroom: ${item.course} - ${item.assignment} due on ${item.dueDate}.`;
    if (!existingFacts.has(factText.toLowerCase())) {
      saveMemory(factText, 'classroom');
      existingFacts.add(factText.toLowerCase());
    }
  }
}
