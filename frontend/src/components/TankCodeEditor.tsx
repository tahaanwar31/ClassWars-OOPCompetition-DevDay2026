import React, { useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { autocompletion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { EditorView, keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';

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

// ─── Custom theme overrides (on top of oneDark) ───────────────────────────────
const tankEditorTheme = EditorView.theme({
  '&': {
    fontSize: '13px',
    fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", "Courier New", monospace',
    backgroundColor: '#0d1117 !important',
    borderRadius: '0 0 4px 4px',
  },
  '.cm-scroller': {
    overflow: 'auto',
    lineHeight: '1.7',
  },
  '.cm-content': {
    padding: '12px 0',
    caretColor: '#ff003c',
  },
  '.cm-cursor': {
    borderLeftColor: '#ff003c !important',
    borderLeftWidth: '2px',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(57,255,20,0.04) !important',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(57,255,20,0.08) !important',
    color: '#39ff14 !important',
  },
  '.cm-gutters': {
    backgroundColor: '#0a0e14 !important',
    borderRight: '1px solid rgba(57,255,20,0.12)',
    color: '#3a3f4b',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    color: '#3d4450',
    paddingRight: '12px',
  },
  '.cm-selectionBackground': {
    backgroundColor: 'rgba(255,0,60,0.20) !important',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(255,0,60,0.25) !important',
  },
  '.cm-tooltip-autocomplete': {
    backgroundColor: '#161b22 !important',
    border: '1px solid rgba(57,255,20,0.3) !important',
    borderRadius: '4px',
    fontFamily: '"Fira Code", monospace',
    fontSize: '12px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.8)',
  },
  '.cm-tooltip-autocomplete ul li': {
    padding: '4px 10px !important',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: 'rgba(255,0,60,0.25) !important',
    color: '#ff003c !important',
  },
  '.cm-completionLabel': {
    color: '#39ff14',
  },
  '.cm-completionDetail': {
    color: '#6e7681',
    marginLeft: '8px',
    fontSize: '10px',
  },
  '.cm-completionInfo': {
    backgroundColor: '#0d1117 !important',
    border: '1px solid rgba(57,255,20,0.2) !important',
    padding: '6px 10px',
    fontSize: '11px',
    color: '#8b949e',
    borderRadius: '4px',
  },
  '.cm-matchingBracket': {
    backgroundColor: 'rgba(57,255,20,0.15)',
    color: '#39ff14 !important',
    borderBottom: '1px solid #39ff14',
  },
});

interface TankCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
}

const TankCodeEditor: React.FC<TankCodeEditorProps> = ({ value, onChange, height = '100%' }) => {
  const extensions = [
    cpp(),
    autocompletion({ override: [tankCompletions] }),
    keymap.of([indentWithTab]),
    tankEditorTheme,
    EditorView.lineWrapping,
  ];

  return (
    <CodeMirror
      value={value}
      height={height}
      theme={oneDark}
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
        autocompletion: false, // we supply our own
        highlightActiveLine: true,
        highlightSelectionMatches: true,
        syntaxHighlighting: true,
        tabSize: 4,
      }}
    />
  );
};

export default TankCodeEditor;
