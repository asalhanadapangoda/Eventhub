import React from 'react';
import DOMPurify from 'dompurify';

// FormattedText safely renders text containing rich HTML formatting (<b>, <i>, <u>, <h3>, <ul>, <li>, etc.) or plain text with linebreaks
export default function FormattedText({ content = '', className = '', style = {} }) {
  if (!content) return null;

  const contentStr = String(content);

  // If content contains HTML tags, render sanitized HTML via dangerouslySetInnerHTML
  if (/<[a-z][\s\S]*>/i.test(contentStr)) {
    const preCleaned = contentStr
      .replace(/class="[^"]*Mso[^"]*"/gi, '')
      .replace(/<!--[\s\S]*?-->/gi, '')
      .replace(/<o:p>[\s\S]*?<\/o:p>/gi, '')
      .replace(/font-family:[^;"]*;?/gi, '')
      .replace(/font-size:[^;"]*;?/gi, '')
      .replace(/line-height:[^;"]*;?/gi, '');

    const cleanHtml = DOMPurify.sanitize(preCleaned);
    return (
      <div
        className={`formatted-text-content ${className}`}
        style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineBreak: 'anywhere', ...style }}
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    );
  }

  // Fallback for markdown/plaintext with linebreaks
  const lines = contentStr.split('\n');

  return (
    <div className={`formatted-text-content ${className}`} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', ...style }}>
      {lines.map((line, lineIndex) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={lineIndex} className="formatted-heading" style={{ margin: '0.5rem 0 0.25rem 0', fontWeight: 'bold', fontSize: '1.05em' }}>
              {line.replace(/^###\s+/, '')}
            </h4>
          );
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={lineIndex} className="formatted-list-item" style={{ display: 'flex', gap: '0.4rem', marginLeft: '0.5rem', margin: '0.15rem 0' }}>
              <span className="bullet" style={{ color: 'var(--primary-color, #2563eb)', fontWeight: 'bold' }}>•</span>
              <div>{line.replace(/^[-*]\s+/, '')}</div>
            </div>
          );
        }

        return (
          <p key={lineIndex} className="formatted-paragraph" style={{ margin: '0 0 0.35rem 0', minHeight: line === '' ? '0.7em' : 'auto' }}>
            {line}
          </p>
        );
      })}
    </div>
  );
}
