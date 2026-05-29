import type { ReactNode } from 'react';
import { Text, type TextStyle } from 'react-native';

type MarkdownStyle = {
  base: TextStyle;
  bold: TextStyle;
  italic: TextStyle;
  code: TextStyle;
};

function parseInlineMarkdown(
  text: string,
  style: MarkdownStyle,
): ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let index = 0;
  let key = 0;

  while (index < text.length) {
    if (text.startsWith('**', index)) {
      const end = text.indexOf('**', index + 2);
      if (end !== -1) {
        const inner = text.slice(index + 2, end);
        nodes.push(
          <Text key={key++} style={style.bold}>
            {parseInlineMarkdown(inner, style)}
          </Text>,
        );
        index = end + 2;
        continue;
      }
    }

    if (text[index] === '*' && !text.startsWith('**', index)) {
      const end = text.indexOf('*', index + 1);
      if (end !== -1) {
        const inner = text.slice(index + 1, end);
        nodes.push(
          <Text key={key++} style={style.italic}>
            {parseInlineMarkdown(inner, style)}
          </Text>,
        );
        index = end + 1;
        continue;
      }
    }

    if (text[index] === '`') {
      const end = text.indexOf('`', index + 1);
      if (end !== -1) {
        nodes.push(
          <Text key={key++} style={style.code}>
            {text.slice(index + 1, end)}
          </Text>,
        );
        index = end + 1;
        continue;
      }
    }

    let next = text.length;
    const nextBold = text.indexOf('**', index);
    const nextItalic = text.indexOf('*', index);
    const nextCode = text.indexOf('`', index);
    if (nextBold !== -1 && nextBold < next) next = nextBold;
    if (nextItalic !== -1 && nextItalic < next) next = nextItalic;
    if (nextCode !== -1 && nextCode < next) next = nextCode;

    nodes.push(text.slice(index, next));
    index = next;
  }

  return nodes;
}

export function renderCoachMarkdown(
  text: string,
  style: MarkdownStyle,
): ReactNode {
  const lines = text.split('\n');

  return lines.map((line, lineIndex) => (
    <Text key={`line-${lineIndex}`}>
      {parseInlineMarkdown(line, style)}
      {lineIndex < lines.length - 1 ? '\n' : null}
    </Text>
  ));
}
