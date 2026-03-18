import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Image as RNImage,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImageManipulator from 'expo-image-manipulator';

const CORNER_TOUCH = 28; // px radius to detect corner handle touch
const MIN_DIM = 60;      // minimum crop dimension in px

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropScreenProps {
  /** Local file URI or base64 data URL (data:image/jpeg;base64,...) */
  image: string;
  onCrop: (croppedImage: string) => void;
  onCancel: () => void;
}

type DragMode = 'move' | 'tl' | 'tr' | 'bl' | 'br';

export function CropScreen({ image, onCrop, onCancel }: CropScreenProps) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const [cropRect, setCropRect] = useState<CropRect>({ x: 0, y: 0, width: 0, height: 0 });
  const [ready, setReady] = useState(false);
  const [applying, setApplying] = useState(false);

  // Refs to avoid stale closures inside PanResponder
  const cropRectRef = useRef<CropRect>({ x: 0, y: 0, width: 0, height: 0 });
  const dragModeRef = useRef<DragMode>('move');
  const startCropRef = useRef<CropRect>({ x: 0, y: 0, width: 0, height: 0 });
  const containerSizeRef = useRef({ width: 0, height: 0 });

  // Resolve natural image size (works with both file URIs and base64 data URLs)
  useEffect(() => {
    RNImage.getSize(
      image,
      (w, h) => setImageNaturalSize({ width: w, height: h }),
      () => {}
    );
  }, [image]);

  const onContainerLayout = useCallback((e: any) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      containerSizeRef.current = { width, height };
      setContainerSize({ width, height });

      // Start crop rect at 10% inset on all sides
      const margin = Math.min(width, height) * 0.1;
      const rect: CropRect = {
        x: margin,
        y: margin,
        width: width - margin * 2,
        height: height - margin * 2,
      };
      setCropRect(rect);
      cropRectRef.current = rect;
      setReady(true);
    }
  }, []);

  const near = (a: number, b: number) => Math.abs(a - b) <= CORNER_TOUCH;
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (evt) => {
      const { locationX: tx, locationY: ty } = evt.nativeEvent;
      const r = cropRectRef.current;
      startCropRef.current = { ...r };

      if (near(tx, r.x) && near(ty, r.y)) dragModeRef.current = 'tl';
      else if (near(tx, r.x + r.width) && near(ty, r.y)) dragModeRef.current = 'tr';
      else if (near(tx, r.x) && near(ty, r.y + r.height)) dragModeRef.current = 'bl';
      else if (near(tx, r.x + r.width) && near(ty, r.y + r.height)) dragModeRef.current = 'br';
      else dragModeRef.current = 'move';
    },

    onPanResponderMove: (_, gs) => {
      const { dx, dy } = gs;
      const s = startCropRef.current;
      const { width: cw, height: ch } = containerSizeRef.current;
      let r: CropRect;

      switch (dragModeRef.current) {
        case 'move':
          r = {
            x: clamp(s.x + dx, 0, cw - s.width),
            y: clamp(s.y + dy, 0, ch - s.height),
            width: s.width,
            height: s.height,
          };
          break;
        case 'tl': {
          const nx = clamp(s.x + dx, 0, s.x + s.width - MIN_DIM);
          const ny = clamp(s.y + dy, 0, s.y + s.height - MIN_DIM);
          r = { x: nx, y: ny, width: s.width - (nx - s.x), height: s.height - (ny - s.y) };
          break;
        }
        case 'tr': {
          const ny = clamp(s.y + dy, 0, s.y + s.height - MIN_DIM);
          const nw = clamp(s.width + dx, MIN_DIM, cw - s.x);
          r = { x: s.x, y: ny, width: nw, height: s.height - (ny - s.y) };
          break;
        }
        case 'bl': {
          const nx = clamp(s.x + dx, 0, s.x + s.width - MIN_DIM);
          const nh = clamp(s.height + dy, MIN_DIM, ch - s.y);
          r = { x: nx, y: s.y, width: s.width - (nx - s.x), height: nh };
          break;
        }
        case 'br':
        default:
          r = {
            x: s.x,
            y: s.y,
            width: clamp(s.width + dx, MIN_DIM, cw - s.x),
            height: clamp(s.height + dy, MIN_DIM, ch - s.y),
          };
          break;
      }

      setCropRect(r);
      cropRectRef.current = r;
    },
  });

  const applyCrop = async () => {
    if (!imageNaturalSize.width || !imageNaturalSize.height) {
      onCrop(image);
      return;
    }
    setApplying(true);
    try {
      const { width: cw, height: ch } = containerSizeRef.current;
      const { width: iw, height: ih } = imageNaturalSize;

      // Calculate actual displayed image bounds inside the container (resizeMode="contain")
      const containerAspect = cw / ch;
      const imageAspect = iw / ih;
      let dispW: number, dispH: number, offsetX: number, offsetY: number;

      if (imageAspect > containerAspect) {
        // Image is wider → fills width, black bars on top/bottom
        dispW = cw;
        dispH = cw / imageAspect;
        offsetX = 0;
        offsetY = (ch - dispH) / 2;
      } else {
        // Image is taller → fills height, black bars on sides
        dispH = ch;
        dispW = ch * imageAspect;
        offsetX = (cw - dispW) / 2;
        offsetY = 0;
      }

      const scaleX = iw / dispW;
      const scaleY = ih / dispH;
      const r = cropRectRef.current;

      const originX = Math.max(0, Math.round((r.x - offsetX) * scaleX));
      const originY = Math.max(0, Math.round((r.y - offsetY) * scaleY));
      const cropWidth = Math.min(Math.round(r.width * scaleX), iw - originX);
      const cropHeight = Math.min(Math.round(r.height * scaleY), ih - originY);

      const result = await ImageManipulator.manipulateAsync(
        image,
        [{ crop: { originX, originY, width: Math.max(1, cropWidth), height: Math.max(1, cropHeight) } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      // Return as base64 data URL so it works consistently for both display and API upload
      const croppedImage = result.base64
        ? `data:image/jpeg;base64,${result.base64}`
        : result.uri;

      onCrop(croppedImage);
    } catch (err) {
      console.error('[CropScreen] crop error:', err);
      onCrop(image); // fallback: return original
    } finally {
      setApplying(false);
    }
  };

  const r = cropRect;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#111' }}>
        <View style={styles.toolbar}>
          <TouchableOpacity onPress={onCancel} style={styles.toolbarBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.toolbarTitle}>Crop Image</Text>
          <TouchableOpacity
            onPress={applyCrop}
            disabled={applying || !ready}
            style={styles.toolbarBtn}
          >
            <Text style={[styles.doneText, (!ready || applying) && styles.dimmed]}>
              {applying ? 'Applying…' : 'Done'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Image container with crop overlay */}
      <View style={{ flex: 1 }} onLayout={onContainerLayout} {...panResponder.panHandlers}>
        {/* pointerEvents="none" on every child so all touches reach the PanResponder */}
        <RNImage
          source={{ uri: image }}
          style={StyleSheet.absoluteFill}
          resizeMode="contain"
          pointerEvents="none"
        />

        {ready && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Dark overlays outside crop rect */}
            <View style={[styles.overlay, { top: 0, left: 0, right: 0, height: r.y }]} />
            <View style={[styles.overlay, { top: r.y + r.height, left: 0, right: 0, bottom: 0 }]} />
            <View style={[styles.overlay, { top: r.y, left: 0, width: r.x, height: r.height }]} />
            <View style={[styles.overlay, { top: r.y, left: r.x + r.width, right: 0, height: r.height }]} />

            {/* Crop border */}
            <View
              style={{
                position: 'absolute',
                left: r.x,
                top: r.y,
                width: r.width,
                height: r.height,
                borderWidth: 1.5,
                borderColor: 'rgba(255,255,255,0.9)',
              }}
            />

            {/* Rule-of-thirds grid lines */}
            <View style={[styles.gridLine, { left: r.x + r.width / 3, top: r.y, width: 1, height: r.height }]} />
            <View style={[styles.gridLine, { left: r.x + (r.width * 2) / 3, top: r.y, width: 1, height: r.height }]} />
            <View style={[styles.gridLine, { top: r.y + r.height / 3, left: r.x, height: 1, width: r.width }]} />
            <View style={[styles.gridLine, { top: r.y + (r.height * 2) / 3, left: r.x, height: 1, width: r.width }]} />

            {/* Corner handles */}
            {[
              { left: r.x - 8, top: r.y - 8 },
              { left: r.x + r.width - 8, top: r.y - 8 },
              { left: r.x - 8, top: r.y + r.height - 8 },
              { left: r.x + r.width - 8, top: r.y + r.height - 8 },
            ].map((pos, i) => (
              <View key={i} style={[styles.cornerHandle, pos]} />
            ))}
          </View>
        )}

        {applying && (
          <View style={[StyleSheet.absoluteFill, styles.loadingOverlay]} pointerEvents="none">
            <ActivityIndicator color="#fff" size="large" />
          </View>
        )}
      </View>

      <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#111' }}>
        <Text style={styles.hint}>Drag to reposition  •  Drag corners to resize</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toolbarBtn: {
    minWidth: 64,
  },
  toolbarTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 15,
  },
  doneText: {
    color: '#3F7C4C',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
  },
  dimmed: {
    opacity: 0.35,
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  cornerHandle: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  hint: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 10,
  },
  loadingOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
