import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useState } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'ValueProps'>;

interface Slide {
  key: string;
  title: string;
  description: string;
}

/**
 * Copy matches modules that actually exist today (Tasks/Households, Pets,
 * Moments, Savings) — no invented capabilities.
 */
const SLIDES: Slide[] = [
  {
    key: 'households',
    title: 'Organiza tu hogar',
    description: 'Reparte tareas del hogar y llévalas al día con quienes vives.',
  },
  {
    key: 'pets',
    title: 'Cuida a los tuyos',
    description: 'Registra a tus mascotas y no se te pase ningún cuidado.',
  },
  {
    key: 'moments',
    title: 'Guarda los momentos',
    description: 'Captura los momentos que importan junto a tu círculo cercano.',
  },
  {
    key: 'savings',
    title: 'Ahorra en equipo',
    description: 'Define metas de ahorro y avancen juntos hacia ellas.',
  },
];

const LAST_INDEX = SLIDES.length - 1;

/**
 * Simple horizontal `ScrollView` + `pagingEnabled` carousel with dot
 * pagination — no carousel library is a dependency of this project, and the
 * copy is short enough that this covers it without pulling one in.
 *
 * The primary action and the skip link both go straight to `ChooseMethod`
 * (per spec): swiping is how the user moves between slides, the CTA always
 * moves the user forward out of the intro, it just relabels to "Comenzar" on
 * the last slide to read naturally.
 */
export const ValuePropsScreen = ({ navigation }: Props): JSX.Element => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { width } = useWindowDimensions();
  const styles = useThemedStyles(makeStyles);

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const page = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(Math.min(Math.max(page, 0), LAST_INDEX));
  };

  const goToChooseMethod = (): void => navigation.navigate('ChooseMethod');

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        testID="value-props-scroll"
      >
        {SLIDES.map((slide) => (
          <View key={slide.key} style={[styles.slide, { width }]}>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots} testID="value-props-dots">
        {SLIDES.map((slide, index) => (
          <View
            key={slide.key}
            style={[styles.dot, index === activeIndex ? styles.dotActive : null]}
          />
        ))}
      </View>

      <View style={styles.actions}>
        <Button
          label={activeIndex === LAST_INDEX ? 'Comenzar' : 'Siguiente'}
          onPress={goToChooseMethod}
          variant="primaryTonal"
          size="xl"
          testID="value-props-primary"
        />
        <Button
          label="Omitir"
          onPress={goToChooseMethod}
          variant="linkNeutral"
          style={styles.skip}
          testID="value-props-skip"
        />
      </View>
    </View>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: spacing.s16,
    paddingBottom: spacing.s6,
    gap: spacing.s6,
  },
  slide: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: spacing.s8,
    gap: spacing.s3,
  },
  title: {
    ...typography.h2,
    color: theme.text,
    textAlign: 'center' as const,
  },
  description: {
    ...typography.body,
    color: theme.textMuted,
    textAlign: 'center' as const,
  },
  dots: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    gap: spacing.s2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.border,
  },
  dotActive: {
    backgroundColor: theme.primary,
  },
  actions: {
    gap: spacing.s3,
    paddingHorizontal: spacing.s6,
  },
  // The skip link keeps its content width and centres itself; only the primary
  // action stretches, so the two do not read as a single stacked pair.
  skip: {
    alignSelf: 'center' as const,
  },
});
