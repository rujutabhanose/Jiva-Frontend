// src/screens/CarouselScreen.tsx
import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import { Button } from '../components/ui/Button';

interface CarouselScreenProps {
  onFinish: () => void;
}

const images = [
  require('../../assets/carousel/1.jpg'),
  require('../../assets/carousel/3.jpg'),
  require('../../assets/carousel/4.jpg'),
  require('../../assets/carousel/5.jpg'),
];

export function CarouselScreen({ onFinish }: CarouselScreenProps) {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH
    );
    if (index !== currentIndex) setCurrentIndex(index);
  };

  const isLast = currentIndex === images.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* FULLSCREEN CAROUSEL */}
      <Animated.FlatList
        style={StyleSheet.absoluteFillObject}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false, listener: handleScroll }
        )}
        scrollEventThrottle={16}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <Image
            source={item}
            style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
            resizeMode="cover"
          />
        )}
      />

      {/* TOP GRADIENT */}
      <LinearGradient
        colors={['rgba(0,0,0,0.5)', 'transparent']}
        style={styles.topGradient}
        pointerEvents="none"
      />

      {/* HEADER OVERLAY */}
      <SafeAreaView edges={['top']} style={styles.headerOverlay} pointerEvents="none">
        <View style={styles.progressRow}>
          {images.map((_, idx) => (
            <View key={idx} style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  idx < currentIndex && styles.progressFillComplete,
                  idx === currentIndex && styles.progressFillActive,
                ]}
              />
            </View>
          ))}
        </View>
      </SafeAreaView>

      {/* SWIPE HINT */}
      {currentIndex === 0 && (
        <View style={styles.hintContainer} pointerEvents="none">
          <View style={styles.hintPill}>
            <Text style={styles.hintText}>Swipe to see how it works</Text>
            <ChevronRight size={16} color="white" />
          </View>
        </View>
      )}

      <SafeAreaView edges={['bottom']} style={styles.bottomOverlay}>
        {isLast && (
          <View style={styles.ctaWrapper}>
            <Button fullWidth onPress={onFinish}>
              Get started
            </Button>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
  },

  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },

  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  hintContainer: {
    position: 'absolute',
    bottom: 120,
    width: '100%',
    alignItems: 'center',
  },

  hintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  hintText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 6,
  },

  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },

  progressRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },

  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    width: '0%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },

  progressFillComplete: {
    width: '100%',
  },

  progressFillActive: {
    width: '100%',
    opacity: 1,
  },

  ctaWrapper: {
    width: '100%',
  },
});
