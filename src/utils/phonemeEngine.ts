export interface PhonemeShape {
  jawOpen: number;     // 0 (closed) to 1 (wide)
  mouthWidth: number;  // 0.8 (puckered) to 1.25 (spread)
  mouthRound: number;  // 0 (flat) to 1 (round 'o')
  lipClosure: number;  // 0 (open) to 1 (pressed 'm', 'b')
}

// Unicode character reduction map for universal language mouth articulation
export function derivePhonemeFromChar(char: string): PhonemeShape {
  const c = (char || '').toLowerCase();

  // 1. Bilabial closures: m, b, p, م, ب, پ, м, б, п
  if (/[mbpمبپмбп]/i.test(c)) {
    return { jawOpen: 0.08, mouthWidth: 0.95, mouthRound: 0.0, lipClosure: 0.95 };
  }

  // 2. Open vowels: a, ah, o, آ, ا, ہ, ع, ح, а, о
  if (/[aáàâäآاہعحао]/i.test(c)) {
    return { jawOpen: 0.85, mouthWidth: 1.05, mouthRound: 0.1, lipClosure: 0.0 };
  }

  // 3. Spreads: e, i, ee, ی, ے, y, е, и
  if (/[eiéèêëyیےеи]/i.test(c)) {
    return { jawOpen: 0.45, mouthWidth: 1.24, mouthRound: 0.0, lipClosure: 0.0 };
  }

  // 4. Rounds: u, o, oo, w, و, у, ю
  if (/[uouúùûüwوую]/i.test(c)) {
    return { jawOpen: 0.52, mouthWidth: 0.82, mouthRound: 0.95, lipClosure: 0.05 };
  }

  // 5. Labiodentals: f, v, ف, ф, в
  if (/[fvفфв]/i.test(c)) {
    return { jawOpen: 0.22, mouthWidth: 1.05, mouthRound: 0.0, lipClosure: 0.4 };
  }

  // 6. Dentals & Sibilants: s, z, t, d, n, r, l, س, ص, ز, ت, د, ن, ر, ل
  if (/[sztdnrlسصزتدنرلسзтднрл]/i.test(c)) {
    return { jawOpen: 0.28, mouthWidth: 1.15, mouthRound: 0.0, lipClosure: 0.0 };
  }

  // Default neutral mouth
  return { jawOpen: 0.12, mouthWidth: 1.0, mouthRound: 0.0, lipClosure: 0.0 };
}
