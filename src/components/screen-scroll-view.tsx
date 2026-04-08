import { HeaderHeightContext } from '@react-navigation/elements';
import { cn } from 'heroui-native';
import {
  type FC,
  type PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  type ScrollViewProps,
} from 'react-native';
import Animated, { type AnimatedProps } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface Props extends AnimatedProps<ScrollViewProps> {
  className?: string;
  contentContainerClassName?: string;
  /** Wrap with KeyboardAvoidingView for screens with form inputs */
  avoidKeyboard?: boolean;
  /** Pass an async function to enable pull-to-refresh */
  onRefresh?: () => Promise<unknown> | void;
}

export const ScreenScrollView: FC<PropsWithChildren<Props>> = ({
  children,
  className,
  contentContainerClassName,
  avoidKeyboard = false,
  onRefresh,
  ...props
}) => {
  const insets = useSafeAreaInsets();
  const headerHeight = useContext(HeaderHeightContext) ?? 0;
  const topPad = Math.max(headerHeight, insets.top + (Platform.OS === 'ios' ? 44 : 56));
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  const scrollView = (
    <AnimatedScrollView
      className={cn('bg-background', className)}
      contentContainerClassName={cn('px-5', contentContainerClassName)}
      contentContainerStyle={{
        paddingTop: topPad,
        paddingBottom: insets.bottom + 32,
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      {...(onRefresh
        ? {
            refreshControl: (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                progressViewOffset={topPad}
              />
            ),
          }
        : {})}
      {...props}
    >
      {children}
    </AnimatedScrollView>
  );

  if (!avoidKeyboard) return scrollView;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      {scrollView}
    </KeyboardAvoidingView>
  );
};
