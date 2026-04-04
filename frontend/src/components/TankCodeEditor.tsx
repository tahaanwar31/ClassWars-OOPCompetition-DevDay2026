import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { autocompletion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { EditorView, keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

// ─── Custom Tank class autocomplete entries ───────────────────────────────────
function tankCompletions(context: CompletionContext): CompletionResult | null {
  const word = context.matchBefore(/\w*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;

  return {
    from: word.from,
    options: [
      // ── Methods ──
      { label: 'moveUp()', type: 'function', info: 'Move tank upward (decrease Y)', detail: 'Tank method' },
      { label: 'moveDown()', type: 'function', info: 'Move tank downward (increase Y)', detail: 'Tank method' },
      { label: 'fire()', type: 'function', info: 'Fire a projectile toward enemy', detail: 'Tank method' },
      { label: 'activateShield()', type: 'function', info: 'Activate shield (max 2 uses, 3s each)', detail: 'Tank method' },
      // ── Properties ──
      { label: 'this->y', type: 'variable', info: 'Current tank Y position (0–100)', detail: 'Player position' },
      { label: 'this->hp', type: 'variable', info: 'Current tank HP (0–100)', detail: 'Player health' },
      { label: 'enemy.y', type: 'variable', info: 'Enemy Y position (0–100)', detail: 'Enemy position' },
      { label: 'enemy.hp', type: 'variable', info: 'Enemy HP (0–100)', detail: 'Enemy health' },
      { label: 'enemy.isFiring()', type: 'function', info: 'Returns true if enemy is currently firing', detail: 'Enemy state' },
      // ── Overrides ──
      {
        label: 'void move() override',
        type: 'keyword',
        info: 'Override to control tank movement',
        detail: 'Tank override',
        apply: 'void move() override {\n    // moveUp() or moveDown()\n}',
      },
      {
        label: 'void attack() override',
        type: 'keyword',
        info: 'Override to control firing',
        detail: 'Tank override',
        apply: 'void attack() override {\n    // fire()\n}',
      },
      {
        label: 'void defend() override',
        type: 'keyword',
        info: 'Override to control shield',
        detail: 'Tank override',
        apply: 'void defend() override {\n    // activateShield()\n}',
      },
      // ── Snippets ──
      {
        label: 'if aligned fire',
        type: 'text',
        info: 'Fire when aligned with enemy',
        detail: 'Snippet',
        apply: 'if (abs(enemy.y - this->y) < 10) {\n    fire();\n}',
      },
      {
        label: 'track enemy',
        type: 'text',
        info: 'Move toward enemy Y position',
        detail: 'Snippet',
        apply: 'if (enemy.y < this->y - 1.5) {\n    moveUp();\n} else if (enemy.y > this->y + 1.5) {\n    moveDown();\n}',
      },
      {
        label: 'shield on fire',
        type: 'text',
        info: 'Activate shield when enemy fires',
        detail: 'Snippet',
        apply: 'if (enemy.isFiring()) {\n    activateShield();\n}',
      },
    ],
  };
}

// ─── Vibrant syntax highlight style ──────────────────────────────────────────
const tankHighlightStyle = HighlightStyle.define([
  // Keywords: electric cyan
  { tag: t.keyword,                color: '#00e5ff', fontWeight: 'bold' },
  { tag: t.controlKeyword,         color: '#00e5ff', fontWeight: 'bold' },
  { tag: t.definitionKeyword,      color: '#00e5ff', fontWeight: 'bold' },
  { tag: t.moduleKeyword,          color: '#00e5ff', fontWeight: 'bold' },
  // Types & class names: vivid purple
  { tag: t.typeName,               color: '#c792ea', fontWeight: 'bold' },
  { tag: t.className,              color: '#c792ea', fontWeight: 'bold' },
  { tag: t.definition(t.typeName), color: '#c792ea', fontWeight: 'bold' },
  // Function & method names: bright yellow-green
  { tag: t.function(t.variableName), color: '#ffe57f', fontWeight: 'bold' },
  { tag: t.function(t.propertyName), color: '#ffe57f' },
  // Variables: white
  { tag: t.variableName,           color: '#eeffff' },
  { tag: t.propertyName,           color: '#f07178' },  // hot coral/pink for members
  // Strings: vivid orange
  { tag: t.string,                 color: '#ffcb6b' },
  { tag: t.special(t.string),      color: '#ffcb6b' },
  // Numbers: hot pink
  { tag: t.number,                 color: '#ff79c6' },
  // Operators & punctuation: bright cyan
  { tag: t.operator,               color: '#89ddff' },
  { tag: t.punctuation,            color: '#89ddff' },
  { tag: t.bracket,                color: '#ffcb6b' },
  // Comments: bright neon green italic
  { tag: t.comment,                color: '#39ff14', fontStyle: 'italic' },
  { tag: t.lineComment,            color: '#39ff14', fontStyle: 'italic' },
  { tag: t.blockComment,           color: '#39ff14', fontStyle: 'italic' },
  // Preprocessor / macros: magenta
  { tag: t.processingInstruction,  color: '#ff79c6', fontWeight: 'bold' },
  { tag: t.meta,                   color: '#ff79c6' },
  // Boolean / null / undefined: cyan
  { tag: t.bool,                   color: '#00e5ff', fontWeight: 'bold' },
  { tag: t.null,                   color: '#00e5ff' },
]);

// ─── Editor UI theme ──────────────────────────────────────────────────────────
const tankEditorTheme = EditorView.theme({
  '&': {
    fontSize: '13px',
    fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", "Courier New", monospace',
    backgroundColor: '#060a0f !important',
  },
  '.cm-scroller': {
    overflow: 'auto',
    lineHeight: '1.75',
    backgroundColor: '#060a0f',
  },
  '.cm-content': {
    padding: '12px 0',
    caretColor: '#ff003c',
    backgroundColor: '#060a0f',
    color: '#eeffff',
  },
  '.cm-cursor': {
    borderLeftColor: '#ff003c !important',
    borderLeftWidth: '2px',
  },
  // Active line: subtle red tint
  '.cm-activeLine': {
    backgroundColor: 'rgba(255,0,60,0.07) !important',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(255,0,60,0.12) !important',
    color: '#ff003c !important',
    fontWeight: 'bold',
  },
  // Gutter
  '.cm-gutters': {
    backgroundColor: '#03070c !important',
    borderRight: '1px solid rgba(0,229,255,0.18)',
    color: '#3a4a5a',
    minWidth: '40px',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    color: '#4a6070',
    paddingRight: '14px',
    paddingLeft: '6px',
  },
  // Selection
  '.cm-selectionBackground': {
    backgroundColor: 'rgba(0,229,255,0.18) !important',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(0,229,255,0.22) !important',
  },
  // Bracket matching: blazing yellow
  '.cm-matchingBracket': {
    backgroundColor: 'rgba(255,203,107,0.25) !important',
    outline: '1px solid #ffcb6b',
    color: '#ffcb6b !important',
    borderRadius: '2px',
  },
  // Search matches
  '.cm-searchMatch': {
    backgroundColor: 'rgba(255,121,198,0.25)',
    outline: '1px solid #ff79c6',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'rgba(255,121,198,0.5)',
  },
  // Autocomplete dropdown
  '.cm-tooltip': {
    backgroundColor: '#0b1018 !important',
    border: '1px solid rgba(0,229,255,0.4) !important',
    borderRadius: '6px',
    boxShadow: '0 0 20px rgba(0,229,255,0.15), 0 8px 32px rgba(0,0,0,0.9)',
  },
  '.cm-tooltip-autocomplete': {
    backgroundColor: '#0b1018 !important',
    border: '1px solid rgba(0,229,255,0.4) !important',
    borderRadius: '6px',
    fontFamily: '"Fira Code", monospace',
    fontSize: '12px',
    boxShadow: '0 0 20px rgba(0,229,255,0.15), 0 8px 32px rgba(0,0,0,0.9)',
  },
  '.cm-tooltip-autocomplete ul': {
    fontFamily: '"Fira Code", monospace',
  },
  '.cm-tooltip-autocomplete ul li': {
    padding: '5px 12px !important',
    color: '#c5d0e0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: 'rgba(0,229,255,0.15) !important',
    color: '#00e5ff !important',
  },
  '.cm-completionIcon': {
    opacity: '0.8',
  },
  '.cm-completionLabel': {
    color: '#eeffff',
    fontWeight: '600',
  },
  '.cm-completionDetail': {
    color: '#00e5ff',
    marginLeft: '10px',
    fontSize: '10px',
    opacity: '0.8',
  },
  '.cm-completionInfo': {
    backgroundColor: '#0b1018 !important',
    border: '1px solid rgba(0,229,255,0.3) !important',
    padding: '8px 12px',
    fontSize: '11px',
    color: '#89b4d0',
    borderRadius: '4px',
    maxWidth: '280px',
  },
  // Scrollbar
  '.cm-scroller::-webkit-scrollbar': {
    width: '6px',
    height: '6px',
  },
  '.cm-scroller::-webkit-scrollbar-track': {
    background: '#060a0f',
  },
  '.cm-scroller::-webkit-scrollbar-thumb': {
    background: 'rgba(0,229,255,0.3)',
    borderRadius: '3px',
  },
  '.cm-scroller::-webkit-scrollbar-thumb:hover': {
    background: 'rgba(0,229,255,0.6)',
  },
}, { dark: true });

interface TankCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
}

const TankCodeEditor: React.FC<TankCodeEditorProps> = ({ value, onChange, height = '100%' }) => {
  const extensions = [
    cpp(),
    syntaxHighlighting(tankHighlightStyle),
    autocompletion({ override: [tankCompletions] }),
    keymap.of([indentWithTab]),
    tankEditorTheme,
    EditorView.lineWrapping,
  ];

  return (
    <CodeMirror
      value={value}
      height={height}
      theme="none"
      extensions={extensions}
      onChange={onChange}
      style={{ height: '100%', overflow: 'hidden' }}
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        dropCursor: false,
        allowMultipleSelections: false,
        indentOnInput: true,
        bracketMatching: true,
        closeBrackets: true,
        autocompletion: false,
        highlightActiveLine: true,
        highlightSelectionMatches: true,
        syntaxHighlighting: false, // we supply our own
        tabSize: 4,
      }}
    />
  );
};

export default TankCodeEditor;
