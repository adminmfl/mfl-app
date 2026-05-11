import { Linking, Text } from 'react-native';

import { mflColors } from '../../../constants/colors';

/**
 * Parses message content for **bold**, @[username] mentions, and [text](url) links.
 * Returns an array of React Native Text elements matching the web's renderContent().
 */
export function renderMessageContent(
  content: string,
  textColor: string,
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Matches: **bold**, @[username](user_id) (legacy), @[username] (new), [text](url)
  const regex =
    /(\*\*(.+?)\*\*)|(@\[([^\]]+)\](?:\([^)]+\))?)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIdx) {
      parts.push(
        <Text key={`t-${lastIdx}`} style={{ color: textColor }}>
          {content.slice(lastIdx, match.index)}
        </Text>,
      );
    }

    if (match[1]) {
      // **bold**
      parts.push(
        <Text key={`b-${match.index}`} style={{ fontWeight: '600', color: textColor }}>
          {match[2]}
        </Text>,
      );
    } else if (match[3]) {
      // @[username] mention
      parts.push(
        <Text
          key={`m-${match.index}`}
          style={{
            fontWeight: '600',
            color: mflColors.blue,
            backgroundColor: 'rgba(27,79,138,0.1)',
            borderRadius: 3,
            paddingHorizontal: 2,
          }}
        >
          @{match[4]}
        </Text>,
      );
    } else if (match[5]) {
      // [text](url) link
      const href = match[7] ?? '';
      parts.push(
        <Text
          key={`l-${match.index}`}
          style={{
            color: mflColors.blue,
            textDecorationLine: 'underline',
          }}
          onPress={() => {
            if (href && !href.startsWith('/')) {
              Linking.openURL(href).catch(() => {});
            }
          }}
        >
          {match[6]}
        </Text>,
      );
    }

    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < content.length) {
    parts.push(
      <Text key={`t-${lastIdx}`} style={{ color: textColor }}>
        {content.slice(lastIdx)}
      </Text>,
    );
  }

  return parts;
}
