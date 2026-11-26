import React, { useRef, useEffect, useState } from 'react';

const EMOJI_LIST = ['😀', '😂', '😍', '🎉', '🚀', '🔥', '💡', '✨', '🎯', '📌', '📅', '👍', '❤️', '💼', '🏆', '⭐'];
const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Type / for menu',
  rows = 4,
  id,
  className = '',
  style = {},
}) {
  const editorRef = useRef(null);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState(16);
  const [linkUrl, setLinkUrl] = useState('');

  // Sync value from props to editor innerHTML
  useEffect(() => {
    if (editorRef.current) {
      const currentHtml = editorRef.current.innerHTML;
      const targetHtml = value || '';
      if (currentHtml !== targetHtml) {
        editorRef.current.innerHTML = targetHtml;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      const html = editorRef.current.innerHTML;
      if (html === '<br>' || html === '<div><br></div>' || html.trim() === '') {
        onChange('');
      } else {
        onChange(html);
      }
    }
  };

  const executeCommand = (command, e, val = null) => {
    if (e) e.preventDefault();
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, val);
      handleInput();
    }
  };

  const getCurrentSelectedFontSize = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      let parentNode = selection.anchorNode;
      if (parentNode && parentNode.nodeType === 3) {
        parentNode = parentNode.parentElement;
      }
      if (parentNode && editorRef.current?.contains(parentNode)) {
        const computed = window.getComputedStyle(parentNode);
        const parsed = parseInt(computed.fontSize, 10);
        if (!isNaN(parsed)) return parsed;
      }
    }
    return currentFontSize;
  };

  const changeFontSize = (newSize, e) => {
    if (e) e.preventDefault();
    if (!editorRef.current) return;
    editorRef.current.focus();

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      document.execCommand('fontSize', false, '7');
      const fontEls = editorRef.current.querySelectorAll('font[size="7"]');
      fontEls.forEach((el) => {
        el.removeAttribute('size');
        el.style.fontSize = `${newSize}px`;
      });
    }

    setCurrentFontSize(newSize);
    setShowFontSizeDropdown(false);
    handleInput();
  };

  const handleIncreaseFontSize = (e) => {
    if (e) e.preventDefault();
    const activeSize = getCurrentSelectedFontSize();
    const nextSize = FONT_SIZES.find((s) => s > activeSize) || activeSize + 2;
    changeFontSize(nextSize);
  };

  const handleDecreaseFontSize = (e) => {
    if (e) e.preventDefault();
    const activeSize = getCurrentSelectedFontSize();
    const prevSizes = FONT_SIZES.filter((s) => s < activeSize);
    const prevSize = prevSizes.length > 0 ? prevSizes[prevSizes.length - 1] : Math.max(10, activeSize - 2);
    changeFontSize(prevSize);
  };

  const handleKeyDown = (e) => {
    if (e.key === '/') {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const textBefore = sel.anchorNode?.textContent || '';
        if (textBefore.trim() === '' || textBefore.endsWith(' ')) {
          setShowSlashMenu(true);
        }
      }
    } else if (e.key === 'Escape') {
      setShowSlashMenu(false);
      setShowEmojiPicker(false);
      setShowLinkModal(false);
      setShowFontSizeDropdown(false);
    }
  };

  const handleInsertEmoji = (emoji, e) => {
    executeCommand('insertText', e, emoji);
    setShowEmojiPicker(false);
  };

  const handleAddLink = (e) => {
    if (e) e.preventDefault();
    if (linkUrl.trim()) {
      executeCommand('createLink', null, linkUrl.trim());
      setLinkUrl('');
      setShowLinkModal(false);
    }
  };

  const handleSlashItemClick = (type, e) => {
    if (e) e.preventDefault();
    setShowSlashMenu(false);

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (range.startOffset > 0 && range.startContainer.textContent[range.startOffset - 1] === '/') {
        range.setStart(range.startContainer, range.startOffset - 1);
        range.deleteContents();
      }
    }

    if (type === 'h1') executeCommand('formatBlock', null, '<h3>');
    else if (type === 'h2') executeCommand('formatBlock', null, '<h4>');
    else if (type === 'ul') executeCommand('insertUnorderedList', null);
    else if (type === 'ol') executeCommand('insertOrderedList', null);
    else if (type === 'quote') executeCommand('formatBlock', null, '<blockquote>');
    else if (type === 'hr') executeCommand('insertHorizontalRule', null);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData) return;

    const htmlData = clipboardData.getData('text/html');
    const textData = clipboardData.getData('text/plain');

    if (htmlData && (htmlData.includes('MsoNormal') || htmlData.includes('urn:schemas-microsoft-com') || htmlData.includes('class='))) {
      let cleaned = htmlData
        .replace(/<!--[\s\S]*?-->/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/class="[^"]*Mso[^"]*"/gi, '')
        .replace(/style="[^"]*"/gi, '')
        .replace(/<o:p>[\s\S]*?<\/o:p>/gi, '')
        .replace(/<\/?[a-z0-9]+:[\s\S]*?>/gi, '');

      if (cleaned.trim()) {
        document.execCommand('insertHTML', false, cleaned);
      } else if (textData) {
        document.execCommand('insertText', false, textData);
      }
    } else if (htmlData && htmlData.trim()) {
      document.execCommand('insertHTML', false, htmlData);
    } else if (textData) {
      document.execCommand('insertText', false, textData);
    }
    handleInput();
  };

  const minHeightPx = Math.max(90, rows * 24);

  return (
    <div className={`rich-editor-notion-container ${className}`} style={style}>
      {/* Top Content Editable Area */}
      <div
        ref={editorRef}
        id={id}
        contentEditable={true}
        className="rich-editor-notion-editable"
        style={{ minHeight: `${minHeightPx}px` }}
        data-placeholder={placeholder || 'Type / for menu'}
        onInput={handleInput}
        onBlur={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        suppressContentEditableWarning={true}
      />

      {/* Slash Menu Popup */}
      {showSlashMenu && (
        <div className="slash-menu-dropdown">
          <div className="slash-menu-header">Basic Blocks</div>
          <button type="button" className="slash-menu-item" onMouseDown={(e) => handleSlashItemClick('h1', e)}>
            <i className="fa-solid fa-heading" style={{ color: '#5d4df6' }}></i>
            <div>
              <strong>Heading 1</strong>
              <span>Large section title</span>
            </div>
          </button>
          <button type="button" className="slash-menu-item" onMouseDown={(e) => handleSlashItemClick('h2', e)}>
            <i className="fa-solid fa-h" style={{ color: '#2563eb' }}></i>
            <div>
              <strong>Heading 2</strong>
              <span>Medium subsection header</span>
            </div>
          </button>
          <button type="button" className="slash-menu-item" onMouseDown={(e) => handleSlashItemClick('ul', e)}>
            <i className="fa-solid fa-list-ul" style={{ color: '#059669' }}></i>
            <div>
              <strong>Bulleted List</strong>
              <span>Create a bulleted list</span>
            </div>
          </button>
          <button type="button" className="slash-menu-item" onMouseDown={(e) => handleSlashItemClick('ol', e)}>
            <i className="fa-solid fa-list-ol" style={{ color: '#d97706' }}></i>
            <div>
              <strong>Numbered List</strong>
              <span>Create an ordered list</span>
            </div>
          </button>
          <button type="button" className="slash-menu-item" onMouseDown={(e) => handleSlashItemClick('quote', e)}>
            <i className="fa-solid fa-quote-left" style={{ color: '#7c3aed' }}></i>
            <div>
              <strong>Quote</strong>
              <span>Capture a quote or highlight</span>
            </div>
          </button>
          <button type="button" className="slash-menu-item" onMouseDown={(e) => handleSlashItemClick('hr', e)}>
            <i className="fa-solid fa-minus" style={{ color: '#64748b' }}></i>
            <div>
              <strong>Divider</strong>
              <span>Visually divide content</span>
            </div>
          </button>
        </div>
      )}

      {/* Font Size Dropdown Popover */}
      {showFontSizeDropdown && (
        <div className="font-size-dropdown-menu">
          {FONT_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              className={`font-size-item ${currentFontSize === size ? 'active' : ''}`}
              onMouseDown={(e) => changeFontSize(size, e)}
            >
              <span>{size}px</span>
              {size === 16 && <span className="font-size-default-badge">Default</span>}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="emoji-picker-dropdown">
          <div className="emoji-grid">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="emoji-btn"
                onMouseDown={(e) => handleInsertEmoji(emoji, e)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Link Input Popover */}
      {showLinkModal && (
        <div className="link-input-popover">
          <input
            type="url"
            placeholder="Paste or type link URL..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddLink(e)}
            autoFocus
          />
          <button type="button" className="btn-link-save" onMouseDown={handleAddLink}>
            Add Link
          </button>
        </div>
      )}

      {/* Bottom Floating Action Toolbar */}
      <div className="notion-bottom-toolbar">
        {/* Plus Button for Menu */}
        <button
          type="button"
          className="notion-btn-plus"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowSlashMenu((prev) => !prev);
          }}
          title="Add block or menu (/)"
        >
          +
        </button>

        <div className="notion-toolbar-divider"></div>

        {/* Format Action Buttons */}
        <button
          type="button"
          className="notion-tool-btn"
          onMouseDown={(e) => executeCommand('bold', e)}
          title="Bold (Ctrl+B)"
        >
          <span style={{ fontWeight: '800', fontFamily: 'serif' }}>B</span>
        </button>

        <button
          type="button"
          className="notion-tool-btn"
          onMouseDown={(e) => executeCommand('italic', e)}
          title="Italic (Ctrl+I)"
        >
          <span style={{ fontStyle: 'italic', fontFamily: 'serif' }}>I</span>
        </button>

        <button
          type="button"
          className="notion-tool-btn"
          onMouseDown={(e) => executeCommand('underline', e)}
          title="Underline (Ctrl+U)"
        >
          <span style={{ textDecoration: 'underline' }}>U</span>
        </button>

        <button
          type="button"
          className="notion-tool-btn"
          onMouseDown={(e) => executeCommand('strikethrough', e)}
          title="Strikethrough"
        >
          <span style={{ textDecoration: 'line-through' }}>S</span>
        </button>

        <div className="notion-toolbar-divider"></div>

        {/* Font Size Controls: Decrease, Dropdown, Increase */}
        <button
          type="button"
          className="notion-tool-btn"
          onMouseDown={handleDecreaseFontSize}
          title="Decrease Font Size (A-)"
        >
          <span style={{ fontWeight: '700', fontSize: '0.82rem' }}>
            A<sub style={{ fontSize: '0.65rem', fontWeight: '800', bottom: '0' }}>-</sub>
          </span>
        </button>

        <button
          type="button"
          className="notion-tool-btn font-size-select-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowFontSizeDropdown((prev) => !prev);
          }}
          title="Select Font Size"
        >
          <span>{currentFontSize}px</span>
          <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.6rem', marginLeft: '3px' }}></i>
        </button>

        <button
          type="button"
          className="notion-tool-btn"
          onMouseDown={handleIncreaseFontSize}
          title="Increase Font Size (A+)"
        >
          <span style={{ fontWeight: '700', fontSize: '0.82rem' }}>
            A<sup style={{ fontSize: '0.65rem', fontWeight: '800', top: '-0.3em' }}>+</sup>
          </span>
        </button>

        <div className="notion-toolbar-divider"></div>

        <button
          type="button"
          className="notion-tool-btn"
          onMouseDown={(e) => executeCommand('insertUnorderedList', e)}
          title="Bulleted List"
        >
          <i className="fa-solid fa-list-ul"></i>
        </button>

        <button
          type="button"
          className="notion-tool-btn"
          onMouseDown={(e) => executeCommand('insertOrderedList', e)}
          title="Numbered List"
        >
          <i className="fa-solid fa-list-ol"></i>
        </button>

        <button
          type="button"
          className="notion-tool-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowLinkModal((prev) => !prev);
          }}
          title="Insert Link"
        >
          <i className="fa-solid fa-link"></i>
        </button>

        <div className="notion-toolbar-divider"></div>

        <button
          type="button"
          className="notion-tool-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowEmojiPicker((prev) => !prev);
          }}
          title="Insert Emoji"
        >
          <i className="fa-regular fa-face-smile"></i>
        </button>
      </div>
    </div>
  );
}
