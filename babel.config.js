// Map of PascalCase icon names → kebab-case filenames in lucide-react-native
const lucideIconFileMap = {
  AlertCircle: 'circle-alert',
  AlertTriangle: 'triangle-alert',
  ArrowLeft: 'arrow-left',
  BookOpen: 'book-open',
  BookmarkPlus: 'bookmark-plus',
  Brain: 'brain',
  Bug: 'bug',
  Camera: 'camera',
  Check: 'check',
  CheckCircle: 'circle-check-big',
  ChevronDown: 'chevron-down',
  ChevronUp: 'chevron-up',
  CreditCard: 'credit-card',
  Crown: 'crown',
  Droplet: 'droplet',
  Edit3: 'pen-line',
  Eye: 'eye',
  Flame: 'flame',
  History: 'history',
  Home: 'house',
  Image: 'image',
  ImageOff: 'image-off',
  Info: 'info',
  Leaf: 'leaf',
  Lightbulb: 'lightbulb',
  Lock: 'lock',
  LogOut: 'log-out',
  Mail: 'mail',
  MessageCircleQuestion: 'message-circle-question-mark',
  RotateCcw: 'rotate-ccw',
  RotateCw: 'rotate-cw',
  Save: 'save',
  ScanLine: 'scan-line',
  Send: 'send',
  Shield: 'shield',
  ShieldCheck: 'shield-check',
  SkipForward: 'skip-forward',
  Sparkles: 'sparkles',
  Sprout: 'sprout',
  Stethoscope: 'stethoscope',
  Tag: 'tag',
  Target: 'target',
  ThumbsDown: 'thumbs-down',
  ThumbsUp: 'thumbs-up',
  Trash2: 'trash-2',
  User: 'user',
  UserPlus: 'user-plus',
  Users: 'users',
  WifiOff: 'wifi-off',
  Wind: 'wind',
  X: 'x',
  Zap: 'zap',
};

module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      'nativewind/babel', // NativeWind v4 babel preset
    ],
    plugins: [
      ['transform-imports', {
        'lucide-react-native': {
          transform: function(importName) {
            const file = lucideIconFileMap[importName];
            if (file) {
              return 'lucide-react-native/dist/esm/icons/' + file;
            }
            // Fallback: convert PascalCase to kebab-case
            const kebab = importName
              .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
              .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
              .toLowerCase();
            return 'lucide-react-native/dist/esm/icons/' + kebab;
          },
          preventFullImport: true,
        },
      }],
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};
