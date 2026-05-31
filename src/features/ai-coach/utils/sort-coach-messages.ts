import type { AiCoachMessage } from '../types/ai-coach.model';

/** Chronological order for chat UI (oldest → newest). */
export function sortCoachMessages(messages: AiCoachMessage[]): AiCoachMessage[] {
  return [...messages].sort((a, b) => {
    const timeDiff =
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (timeDiff !== 0) return timeDiff;
    // Same timestamp (bulk insert): user question before assistant reply.
    if (a.role === b.role) return 0;
    return a.role === 'user' ? -1 : 1;
  });
}
