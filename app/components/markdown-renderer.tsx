//these are the fix codes from this file
import { useEffect, useRef, useMemo, memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { Plus, Minus } from 'lucide-react';
import styles from './markdown-renderer.module.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  compact?: boolean;
  showFontControls?: boolean;
}

const remarkPlugins = [remarkMath, remarkGfm];
const rehypePlugins = [rehypeKatex];

const FONT_SIZES = [0.75, 0.8125, 0.875, 0.9375, 1, 1.0625, 1.125, 1.25, 1.375];
const DEFAULT_FONT_INDEX = 3; // 0.9375rem

const MermaidBlock = memo(function MermaidBlock({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({ startOnLoad: false, theme: 'default' });
        if (cancelled || !ref.current) return;
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (e) {
        if (!cancelled && ref.current) {
          ref.current.innerHTML = `<pre style="color: red; font-size: 12px;">Mermaid Error: ${(e as Error).message}</pre>`;
        }
      }
    })();
    return () => { cancelled = true; };
  }, [chart]);

  return <div ref={ref} className={styles.mermaid} />;
});

export const MarkdownRenderer = memo(function MarkdownRenderer({ content, className, compact, showFontControls = true }: MarkdownRendererProps) {
  const [fontIndex, setFontIndex] = useState(() => {
    try {
      const saved = localStorage.getItem('md-font-size');
      return saved ? parseInt(saved, 10) : DEFAULT_FONT_INDEX;
    } catch { return DEFAULT_FONT_INDEX; }
  });

  const fontSize = FONT_SIZES[fontIndex];

  const increaseFontSize = () => {
    const next = Math.min(fontIndex + 1, FONT_SIZES.length - 1);
    setFontIndex(next);
    localStorage.setItem('md-font-size', String(next));
  };

  const decreaseFontSize = () => {
    const next = Math.max(fontIndex - 1, 0);
    setFontIndex(next);
    localStorage.setItem('md-font-size', String(next));
  };

  const components = useMemo(() => ({
    code({ className: codeClassName, children, ...props }: any) {
      const match = /language-(\w+)/.exec(codeClassName || '');
      const lang = match?.[1];
      const codeStr = String(children).replace(/\n$/, '');

      if (lang === 'mermaid') {
        return <MermaidBlock chart={codeStr} />;
      }

      if (codeClassName) {
        return (
          <pre className={styles.codeBlock}>
            <code className={codeClassName} {...props}>{children}</code>
          </pre>
        );
      }

      return <code className={styles.inlineCode} {...props}>{children}</code>;
    },
    table({ children }: any) {
      return (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>{children}</table>
        </div>
      );
    },
  }), []);

  return (
    <div className={`${styles.rendererWrapper} ${className || ''}`}>
      {showFontControls && (
        <div className={styles.fontControls}>
          <button
            className={styles.fontBtn}
            onClick={decreaseFontSize}
            disabled={fontIndex === 0}
            aria-label="Decrease font size"
            type="button"
          >
            <Minus size={14} />
            <span>A</span>
          </button>
          <span className={styles.fontLabel}>{Math.round(fontSize * 100)}%</span>
          <button
            className={styles.fontBtn}
            onClick={increaseFontSize}
            disabled={fontIndex === FONT_SIZES.length - 1}
            aria-label="Increase font size"
            type="button"
          >
            <Plus size={14} />
            <span>A</span>
          </button>
        </div>
      )}
      <div
        className={`${styles.renderer} ${compact ? styles.compact : ''}`}
        style={{ fontSize: `${fontSize}rem` }}
      >
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.28/dist/katex.min.css"
          crossOrigin="anonymous"
        />
        <ReactMarkdown
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
});
