/**
 * @fileoverview Privacy Policy Screen
 * @module app/(app)/privacy-policy
 *
 * @description
 * Privacy policy content mirrored from web app.
 * Scrollable, section-based layout with collapsible FAQs.
 */

import Feather from '@expo/vector-icons/Feather';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from 'heroui-native';
import { withUniwind } from 'uniwind';
import { AppText } from '../../components/app-text';
import { ScreenScrollView } from '../../components/screen-scroll-view';
import { useAppTheme } from '../../contexts/app-theme-context';

const StyledFeather = withUniwind(Feather);

const FAQ_ITEMS = [
  { q: 'What is this?', a: 'This page outlines the privacy policy referencing mfl.com.' },
  { q: 'How is data used?', a: 'Data is handled carefully to protect user privacy and comply with laws.' },
  { q: 'Who can access data?', a: 'Only authorized personnel and systems involved in service delivery can access personal data.' },
  { q: 'Can I delete my data?', a: 'Yes, users can request data deletion following the procedures outlined in the policy.' },
  { q: 'How are cookies used?', a: 'Cookies help improve your experience and are managed as explained in the policy.' },
];

export default function PrivacyPolicyScreen() {
  const { isDark } = useAppTheme();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <ScreenScrollView>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(300)} className="mb-6">
        <Card className="shadow-none border border-separator">
          <View className="gap-2">
            <AppText className="text-sm text-muted leading-relaxed">
              These terms and conditions outline the rules and regulations for the use of MFL's Website, located at{' '}
              <AppText className="text-sm font-medium text-foreground">www.mfl.com</AppText>.
            </AppText>
            <AppText className="text-sm text-muted leading-relaxed">
              By accessing this website, we assume you accept these terms and conditions. Do not continue to use MFL if you do not agree to take all of the terms and conditions stated on this page.
            </AppText>
          </View>
        </Card>
      </Animated.View>

      <View className="gap-5">
        {/* Cookies */}
        <PolicySection icon="shield" title="Cookies" delay={50}>
          <AppText className="text-sm text-muted leading-relaxed">
            The website uses cookies to help personalize your online experience. By accessing MFL.com, you agreed to use the required cookies.
          </AppText>
          <AppText className="text-sm text-muted leading-relaxed">
            A cookie is a text file that is placed on your hard disk by a web page server. Cookies cannot be used to run programs or deliver viruses to your computer. Cookies are uniquely assigned to you and can only be read by a web server in the domain that issued the cookie to you.
          </AppText>
          <AppText className="text-sm text-muted leading-relaxed">
            We may use cookies to collect, store, and track information for statistical or marketing purposes to operate our website. You have the ability to accept or decline optional Cookies. There are some required Cookies that are necessary for the operation of our website.
          </AppText>
        </PolicySection>

        {/* License */}
        <PolicySection icon="award" title="License" delay={100}>
          <AppText className="text-sm text-muted leading-relaxed">
            Unless otherwise stated, MFL and/or its licensors own the intellectual property rights for all material on MFL. All intellectual property rights are reserved. You may access this from MFL for your own personal use subjected to restrictions set in these terms and conditions.
          </AppText>
          <RestrictedList
            heading="You must not:"
            items={[
              'Copy or republish material from mfl.com',
              'Sell, rent, or sub-license material from mfl.com',
              'Reproduce, duplicate or copy material from mfl.com',
              'Redistribute content from mfl.com',
            ]}
          />
          <AppText className="text-sm text-muted leading-relaxed">
            MFL reserves the right to monitor all Comments and remove any Comments that can be considered inappropriate, offensive, or causes breach of these Terms and Conditions.
          </AppText>
        </PolicySection>

        {/* Hyperlinking */}
        <PolicySection icon="link" title="Hyperlinking to our Content" delay={150}>
          <AppText className="text-sm text-muted leading-relaxed">
            The following organizations may link to our Website without prior written approval: Government agencies, Search engines, News organizations, and Online directory distributors.
          </AppText>
          <AppText className="text-sm text-muted leading-relaxed">
            These organizations may link to our home page, to publications, or to other Website information so long as the link: (a) is not in any way deceptive; (b) does not falsely imply sponsorship, endorsement, or approval; and (c) fits within the context of the linking party's site.
          </AppText>
          <AppText className="text-sm text-muted leading-relaxed">
            No use of MFL's logo or other artwork will be allowed for linking absent a trademark license agreement.
          </AppText>
        </PolicySection>

        {/* Content Liability */}
        <PolicySection icon="file-text" title="Content Liability" delay={200}>
          <AppText className="text-sm text-muted leading-relaxed">
            We shall not be held responsible for any content that appears on your Website. You agree to protect and defend us against all claims that are raised on your Website. No link(s) should appear on any Website that may be interpreted as libelous, obscene, or criminal, or which infringes, otherwise violates, or advocates the infringement or other violation of, any third party rights.
          </AppText>
        </PolicySection>

        {/* Reservation of Rights */}
        <PolicySection icon="bookmark" title="Reservation of Rights" delay={250}>
          <AppText className="text-sm text-muted leading-relaxed">
            We reserve the right to request that you remove all links or any particular link to our Website. You approve to immediately remove all links to our Website upon request. We also reserve the right to amend these terms and conditions and its linking policy at any time.
          </AppText>
        </PolicySection>

        {/* Removal of Links */}
        <PolicySection icon="trash-2" title="Removal of Links" delay={300}>
          <AppText className="text-sm text-muted leading-relaxed">
            If you find any link on our Website that is offensive for any reason, you are free to contact and inform us at any moment. We will consider requests to remove links, but we are not obligated to or so or to respond to you directly.
          </AppText>
          <AppText className="text-sm text-muted leading-relaxed">
            We do not ensure that the information on this website is correct. We do not warrant its completeness or accuracy, nor do we promise to ensure that the website remains available or that the material on the website is kept up to date.
          </AppText>
        </PolicySection>

        {/* Disclaimer */}
        <PolicySection icon="alert-triangle" title="Disclaimer" delay={350}>
          <AppText className="text-sm text-muted leading-relaxed">
            To the maximum extent permitted by applicable law, we exclude all representations, warranties, and conditions relating to our website and the use of this website. Nothing in this disclaimer will:
          </AppText>
          <BulletList items={[
            'Limit or exclude our or your liability for death or personal injury;',
            'Limit or exclude our or your liability for fraud or fraudulent misrepresentation;',
            'Limit any of our or your liabilities in any way that is not permitted under applicable law; or',
            'Exclude any of our or your liabilities that may not be excluded under applicable law.',
          ]} />
          <AppText className="text-sm text-muted leading-relaxed">
            As long as the website and the information and services on the website are provided free of charge, we will not be liable for any loss or damage of any nature.
          </AppText>
        </PolicySection>

        {/* FAQs */}
        <Animated.View entering={FadeInDown.duration(300).delay(400)}>
          <Card className="shadow-none border border-separator">
            <View className="gap-1">
              <View className="flex-row items-center gap-2 mb-3">
                <StyledFeather name="help-circle" size={18} className="text-accent" />
                <AppText className="text-base font-semibold text-foreground">Frequently Asked Questions</AppText>
              </View>
              {FAQ_ITEMS.map((faq, i) => (
                <Pressable
                  key={i}
                  onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="border-t border-separator pt-3"
                >
                  <View className="flex-row items-center justify-between">
                    <AppText className="text-sm font-medium text-foreground flex-1">{faq.q}</AppText>
                    <StyledFeather
                      name={expandedFaq === i ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      className="text-muted"
                    />
                  </View>
                  {expandedFaq === i && (
                    <AppText className="text-sm text-muted mt-2 leading-relaxed">{faq.a}</AppText>
                  )}
                </Pressable>
              ))}
            </View>
          </Card>
        </Animated.View>

        {/* Footer */}
        <View className="items-center gap-1 py-6">
          <AppText className="text-xs text-muted">
            &copy; {new Date().getFullYear()} MFL. All rights reserved.
          </AppText>
          <AppText className="text-xs text-muted">support@mfl.com | +91-8951246886</AppText>
        </View>
      </View>
    </ScreenScrollView>
  );
}

/* ── Sub-components ── */

function PolicySection({
  icon,
  title,
  delay = 0,
  children,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <Animated.View entering={FadeInDown.duration(300).delay(delay)}>
      <Card className="shadow-none border border-separator">
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <StyledFeather name={icon} size={18} className="text-accent" />
            <AppText className="text-base font-semibold text-foreground">{title}</AppText>
          </View>
          {children}
        </View>
      </Card>
    </Animated.View>
  );
}

function RestrictedList({ heading, items }: { heading: string; items: string[] }) {
  return (
    <View className="rounded-lg bg-danger/5 border border-danger/10 p-3 gap-2">
      <AppText className="text-sm font-medium text-foreground">{heading}</AppText>
      {items.map((item, i) => (
        <View key={i} className="flex-row items-start gap-2">
          <View className="h-5 w-5 rounded-full border border-danger/30 items-center justify-center mt-0.5">
            <AppText className="text-[10px] text-danger">{i + 1}</AppText>
          </View>
          <AppText className="text-sm text-muted flex-1">{item}</AppText>
        </View>
      ))}
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <View className="gap-2 pl-1">
      {items.map((item, i) => (
        <View key={i} className="flex-row items-start gap-2.5">
          <View className="mt-2 h-1.5 w-1.5 rounded-full bg-accent/60" />
          <AppText className="text-sm text-muted flex-1">{item}</AppText>
        </View>
      ))}
    </View>
  );
}
