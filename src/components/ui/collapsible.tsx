import * as React from "react";
import { View, TouchableOpacity, TouchableOpacityProps, ViewProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

interface CollapsibleContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);

interface CollapsibleProps extends ViewProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Collapsible: React.FC<CollapsibleProps> = ({
  open: controlledOpen,
  onOpenChange,
  children,
  ...props
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange]
  );

  const contextValue = React.useMemo(
    () => ({ open, onOpenChange: handleOpenChange }),
    [open, handleOpenChange]
  );

  return (
    <CollapsibleContext.Provider value={contextValue}>
      <View {...props}>{children}</View>
    </CollapsibleContext.Provider>
  );
};

interface CollapsibleTriggerProps extends TouchableOpacityProps {
  children: React.ReactNode;
}

const CollapsibleTrigger: React.FC<CollapsibleTriggerProps> = ({
  children,
  onPress,
  ...props
}) => {
  const context = React.useContext(CollapsibleContext);

  if (!context) {
    throw new Error("CollapsibleTrigger must be used within a Collapsible");
  }

  const handlePress = (event: any) => {
    context.onOpenChange(!context.open);
    onPress?.(event);
  };

  return (
    <TouchableOpacity onPress={handlePress} {...props}>
      {children}
    </TouchableOpacity>
  );
};

interface CollapsibleContentProps extends ViewProps {
  children: React.ReactNode;
}

const CollapsibleContent: React.FC<CollapsibleContentProps> = ({
  children,
  ...props
}) => {
  const context = React.useContext(CollapsibleContext);

  if (!context) {
    throw new Error("CollapsibleContent must be used within a Collapsible");
  }

  const height = useSharedValue(context.open ? 1 : 0);

  React.useEffect(() => {
    height.value = withTiming(context.open ? 1 : 0, { duration: 200 });
  }, [context.open, height]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: height.value,
      maxHeight: height.value === 0 ? 0 : undefined,
      overflow: "hidden",
    };
  });

  if (!context.open && height.value === 0) {
    return null;
  }

  return (
    <Animated.View style={animatedStyle} {...props}>
      {children}
    </Animated.View>
  );
};

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
