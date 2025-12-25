import React, { useState } from "react";
import { View, Image, ActivityIndicator, ImageProps, StyleSheet } from "react-native";
import { ImageOff } from "lucide-react-native";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackIcon?: React.ReactNode;
  className?: string;
  style?: ImageProps['style'];
}

export function ImageWithFallback({
  src,
  alt,
  fallbackIcon,
  className,
  style,
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Validate URI on mount
  React.useEffect(() => {
    if (!src || src.trim() === '') {
      console.warn('[ImageWithFallback] Invalid URI: empty or null', { alt });
      setHasError(true);
      setIsLoading(false);
    }
  }, [src, alt]);

  const handleError = (error: any) => {
    console.error('[ImageWithFallback] Image failed to load:', {
      src: src?.substring(0, 100) + (src?.length > 100 ? '...' : ''),
      alt,
      error: error?.nativeEvent?.error || 'Unknown error'
    });
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    console.log('[ImageWithFallback] Image loaded successfully:', { alt });
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <View
        className={`items-center justify-center bg-muted rounded-2xl ${className || ""}`}
        accessibilityRole="image"
        accessibilityLabel={alt}
        style={[styles.container, style]}
      >
        {fallbackIcon || <ImageOff size={36} color="#6B7280" strokeWidth={1.8} />}
      </View>
    );
  }

  return (
    <View
      className={`overflow-hidden rounded-2xl ${className || ""}`}
      style={[styles.container, style]}
    >
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3F7C4C" />
        </View>
      )}

      <Image
        source={{ uri: src }}
        accessibilityLabel={alt}
        style={[
          styles.image,
          isLoading && styles.hidden,
          style,
        ]}
        resizeMode="cover"
        onLoad={handleLoad}
        onError={handleError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F4F7F2',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F7F2',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  hidden: {
    opacity: 0,
  },
});