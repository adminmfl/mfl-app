import type { FaqItem, PolicySectionData } from '../types/settings.types';

export const PRIVACY_INTRO = [
  'These terms and conditions outline the rules and regulations for the use of MFL\'s Website, located at www.mfl.com.',
  'By accessing this website, we assume you accept these terms and conditions. Do not continue to use MFL if you do not agree to take all of the terms and conditions stated on this page.',
] as const;

export const POLICY_SECTIONS: PolicySectionData[] = [
  {
    icon: 'shield',
    title: 'Cookies',
    paragraphs: [
      'The website uses cookies to help personalize your online experience. By accessing MFL.com, you agreed to use the required cookies.',
      'A cookie is a text file that is placed on your hard disk by a web page server. Cookies cannot be used to run programs or deliver viruses to your computer. Cookies are uniquely assigned to you and can only be read by a web server in the domain that issued the cookie to you.',
      'We may use cookies to collect, store, and track information for statistical or marketing purposes to operate our website. You have the ability to accept or decline optional Cookies. There are some required Cookies that are necessary for the operation of our website.',
    ],
  },
  {
    icon: 'award',
    title: 'License',
    paragraphs: [
      'Unless otherwise stated, MFL and/or its licensors own the intellectual property rights for all material on MFL. All intellectual property rights are reserved. You may access this from MFL for your own personal use subjected to restrictions set in these terms and conditions.',
    ],
    restrictedList: {
      heading: 'You must not:',
      items: [
        'Copy or republish material from mfl.com',
        'Sell, rent, or sub-license material from mfl.com',
        'Reproduce, duplicate or copy material from mfl.com',
        'Redistribute content from mfl.com',
      ],
    },
  },
  {
    icon: 'link',
    title: 'Hyperlinking to our Content',
    paragraphs: [
      'The following organizations may link to our Website without prior written approval: Government agencies, Search engines, News organizations, and Online directory distributors.',
      'These organizations may link to our home page, to publications, or to other Website information so long as the link: (a) is not in any way deceptive; (b) does not falsely imply sponsorship, endorsement, or approval; and (c) fits within the context of the linking party\'s site.',
      'No use of MFL\'s logo or other artwork will be allowed for linking absent a trademark license agreement.',
    ],
  },
  {
    icon: 'file-text',
    title: 'Content Liability',
    paragraphs: [
      'We shall not be held responsible for any content that appears on your Website. You agree to protect and defend us against all claims that are raised on your Website. No link(s) should appear on any Website that may be interpreted as libelous, obscene, or criminal, or which infringes, otherwise violates, or advocates the infringement or other violation of, any third party rights.',
    ],
  },
  {
    icon: 'bookmark',
    title: 'Reservation of Rights',
    paragraphs: [
      'We reserve the right to request that you remove all links or any particular link to our Website. You approve to immediately remove all links to our Website upon request. We also reserve the right to amend these terms and conditions and its linking policy at any time.',
    ],
  },
  {
    icon: 'trash-2',
    title: 'Removal of Links',
    paragraphs: [
      'If you find any link on our Website that is offensive for any reason, you are free to contact and inform us at any moment. We will consider requests to remove links, but we are not obligated to or so or to respond to you directly.',
      'We do not ensure that the information on this website is correct. We do not warrant its completeness or accuracy, nor do we promise to ensure that the website remains available or that the material on the website is kept up to date.',
    ],
  },
  {
    icon: 'alert-triangle',
    title: 'Disclaimer',
    paragraphs: [
      'To the maximum extent permitted by applicable law, we exclude all representations, warranties, and conditions relating to our website and the use of this website. Nothing in this disclaimer will:',
    ],
    bulletList: [
      'Limit or exclude our or your liability for death or personal injury;',
      'Limit or exclude our or your liability for fraud or fraudulent misrepresentation;',
      'Limit any of our or your liabilities in any way that is not permitted under applicable law; or',
      'Exclude any of our or your liabilities that may not be excluded under applicable law.',
    ],
  },
];

export const DISCLAIMER_FOOTER =
  'As long as the website and the information and services on the website are provided free of charge, we will not be liable for any loss or damage of any nature.';

export const FAQ_ITEMS: FaqItem[] = [
  { q: 'What is this?', a: 'This page outlines the privacy policy referencing mfl.com.' },
  { q: 'How is data used?', a: 'Data is handled carefully to protect user privacy and comply with laws.' },
  { q: 'Who can access data?', a: 'Only authorized personnel and systems involved in service delivery can access personal data.' },
  { q: 'Can I delete my data?', a: 'Yes, users can request data deletion following the procedures outlined in the policy.' },
  { q: 'How are cookies used?', a: 'Cookies help improve your experience and are managed as explained in the policy.' },
];

export const SUPPORT_EMAIL = 'support@mfl.com';
export const SUPPORT_PHONE = '+91-8951246886';
