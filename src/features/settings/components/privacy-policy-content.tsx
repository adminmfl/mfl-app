import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import {
  PRIVACY_INTRO,
  POLICY_SECTIONS,
  DISCLAIMER_FOOTER,
  FAQ_ITEMS,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
} from '../data/privacy-policy-data';
import { PolicySection } from './policy-section';
import { RestrictedList } from './restricted-list';
import { BulletList } from './bullet-list';
import { FaqSection } from './faq-section';

export function PrivacyPolicyContent() {
  return (
    <ScreenScrollView>
      {/* Intro */}
      <Animated.View entering={FadeInDown.duration(300)} className="mb-6">
        <Card className="shadow-none border border-separator">
          <View className="gap-2">
            {PRIVACY_INTRO.map((text, i) => (
              <AppText key={i} className="text-sm text-muted leading-relaxed">
                {i === 0 ? (
                  <>
                    {text.split('www.mfl.com')[0]}
                    <AppText className="text-sm font-medium text-foreground">www.mfl.com</AppText>
                    {text.split('www.mfl.com')[1]}
                  </>
                ) : (
                  text
                )}
              </AppText>
            ))}
          </View>
        </Card>
      </Animated.View>

      <View className="gap-5">
        {POLICY_SECTIONS.map((section, i) => (
          <PolicySection
            key={section.title}
            icon={section.icon}
            title={section.title}
            delay={(i + 1) * 50}
          >
            {section.paragraphs.map((p, j) => (
              <AppText key={j} className="text-sm text-muted leading-relaxed">
                {p}
              </AppText>
            ))}
            {section.restrictedList && (
              <RestrictedList
                heading={section.restrictedList.heading}
                items={section.restrictedList.items}
              />
            )}
            {section.bulletList && <BulletList items={section.bulletList} />}
            {/* Disclaimer section extra footer paragraph */}
            {section.title === 'Disclaimer' && (
              <AppText className="text-sm text-muted leading-relaxed">
                {DISCLAIMER_FOOTER}
              </AppText>
            )}
          </PolicySection>
        ))}

        <FaqSection items={FAQ_ITEMS} />

        {/* Footer */}
        <View className="items-center gap-1 py-6">
          <AppText className="text-xs text-muted">
            &copy; {new Date().getFullYear()} MFL. All rights reserved.
          </AppText>
          <AppText className="text-xs text-muted">
            {SUPPORT_EMAIL} | {SUPPORT_PHONE}
          </AppText>
        </View>
      </View>
    </ScreenScrollView>
  );
}
