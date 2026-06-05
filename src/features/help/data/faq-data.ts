import type { FeatherIconName } from '../types';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqCategory {
  category: string;
  icon: FeatherIconName;
  iconBg: string;
  iconColor: string;
  items: FaqItem[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    category: 'Getting Started',
    icon: 'zap',
    iconBg: '#DBEAFE',
    iconColor: '#2563EB',
    items: [
      {
        question: 'How do I join a league?',
        answer:
          'You can join a league by using an invitation code from a league host. Go to your dashboard and select "Join a League", then enter the code. You can also search for public leagues in the explore section.',
      },
      {
        question: 'What is a challenge and how do I participate?',
        answer:
          'Challenges are fitness activities or goals set by league hosts. Once a challenge is active, you can submit proof of completion (like a photo or screenshot) to earn points. The more challenges you complete, the higher your score on the leaderboard.',
      },
      {
        question: 'What are activities in the context of this app?',
        answer:
          'Activities are fitness-related actions that count towards challenges. Each league has a list of allowed activities (like running, cycling, weight training, etc.). Only activities on the allowed list will be counted towards your challenge submissions.',
      },
    ],
  },
  {
    category: 'Challenges & Submissions',
    icon: 'target',
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
    items: [
      {
        question: 'How do I submit proof for a challenge?',
        answer:
          'Go to the Challenges section, find the active challenge you want to complete, and tap "Submit Proof". Upload an image or screenshot as evidence of completion. Your submission will be reviewed by the league host or moderator.',
      },
      {
        question: 'What happens after I submit proof?',
        answer:
          'Your submission will be in "Pending" status while waiting for review. The league host will either approve it (and award points), reject it, or request changes. You can resubmit within 24 hours if your submission is rejected.',
      },
      {
        question: 'Can I resubmit a rejected challenge?',
        answer:
          'Yes, if your submission is rejected, you have a 24-hour window to resubmit new proof. This reupload window closes at 11:59 PM local time on the next day.',
      },
      {
        question: 'What types of files can I upload as proof?',
        answer:
          'You can upload JPG, PNG, GIF, or WebP image files. Maximum file size is 10MB. Make sure the image clearly shows evidence of completing the challenge activity.',
      },
    ],
  },
  {
    category: 'Teams & Leaderboards',
    icon: 'users',
    iconBg: '#F3E8FF',
    iconColor: '#9333EA',
    items: [
      {
        question: 'How do teams work?',
        answer:
          'Teams are groups of members within a league. Team challenges require submissions from team members, and points are distributed among the team. You can only be part of one team per league.',
      },
      {
        question: 'What is the leaderboard?',
        answer:
          'The leaderboard ranks all participants in a league based on their earned points. Your position updates in real-time as challenges are completed and reviewed. You can view your ranking and compare progress with other members.',
      },
      {
        question: 'How are points calculated in team challenges?',
        answer:
          'In team challenges, the total points are divided among team members. The distribution is calculated fairly based on team size. Hosts can set per-member caps to ensure balanced rewards across teams of different sizes.',
      },
    ],
  },
  {
    category: 'League Management (for Hosts)',
    icon: 'award',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    items: [
      {
        question: 'How do I create a challenge?',
        answer:
          'As a league host, go to the Challenges section and tap "Create Custom Challenge". Set the name, description, type (individual/team/sub-team), and total points. You can upload rules documents (PDF, DOC, DOCX) for detailed guidelines.',
      },
      {
        question: 'What are sub-teams?',
        answer:
          'Sub-teams are smaller groups within a team. They allow you to organize members into divisions or groups for targeted challenges. You can create sub-teams before activating a sub-team type challenge.',
      },
      {
        question: 'How do I review and approve submissions?',
        answer:
          'After submissions close, open the Review section for that challenge. You can view each submission, award points, reject it, or request changes. Approved submissions contribute to the leaderboard standings.',
      },
      {
        question: 'Can I update challenge scores after publishing?',
        answer:
          'Yes. Hosts and governors can edit challenge scores at any time. Publishing scores does not lock them, so you can make adjustments whenever needed.',
      },
      {
        question: 'Can I edit league rules after creation?',
        answer:
          'Yes, you can edit the league rules and upload or replace rule documents anytime. Go to the Rules section and tap "Edit Rules" to update the summary or document.',
      },
    ],
  },
  {
    category: 'Account & Profile',
    icon: 'user',
    iconBg: '#E0E7FF',
    iconColor: '#4F46E5',
    items: [
      {
        question: 'How do I update my profile information?',
        answer:
          'Go to your Profile section from the navigation menu. You can update your username, email, timezone, and other personal details. Your changes take effect immediately.',
      },
      {
        question: 'How do I change my password?',
        answer:
          'In your Profile settings, look for the "Change Password" option. Enter your current password and your new password twice to confirm. For security, we require strong passwords.',
      },
      {
        question: 'What is timezone and why is it important?',
        answer:
          'Your timezone determines how daily challenges and reupload windows are calculated. For example, reupload windows close at 11:59 PM your local time. You can set and update your timezone in Profile settings.',
      },
      {
        question: 'How do I manage my payment methods?',
        answer:
          'Go to the Payments section to view and manage your payment methods. You can add new payment methods for league fees or challenge activation costs.',
      },
    ],
  },
  {
    category: 'Troubleshooting',
    icon: 'alert-circle',
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
    items: [
      {
        question: 'I cannot see a challenge I joined. What should I do?',
        answer:
          'Make sure the challenge is in "Active" status. Drafts and scheduled challenges are not visible to participants. Refresh the page or restart the app and try again.',
      },
      {
        question: 'My submission shows "Pending" for a long time. Is this normal?',
        answer:
          "Yes, submissions stay pending until the league host or moderator reviews them. The review timeframe depends on the host's schedule. You can contact the host for an update if needed.",
      },
      {
        question: 'I got an error while uploading my proof. How do I fix it?',
        answer:
          'Check that your file is in an accepted format (JPG, PNG, GIF, WebP) and is smaller than 10MB. If the error persists, try restarting the app or clearing cache in your device settings.',
      },
      {
        question: 'Why is my leaderboard ranking different from what I expected?',
        answer:
          'Your ranking depends on approved challenge submissions only. Pending or rejected submissions do not count. Make sure all your submissions are approved and try refreshing the leaderboard.',
      },
      {
        question: 'I cannot log in to my account. What should I do?',
        answer:
          'First, verify you are using the correct email and password. If you forgot your password, use the "Forgot Password" link on the login screen. If you still cannot access your account, contact our support team.',
      },
    ],
  },
];
