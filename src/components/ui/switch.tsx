import * as React from "react";
import { Switch as RNSwitch, SwitchProps as RNSwitchProps } from "react-native";

interface SwitchProps extends RNSwitchProps {
  value?: boolean;
  onValueChange?: (value: boolean) => void;
}

const Switch = React.forwardRef<RNSwitch, SwitchProps>(
  ({ value, onValueChange, ...props }, ref) => (
    <RNSwitch
      ref={ref}
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#E5E7EB', true: '#3F7C4C' }}
      thumbColor={value ? '#FEFCE8' : '#F3F4F6'}
      ios_backgroundColor="#E5E7EB"
      {...props}
    />
  )
);

Switch.displayName = "Switch";

export { Switch };
