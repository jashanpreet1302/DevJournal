import { useEffect, useRef } from "react";

interface SyntaxHighlighterProps {
  code: string;
  language: string;
  className?: string;
}

export default function SyntaxHighlighter({ code, language, className = "" }: SyntaxHighlighterProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current && typeof window !== "undefined") {
      // Use a simple highlight function since we don't have Prism.js
      // In a real implementation, you would use a proper syntax highlighting library
      const highlighted = highlightCode(code, language);
      codeRef.current.innerHTML = highlighted;
    }
  }, [code, language]);

  return (
    <pre className={`bg-dev-bg rounded-lg p-4 overflow-x-auto ${className}`}>
      <code
        ref={codeRef}
        className={`syntax-highlight language-${language} text-sm`}
      >
        {code}
      </code>
    </pre>
  );
}

// Simple syntax highlighting function
function highlightCode(code: string, language: string): string {
  // This is a simplified highlighter. In production, use a proper library like Prism.js or highlight.js
  let highlighted = code;

  if (language === "javascript" || language === "typescript") {
    highlighted = highlighted
      .replace(/\b(function|const|let|var|if|else|for|while|return|import|export|class|extends)\b/g, '<span style="color: #569cd6;">$1</span>')
      .replace(/\b(true|false|null|undefined)\b/g, '<span style="color: #569cd6;">$1</span>')
      .replace(/"([^"\\]|\\.)*"/g, '<span style="color: #ce9178;">$&</span>')
      .replace(/'([^'\\]|\\.)*'/g, '<span style="color: #ce9178;">$&</span>')
      .replace(/\/\/.*$/gm, '<span style="color: #6a9955;">$&</span>')
      .replace(/\/\*[\s\S]*?\*\//g, '<span style="color: #6a9955;">$&</span>');
  } else if (language === "css") {
    highlighted = highlighted
      .replace(/([a-zA-Z-]+)(?=\s*:)/g, '<span style="color: #92c5f7;">$1</span>')
      .replace(/:([^;]+);/g, ': <span style="color: #ce9178;">$1</span>;')
      .replace(/\/\*[\s\S]*?\*\//g, '<span style="color: #6a9955;">$&</span>');
  }

  return highlighted;
}
