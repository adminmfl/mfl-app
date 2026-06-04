import type { ReactNode } from 'react';
import { Text, type TextStyle } from 'react-native';

/** Minimal **bold** / *italic* / `code` for assistant replies (no new dependency). */
export function renderCoachMarkdown(
  text: string,
  style: { base: TextStyle; bold: TextStyle; italic: TextStyle; code: TextStyle },
): ReactNode {
  return text.split('\n').map((line, lineIndex, lines) => (
    <Text key={`l-${lineIndex}`}>
      {parseInline(line, style, `l-${lineIndex}`)}
      {lineIndex < lines.length - 1 ? '\n' : null}
    </Text>
  ));
}

function parseInline(
  text: string,
  style: { base: TextStyle; bold: TextStyle; italic: TextStyle; code: TextStyle },
  keyPrefix: string,
): ReactNode[] {
  const nodes: ReactNode[] = [];
  let i = 0;
  let k = 0;

  while (i < text.length) {
    if (text.startsWith('**', i)) {
      const end = text.indexOf('**', i + 2);
      if (end !== -1) {
        nodes.push(
          <Text key={`${keyPrefix}-b-${k++}`} style={style.bold}>
            {parseInline(text.slice(i + 2, end), style, `${keyPrefix}-b-${k}`)}
          </Text>,
        );
        i = end + 2;
        continue;
      }
    }
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1);
      if (end !== -1) {
        nodes.push(
          <Text key={`${keyPrefix}-c-${k++}`} style={style.code}>
            {text.slice(i + 1, end)}
          </Text>,
        );
        i = end + 1;
        continue;
      }
    }
    let next = text.length;
    for (const marker of ['**', '`']) {
      const at = text.indexOf(marker, i);
      if (at !== -1 && at < next) next = at;
    }
    nodes.push(text.slice(i, next));
    i = next;
  }

  return nodes;
}
