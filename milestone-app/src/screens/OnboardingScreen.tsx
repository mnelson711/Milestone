import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { requestNotificationPermissions } from '../utils/notifications';
import ScreenContainer from '../components/ScreenContainer';
import AppText from '../components/AppText';

type Props = {
  onFinish: () => void;
};

type SlideType = 'events' | 'milestones' | 'notifications';

type Slide = {
  title: string;
  description: string;
  type: SlideType;
};

const slides: Slide[] = [
  {
    title: 'Track the moments that matter',
    description:
      'Save birthdays, anniversaries, goals, and more — all in one place.',
    type: 'events',
  },
  {
    title: 'Celebrate time in a new way',
    description:
      'See your dates transform into milestones like 1,000 days, 10,000 hours, and more.',
    type: 'milestones',
  },
  {
    title: 'Never miss a milestone',
    description:
      'Get notified when something meaningful reaches a moment worth celebrating.',
    type: 'notifications',
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OnboardingScreen({ onFinish }: Props) {
  const { theme } = useTheme();
  const flatListRef = useRef<Animated.FlatList<Slide> | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const nextOpacity = useRef(new Animated.Value(1)).current;
  const enableOpacity = useRef(new Animated.Value(0)).current;
  const notNowOpacity = useRef(new Animated.Value(0)).current;
  const nextTranslateY = useRef(new Animated.Value(0)).current;
  const enableTranslateY = useRef(new Animated.Value(6)).current;
  const [currentSlide, setCurrentSlide] = useState(0);

  const pageWidth = SCREEN_WIDTH - theme.spacing.md * 2;
  const isLastSlide = currentSlide === slides.length - 1;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'space-between',
    },
    topRow: {
      alignItems: 'flex-end',
      marginBottom: theme.spacing.lg,
    },
    sliderWrapper: {
      flex: 1,
    },
    slidePage: {
      width: pageWidth,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      width: '100%',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    visualContainer: {
      width: '100%',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    title: {
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    description: {
      textAlign: 'center',
      lineHeight: 24,
      maxWidth: 320,
    },
    footer: {
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    dot: {
      height: 10,
      borderRadius: 999,
    },
    secondaryAction: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    previewCard: {
      width: '100%',
      maxWidth: 300,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
    },
    stackedCard: {
      marginBottom: theme.spacing.md,
    },
    highlightCard: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    previewTitle: {
      fontWeight: '600',
      marginBottom: 4,
    },
    notificationCard: {
      width: '100%',
      maxWidth: 320,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
    },
    actionArea: {
      minHeight: 92,
      justifyContent: 'flex-start',
    },
    morphButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: theme.radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    morphLabelContainer: {
      height: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    morphLabelLayer: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    morphLabelText: {
      color: theme.colors.white,
      fontWeight: '600',
      fontSize: 16,
    },
    secondaryActionSlot: {
      marginTop: theme.spacing.md,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  const animateActionLabels = (showLastSlideState: boolean) => {
    Animated.parallel([
      Animated.timing(nextOpacity, {
        toValue: showLastSlideState ? 0 : 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(enableOpacity, {
        toValue: showLastSlideState ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(notNowOpacity, {
        toValue: showLastSlideState ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(nextTranslateY, {
        toValue: showLastSlideState ? -6 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(enableTranslateY, {
        toValue: showLastSlideState ? 0 : 6,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const goToSlide = (index: number) => {
    flatListRef.current?.scrollToOffset({
      offset: index * pageWidth,
      animated: true,
    });

    setCurrentSlide(index);
    animateActionLabels(index === slides.length - 1);
  };

  const handleNext = () => {
    if (isLastSlide) {
      return;
    }

    goToSlide(currentSlide + 1);
  };

  const handlePrimaryAction = async () => {
    if (isLastSlide) {
      try {
        await requestNotificationPermissions();
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
      } finally {
        onFinish();
      }

      return;
    }

    handleNext();
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / pageWidth);
    setCurrentSlide(newIndex);
    animateActionLabels(newIndex === slides.length - 1);
  };

  const renderVisual = (type: SlideType) => {
    if (type === 'events') {
      return (
        <View style={{ width: '100%', alignItems: 'center' }}>
          <View style={[styles.previewCard, styles.stackedCard]}>
            <AppText variant="body" style={styles.previewTitle}>
              Mom&apos;s Birthday
            </AppText>
            <AppText variant="muted">March 12</AppText>
          </View>

          <View style={styles.previewCard}>
            <AppText variant="body" style={styles.previewTitle}>
              Trip to California
            </AppText>
            <AppText variant="muted">June 1</AppText>
          </View>
        </View>
      );
    }

    if (type === 'milestones') {
      return (
        <View style={[styles.previewCard, styles.highlightCard]}>
          <AppText
            variant="body"
            style={[styles.previewTitle, { color: theme.colors.white }]}
          >
            10,000 days old 🎉
          </AppText>
          <AppText variant="body" style={{ color: theme.colors.white }}>
            Today
          </AppText>
        </View>
      );
    }

    return (
      <View style={styles.notificationCard}>
        <AppText variant="body">
          🎉 Emma&apos;s Birthday hits 10,000 days tomorrow
        </AppText>
      </View>
    );
  };

  const renderSlide = ({ item, index }: { item: Slide; index: number }) => {
    const inputRange = [
      (index - 1) * pageWidth,
      index * pageWidth,
      (index + 1) * pageWidth,
    ];

    const animatedCardOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.35, 1, 0.35],
      extrapolate: 'clamp',
    });

    const animatedCardScale = scrollX.interpolate({
      inputRange,
      outputRange: [0.92, 1, 0.92],
      extrapolate: 'clamp',
    });

    const animatedCardTranslateX = scrollX.interpolate({
      inputRange,
      outputRange: [30, 0, -30],
      extrapolate: 'clamp',
    });

    const animatedTextOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.25, 1, 0.25],
      extrapolate: 'clamp',
    });

    const animatedTextTranslateY = scrollX.interpolate({
      inputRange,
      outputRange: [10, 0, 10],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slidePage}>
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.visualContainer,
              {
                opacity: animatedCardOpacity,
                transform: [
                  { translateX: animatedCardTranslateX },
                  { scale: animatedCardScale },
                ],
              },
            ]}
          >
            {renderVisual(item.type)}
          </Animated.View>

          <Animated.View
            style={{
              opacity: animatedTextOpacity,
              transform: [{ translateY: animatedTextTranslateY }],
            }}
          >
            <AppText variant="title" style={styles.title}>
              {item.title}
            </AppText>

            <AppText variant="body" style={styles.description}>
              {item.description}
            </AppText>
          </Animated.View>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.sliderWrapper}>
          <Animated.FlatList
            ref={flatListRef}
            data={slides}
            renderItem={({ item, index }) => renderSlide({ item, index })}
            keyExtractor={(item) => item.title}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            onMomentumScrollEnd={handleScrollEnd}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            getItemLayout={(_, index) => ({
              length: pageWidth,
              offset: pageWidth * index,
              index,
            })}
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.dotsContainer}>
            {slides.map((_, index) => {
              const inputRange = [
                (index - 1) * pageWidth,
                index * pageWidth,
                (index + 1) * pageWidth,
              ];

              const animatedWidth = scrollX.interpolate({
                inputRange,
                outputRange: [10, 24, 10],
                extrapolate: 'clamp',
              });

              const animatedOpacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.4, 1, 0.4],
                extrapolate: 'clamp',
              });

              const animatedScale = scrollX.interpolate({
                inputRange,
                outputRange: [1, 1.08, 1],
                extrapolate: 'clamp',
              });

              const backgroundColor = scrollX.interpolate({
                inputRange,
                outputRange: [
                  theme.colors.border,
                  theme.colors.primary,
                  theme.colors.border,
                ],
                extrapolate: 'clamp',
              });

              return (
                <Pressable key={index} onPress={() => goToSlide(index)}>
                  <Animated.View
                    style={[
                      styles.dot,
                      {
                        width: animatedWidth,
                        opacity: animatedOpacity,
                        transform: [{ scale: animatedScale }],
                        backgroundColor,
                      },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actionArea}>
            <Pressable onPress={handlePrimaryAction} style={styles.morphButton}>
              <View style={styles.morphLabelContainer}>
                <Animated.View
                  style={[
                    styles.morphLabelLayer,
                    {
                      opacity: nextOpacity,
                      transform: [{ translateY: nextTranslateY }],
                    },
                  ]}
                >
                  <AppText style={styles.morphLabelText}>Next</AppText>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.morphLabelLayer,
                    {
                      opacity: enableOpacity,
                      transform: [{ translateY: enableTranslateY }],
                    },
                  ]}
                >
                  <AppText style={styles.morphLabelText}>
                    Enable Notifications
                  </AppText>
                </Animated.View>
              </View>
            </Pressable>

            <View style={styles.secondaryActionSlot}>
              <Animated.View style={{ opacity: notNowOpacity }}>
                <Pressable onPress={onFinish} style={styles.secondaryAction}>
                  <AppText variant="muted">Not Now</AppText>
                </Pressable>
              </Animated.View>
            </View>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}