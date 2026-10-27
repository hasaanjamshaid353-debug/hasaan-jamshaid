import React, { useState, useMemo } from 'react';
import { Copy, Check, Play, Sparkles, WrapText, Hash } from 'lucide-react';
import Prism from '../utils/prism';

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  onRunCode?: (code: string, language: string) => void;
  onGenerateImagePrompt?: (prompt: string) => void;
  defaultLineNumbers?: boolean;
}

// Normalize language identifier and resolve aliases
function normalizeLanguage(rawLang?: string): { langKey: string; displayName: string } {
  if (!rawLang) {
    return { langKey: 'text', displayName: 'Plain Text' };
  }

  const clean = rawLang.trim().toLowerCase();

  const languageMap: Record<string, { langKey: string; displayName: string }> = {
    js: { langKey: 'javascript', displayName: 'JavaScript' },
    javascript: { langKey: 'javascript', displayName: 'JavaScript' },
    ts: { langKey: 'typescript', displayName: 'TypeScript' },
    typescript: { langKey: 'typescript', displayName: 'TypeScript' },
    jsx: { langKey: 'jsx', displayName: 'React JSX' },
    tsx: { langKey: 'tsx', displayName: 'React TSX' },
    py: { langKey: 'python', displayName: 'Python' },
    python: { langKey: 'python', displayName: 'Python' },
    sh: { langKey: 'bash', displayName: 'Bash' },
    bash: { langKey: 'bash', displayName: 'Bash' },
    shell: { langKey: 'bash', displayName: 'Shell' },
    zsh: { langKey: 'bash', displayName: 'Zsh' },
    html: { langKey: 'markup', displayName: 'HTML' },
    xml: { langKey: 'markup', displayName: 'XML' },
    svg: { langKey: 'markup', displayName: 'SVG' },
    css: { langKey: 'css', displayName: 'CSS' },
    scss: { langKey: 'css', displayName: 'SCSS' },
    json: { langKey: 'json', displayName: 'JSON' },
    yml: { langKey: 'yaml', displayName: 'YAML' },
    yaml: { langKey: 'yaml', displayName: 'YAML' },
    sql: { langKey: 'sql', displayName: 'SQL' },
    md: { langKey: 'markdown', displayName: 'Markdown' },
    markdown: { langKey: 'markdown', displayName: 'Markdown' },
    c: { langKey: 'c', displayName: 'C' },
    cpp: { langKey: 'cpp', displayName: 'C++' },
    'c++': { langKey: 'cpp', displayName: 'C++' },
    cs: { langKey: 'csharp', displayName: 'C#' },
    csharp: { langKey: 'csharp', displayName: 'C#' },
    java: { langKey: 'java', displayName: 'Java' },
    rust: { langKey: 'rust', displayName: 'Rust' },
    rs: { langKey: 'rust', displayName: 'Rust' },
    go: { langKey: 'go', displayName: 'Go' },
    golang: { langKey: 'go', displayName: 'Go' },
    prompt: { langKey: 'text', displayName: 'Visual Prompt' },
  };

  if (languageMap[clean]) {
    return languageMap[clean];
  }

  return {
    langKey: clean,
    displayName: clean.toUpperCase(),
  };
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'text',
  filename,
  onRunCode,
  onGenerateImagePrompt,
  defaultLineNumbers = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(defaultLineNumbers);

  const { langKey, displayName } = useMemo(() => normalizeLanguage(language), [language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHtml = language.toLowerCase() === 'html' || langKey === 'markup';
  const isVisualPrompt =
    language.toLowerCase() === 'prompt' ||
    language.toLowerCase() === 'midjourney' ||
    code.includes('--v') ||
    code.includes('--ar');

  // Tokenize and highlight code with Prism
  const highlightedHtml = useMemo(() => {
    try {
      const grammar = Prism.languages[langKey] || Prism.languages.clike || Prism.languages.javascript;
      if (grammar) {
        return Prism.highlight(code, grammar, langKey);
      }
    } catch {
      // Fallback if grammar lookup fails
    }
    return '';
  }, [code, langKey]);

  // Split code into lines for syntax highlighting with precise line numbers
  const lines = useMemo(() => {
    return code.split('\n');
  }, [code]);

  // Split highlighted HTML line by line
  const highlightedLines = useMemo(() => {
    if (!highlightedHtml) return [];
    return highlightedHtml.split('\n');
  }, [highlightedHtml]);

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-[#333333] bg-[#0f1117] shadow-2xl font-code text-xs sm:text-[13px] group">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#161822] border-b border-[#2b2d3d] text-slate-300 select-none">
        {/* Left: Language & optional file name */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 font-semibold text-[11px] tracking-wide border border-cyan-500/20">
            {displayName}
          </span>
          {filename && (
            <span className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
              {filename}
            </span>
          )}
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            ({lines.length} {lines.length === 1 ? 'line' : 'lines'})
          </span>
        </div>

        {/* Right: Actions (Live preview, wrap toggle, line numbers toggle, copy) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Live Preview for HTML */}
          {isHtml && onRunCode && (
            <button
              onClick={() => onRunCode(code, language)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition text-xs font-sans cursor-pointer font-medium"
              title="Run HTML Live Preview"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Preview</span>
            </button>
          )}

          {/* Generate Image Prompt button */}
          {isVisualPrompt && onGenerateImagePrompt && (
            <button
              onClick={() => onGenerateImagePrompt(code)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition text-xs font-sans cursor-pointer font-medium"
              title="Generate visual from prompt"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Generate Image</span>
            </button>
          )}

          {/* Toggle Line Numbers */}
          <button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className={`p-1.5 rounded-md transition cursor-pointer ${
              showLineNumbers
                ? 'bg-white/10 text-cyan-300'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title={showLineNumbers ? 'Hide line numbers' : 'Show line numbers'}
          >
            <Hash className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Word Wrap */}
          <button
            onClick={() => setWrapLines(!wrapLines)}
            className={`p-1.5 rounded-md transition cursor-pointer ${
              wrapLines
                ? 'bg-white/10 text-cyan-300'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title={wrapLines ? 'Disable line wrap' : 'Enable line wrap'}
          >
            <WrapText className="w-3.5 h-3.5" />
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-sans font-medium transition cursor-pointer border ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                : 'bg-white/5 text-slate-200 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body with Highlighting and Line Numbers */}
      <div
        className={`p-3.5 sm:p-4 text-slate-100 font-code leading-relaxed ${
          wrapLines ? 'whitespace-pre-wrap break-words' : 'overflow-x-auto whitespace-pre'
        }`}
      >
        {highlightedLines.length > 0 ? (
          <table className="w-full border-collapse">
            <tbody>
              {highlightedLines.map((lineHtml, idx) => (
                <tr key={idx} className="hover:bg-white/[0.03] transition-colors leading-6">
                  {showLineNumbers && (
                    <td className="w-10 select-none pr-4 text-right text-slate-400 text-[11px] align-top font-mono font-medium">
                      {idx + 1}
                    </td>
                  )}
                  <td className="align-top">
                    <code
                      className={`language-${langKey} block`}
                      dangerouslySetInnerHTML={{ __html: lineHtml || '&nbsp;' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((lineText, idx) => (
                <tr key={idx} className="hover:bg-white/[0.03] transition-colors leading-6">
                  {showLineNumbers && (
                    <td className="w-10 select-none pr-4 text-right text-slate-400 text-[11px] align-top font-mono font-medium">
                      {idx + 1}
                    </td>
                  )}
                  <td className="align-top">
                    <code className="block">{lineText || ' '}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
