import React, { useState } from 'react';
import { Copy, Check, Play, Sparkles, BookOpen } from 'lucide-react';
import { isUrduText } from '../utils/offlineEngine';
import { StudyFlashcardDeck, Flashcard } from './StudyFlashcardDeck';
import { CodeBlock } from './CodeBlock';

interface MarkdownViewProps {
  content: string;
  onRunCode?: (code: string, language: string) => void;
  onGenerateImagePrompt?: (prompt: string) => void;
}

// Helper to parse flashcards from JSON or Q/A text
function parseFlashcardsFromCode(code: string): Flashcard[] | null {
  try {
    // Try JSON parse first
    if (code.trim().startsWith('[') && code.trim().endsWith(']')) {
      const parsed = JSON.parse(code);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].question) {
        return parsed.map((item, idx) => ({
          id: `card-${idx}-${Date.now()}`,
          question: item.question || item.q || 'Question',
          answer: item.answer || item.a || 'Answer',
          difficulty: item.difficulty || 'Medium',
          hint: item.hint,
          formula: item.formula,
          category: item.category || 'Study',
        }));
      }
    }
  } catch {}

  // Parse custom text format (Q: ... A: ...)
  const lines = code.split('\n');
  const cards: Flashcard[] = [];
  let currentCard: Partial<Flashcard> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('Q:') || trimmed.startsWith('Question:')) {
      if (currentCard.question && currentCard.answer) {
        cards.push({
          id: `card-${cards.length}-${Date.now()}`,
          question: currentCard.question,
          answer: currentCard.answer,
          difficulty: currentCard.difficulty || 'Medium',
          hint: currentCard.hint,
          formula: currentCard.formula,
        });
      }
      currentCard = {
        question: trimmed.replace(/^(Q:|Question:)\s*/i, ''),
      };
    } else if (trimmed.startsWith('A:') || trimmed.startsWith('Answer:')) {
      currentCard.answer = trimmed.replace(/^(A:|Answer:)\s*/i, '');
    } else if (trimmed.startsWith('Hint:')) {
      currentCard.hint = trimmed.replace(/^Hint:\s*/i, '');
    } else if (trimmed.startsWith('Formula:')) {
      currentCard.formula = trimmed.replace(/^Formula:\s*/i, '');
    } else if (trimmed.startsWith('Difficulty:')) {
      const diff = trimmed.replace(/^Difficulty:\s*/i, '');
      if (diff === 'Easy' || diff === 'Medium' || diff === 'Hard') {
        currentCard.difficulty = diff;
      }
    }
  }

  if (currentCard.question && currentCard.answer) {
    cards.push({
      id: `card-${cards.length}-${Date.now()}`,
      question: currentCard.question,
      answer: currentCard.answer,
      difficulty: currentCard.difficulty || 'Medium',
      hint: currentCard.hint,
      formula: currentCard.formula,
    });
  }

  return cards.length > 0 ? cards : null;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({
  content,
  onRunCode,
  onGenerateImagePrompt,
}) => {
  const [copiedTableIndex, setCopiedTableIndex] = useState<number | null>(null);

  const handleCopyTable = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedTableIndex(index);
    setTimeout(() => setCopiedTableIndex(null), 2000);
  };

  // Parse markdown into structured segments: code blocks, tables, blockquotes, headers, paragraphs
  const renderFormattedContent = () => {
    if (!content) return null;

    // Split by code blocks first
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)(?:[:\s]([^\n]+))?\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let elementCounter = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const textBefore = content.substring(lastIndex, match.index);
      if (textBefore.trim()) {
        parts.push(
          <div key={`text-${elementCounter++}`}>
            {renderTextWithTables(textBefore, elementCounter)}
          </div>
        );
      }

      const rawLang = match[1] || 'text';
      const filename = match[2]?.trim();
      const code = match[3].trim();
      const codeIndex = elementCounter++;

      const isFlashcards =
        rawLang.toLowerCase() === 'flashcards' ||
        rawLang.toLowerCase() === 'flashcard' ||
        rawLang.toLowerCase() === 'cards' ||
        rawLang.toLowerCase() === 'card' ||
        rawLang.toLowerCase() === 'study-cards' ||
        ((code.includes('Q:') || code.includes('Question:')) && (code.includes('A:') || code.includes('Answer:'))) ||
        (rawLang.toLowerCase() === 'json' && code.includes('"question"') && code.includes('"answer"'));

      // If flashcard code block, render the interactive study flashcard deck directly!
      if (isFlashcards) {
        const parsedCards = parseFlashcardsFromCode(code);
        if (parsedCards) {
          parts.push(
            <StudyFlashcardDeck
              key={`deck-${codeIndex}`}
              cards={parsedCards}
              subject="Academic Flashcards"
              isUrdu={isUrduText(code)}
            />
          );
          lastIndex = match.index + match[0].length;
          continue;
        }
      }

      // Syntax Highlighted CodeBlock Component
      parts.push(
        <CodeBlock
          key={`code-${codeIndex}`}
          code={code}
          language={rawLang}
          filename={filename}
          onRunCode={onRunCode}
          onGenerateImagePrompt={onGenerateImagePrompt}
        />
      );

      lastIndex = match.index + match[0].length;
    }

    const remainingText = content.substring(lastIndex);
    if (remainingText.trim()) {
      parts.push(
        <div key={`text-end-${elementCounter++}`}>
          {renderTextWithTables(remainingText, elementCounter)}
        </div>
      );
    }

    return parts;
  };

  // Helper to render markdown tables and formatted text
  const renderTextWithTables = (text: string, baseIndex: number) => {
    const lines = text.split('\n');
    const nodes: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Check if start of a Markdown Table (line starts and ends with |)
      if (line.trim().startsWith('|') && line.trim().endsWith('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }

        const tableIndex = baseIndex + i;
        nodes.push(renderTable(tableLines, tableIndex));
        continue;
      }

      // Headers
      if (line.startsWith('### ')) {
        const headerText = line.replace('### ', '');
        const isUrdu = isUrduText(headerText);
        nodes.push(
          <h3
            key={`h3-${baseIndex}-${i}`}
            className={`text-lg sm:text-xl font-bold mt-5 mb-2 text-cyan-300 tracking-tight ${
              isUrdu ? 'font-urdu text-right' : ''
            }`}
          >
            {renderInlineMarkdown(headerText)}
          </h3>
        );
        i++;
        continue;
      }

      if (line.startsWith('#### ')) {
        const headerText = line.replace('#### ', '');
        const isUrdu = isUrduText(headerText);
        nodes.push(
          <h4
            key={`h4-${baseIndex}-${i}`}
            className={`text-base font-semibold mt-4 mb-1.5 text-indigo-300 tracking-tight ${
              isUrdu ? 'font-urdu text-right' : ''
            }`}
          >
            {renderInlineMarkdown(headerText)}
          </h4>
        );
        i++;
        continue;
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        const quoteText = line.replace('> ', '');
        const isUrdu = isUrduText(quoteText);
        nodes.push(
          <blockquote
            key={`quote-${baseIndex}-${i}`}
            className={`my-3 pl-4 pr-3 py-2 border-l-4 border-cyan-500 bg-slate-800/40 rounded-r-lg text-slate-300 italic ${
              isUrdu ? 'font-urdu text-right border-l-0 border-r-4 pr-4 pl-3 rounded-l-lg rounded-r-none' : ''
            }`}
          >
            {renderInlineMarkdown(quoteText)}
          </blockquote>
        );
        i++;
        continue;
      }

      // Horizontal rule
      if (line.trim() === '---' || line.trim() === '***') {
        nodes.push(
          <hr key={`hr-${baseIndex}-${i}`} className="my-5 border-slate-700/60" />
        );
        i++;
        continue;
      }

      // Bullet lists
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const bulletText = line.trim().substring(2);
        const isUrdu = isUrduText(bulletText);
        nodes.push(
          <div
            key={`li-${baseIndex}-${i}`}
            className={`flex items-start gap-2.5 my-1.5 text-slate-300 text-sm leading-relaxed ${
              isUrdu ? 'flex-row-reverse text-right font-urdu' : ''
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0"></span>
            <div>{renderInlineMarkdown(bulletText)}</div>
          </div>
        );
        i++;
        continue;
      }

      // Standard Paragraph
      if (line.trim()) {
        const isUrdu = isUrduText(line);
        nodes.push(
          <p
            key={`p-${baseIndex}-${i}`}
            className={`my-2 text-slate-200 text-sm sm:text-base leading-relaxed ${
              isUrdu ? 'font-urdu text-right text-base sm:text-lg leading-loose' : ''
            }`}
          >
            {renderInlineMarkdown(line)}
          </p>
        );
      }

      i++;
    }

    return nodes;
  };

  // Helper to render markdown tables
  const renderTable = (tableLines: string[], tableIndex: number) => {
    if (tableLines.length < 2) return null;

    const rawMarkdownTable = tableLines.join('\n');
    const headerRow = tableLines[0]
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());

    // Skip separator row (index 1)
    const bodyRows = tableLines.slice(2).map((row) =>
      row
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim())
    );

    return (
      <div
        key={`table-wrap-${tableIndex}`}
        className="my-4 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900/80 shadow-lg"
      >
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700 text-xs text-slate-300">
          <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Markdown Table
          </span>
          <button
            onClick={() => handleCopyTable(rawMarkdownTable, tableIndex)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-200 transition text-xs font-sans cursor-pointer"
          >
            {copiedTableIndex === tableIndex ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied Table</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Table</span>
              </>
            )}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-800/60 border-b border-slate-700/80">
                {headerRow.map((col, idx) => {
                  const isUrdu = isUrduText(col);
                  return (
                    <th
                      key={`th-${idx}`}
                      className={`px-4 py-3 font-semibold text-slate-200 tracking-wider ${
                        isUrdu ? 'font-urdu text-right' : ''
                      }`}
                    >
                      {renderInlineMarkdown(col)}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {bodyRows.map((row, rIdx) => (
                <tr
                  key={`tr-${rIdx}`}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  {row.map((cell, cIdx) => {
                    const isUrdu = isUrduText(cell);
                    return (
                      <td
                        key={`td-${rIdx}-${cIdx}`}
                        className={`px-4 py-3 text-slate-300 align-top ${
                          isUrdu ? 'font-urdu text-right' : ''
                        }`}
                      >
                        {renderInlineMarkdown(cell)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Inline formatting: [link](url), **bold**, `inline code`, *italic*
  const renderInlineMarkdown = (text: string): React.ReactNode => {
    // Process markdown links first: [title](url)
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    const partsWithLinks: Array<{ type: 'text' | 'link'; text: string; url?: string }> = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        partsWithLinks.push({ type: 'text', text: text.slice(lastIndex, match.index) });
      }
      partsWithLinks.push({ type: 'link', text: match[1], url: match[2] });
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < text.length) {
      partsWithLinks.push({ type: 'text', text: text.slice(lastIndex) });
    }

    return partsWithLinks.map((segment, segIdx) => {
      if (segment.type === 'link' && segment.url) {
        return (
          <a
            key={segIdx}
            href={segment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 hover:text-white border border-cyan-500/30 font-semibold text-xs transition cursor-pointer mx-1 align-baseline shadow-xs"
          >
            <span>{segment.text}</span>
            <span className="text-[10px]">↗</span>
          </a>
        );
      }

      // Process bold, inline code, italic
      const parts = segment.text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
      return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const inner = part.slice(2, -2);
          return (
            <strong key={`${segIdx}-${index}`} className="font-bold text-white">
              {inner}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          const inner = part.slice(1, -1);
          return (
            <code
              key={`${segIdx}-${index}`}
              className="px-1.5 py-0.5 rounded-md bg-[#161822] border border-[#2b2d3d] text-cyan-300 font-code text-xs font-medium"
            >
              {inner}
            </code>
          );
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          const inner = part.slice(1, -1);
          return (
            <em key={`${segIdx}-${index}`} className="italic text-slate-300">
              {inner}
            </em>
          );
        }
        return part;
      });
    });
  };

  return <div className="space-y-1">{renderFormattedContent()}</div>;
};
