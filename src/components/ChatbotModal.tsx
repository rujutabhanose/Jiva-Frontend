import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Send, MessageCircle } from 'lucide-react-native';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
}

interface FAQ {
  question: string;
  keywords: string[];
  answer: string;
}

const FAQS: FAQ[] = [
  {
    question: 'How do I use Jivaplants?',
    keywords: ['how to use', 'how do i use', 'get started', 'start', 'use the app', 'tutorial', 'guide', 'steps'],
    answer:
      '1. Open the app and tap "Identify Plant" or "Detect Issues Early" on the Home screen.\n\n2. Tap "Use Camera" to take a live photo, or "Upload from Gallery" to pick an existing one.\n\n3. For best results, get close to the leaf or affected area in good lighting.\n\n4. The app will show you the plant name or detected issue along with care tips and next steps.\n\n5. View all your past scans anytime in the History tab.',
  },
  {
    question: 'What is Jivaplants?',
    keywords: ['what is jivaplants', 'jivaplants', 'about jivaplants', 'what is this app', 'plant companion'],
    answer:
      'Jivaplants is a plant companion app that helps you identify plants, detect visible issues, and get care tips using your phone\'s camera.\n\nTake or upload a photo of a leaf, flower, or whole plant and Jivaplants shows likely matches plus practical guidance.',
  },
  {
    question: 'How does Jivaplants work?',
    keywords: ['how does jivaplants work', 'how it works', 'how does it work', 'analyze', 'compare'],
    answer:
      'Jivaplants analyzes the photo you take or upload and compares it against its plant knowledge to suggest plant names and possible issues.\n\nYou then see species suggestions, basic information, and care tips based on what the app detects in the image.',
  },
  {
    question: 'Can Jivaplants detect plant problems?',
    keywords: ['detect plant problems', 'spot issues', 'plant problems', 'wilting', 'pest damage', 'discoloration', 'spots'],
    answer:
      'Yes. Jivaplants can often spot visible signs such as spots, discoloration, wilting, or pest damage on leaves and stems.\n\nFor many common issues, the app suggests likely causes and practical next steps you can try at home.',
  },
  {
    question: 'What kind of tips and solutions does the app provide?',
    keywords: ['tips', 'solutions', 'sunlight', 'watering', 'soil', 'fertilizer', 'troubleshooting', 'guidance'],
    answer:
      'For each identified plant, Jivaplants can show sunlight, watering, soil, and fertilizer guidance, plus simple troubleshooting steps.\n\nWhen an issue is detected, you may see suggestions such as adjusting light or watering, improving drainage, or checking for pests.',
  },
  {
    question: 'How accurate are identifications and diagnoses?',
    keywords: ['accurate', 'accuracy', 'correct', 'reliable', 'confidence', 'identification accuracy'],
    answer:
      'Accuracy depends on photo quality, how clearly the plant and symptoms are visible, and whether that plant and issue are well represented in our data.\n\nThink of Jivaplants as a smart assistant: very helpful for common plants and problems, but not a perfect replacement for a local expert or lab test.',
  },
  {
    question: 'How can I improve identification accuracy?',
    keywords: ['improve accuracy', 'better photo', 'clear photo', 'good light', 'best results', 'improve detection'],
    answer:
      'For best results, take clear photos in good light, with the plant filling most of the frame and minimal background clutter.\n\nCapture both close‑ups of the affected area (spots, pests, discoloration) and a wider shot of the whole plant when possible.',
  },
  {
    question: 'Is Jivaplants a substitute for professional advice?',
    keywords: ['professional advice', 'substitute', 'agronomist', 'expert', 'nursery', 'professional'],
    answer:
      'No. Jivaplants is an educational and guidance tool, not a medical or professional agricultural service.\n\nFor valuable or sensitive crops, toxic plants, or serious infestations, always confirm with a local agronomist, nursery, or plant expert.',
  },
  {
    question: 'Does Jivaplants work offline?',
    keywords: ['offline', 'internet', 'connection', 'no internet', 'without internet', 'online'],
    answer:
      'Jivaplants may need an internet connection to analyze your images and retrieve the latest plant and issue information.\n\nYou can usually still take and save photos offline and run identification when you are back online.',
  },
  {
    question: 'What kinds of plants can Jivaplants help with?',
    keywords: ['what plants', 'kinds of plants', 'houseplants', 'crops', 'garden plants', 'farm', 'coverage'],
    answer:
      'Jivaplants focuses on common houseplants, garden plants, and many farm and field crops, and we continue expanding our coverage.\n\nSome rare or very similar species may still be hard to separate from a single photo, so always cross‑check before taking critical actions.',
  },
  {
    question: 'How is my data used?',
    keywords: ['data used', 'photos used', 'data usage', 'improve models', 'selling data'],
    answer:
      'Your photos are used to provide plant identification and issue suggestions for you, and, depending on your settings and local laws, may also help improve our models over time.\n\nYou can adjust permissions in your device and app settings, and we do not sell personally identifying data.',
  },
  {
    question: 'How do I scan a plant?',
    keywords: ['scan', 'how scan', 'take photo', 'diagnose', 'identify'],
    answer:
      'Tap the camera icon on the Home screen to start a scan. You can either take a new photo or choose one from your gallery. Select "Diagnose Disease" to check for plant diseases, or "Identify Plant" to find out what plant it is.',
  },
  {
    question: 'How many free scans do I get?',
    keywords: ['free', 'limit', 'how many', 'scans left', 'quota'],
    answer:
      'Free plan users get 1 diagnosis scan per day. To unlock unlimited scans, upgrade to Jiva Plants Pro.',
  },
  {
    question: 'What is Jiva Plants Pro?',
    keywords: ['pro', 'premium', 'subscription', 'upgrade', 'plan'],
    answer:
      'Jiva Plants Pro gives you unlimited plant scans, advanced disease detection, detailed treatment plans, and priority support. You can upgrade from the Profile screen.',
  },
  {
    question: 'How do I upgrade to Pro?',
    keywords: ['upgrade', 'buy', 'purchase', 'subscribe', 'pay'],
    answer:
      'Go to Profile → Subscription and tap "Upgrade to Pro".',
  },
  {
    question: 'How do I cancel my subscription?',
    keywords: ['cancel', 'unsubscribe', 'stop subscription', 'refund'],
    answer:
      'Go to Profile → Subscription and tap "Cancel Subscription". Your access will be removed immediately. For refunds, please contact Apple/Google support depending on your platform.',
  },
  {
    question: 'How accurate is the diagnosis?',
    keywords: ['accurate', 'accuracy', 'correct', 'reliable', 'confidence'],
    answer:
      'Our AI model has been trained on thousands of plant disease images. The confidence percentage shown with each diagnosis indicates how certain the model is. For best results, take clear, well-lit photos of the affected area.',
  },
  {
    question: 'What diseases can Jiva detect?',
    keywords: ['disease', 'detect', 'what can', 'conditions', 'problems'],
    answer:
      'Jiva can detect a wide range of common plant diseases including fungal infections, bacterial blight, nutrient deficiencies, pest damage, and more across many crop and ornamental plant species.',
  },
  {
    question: 'How do I view my scan history?',
    keywords: ['history', 'past scans', 'previous', 'old scans', 'records'],
    answer:
      'Tap the "History" tab at the bottom of the screen to see all your past scans. You can tap any scan to view the full diagnosis details and add notes.',
  },
  {
    question: 'How do I reset my password?',
    keywords: ['reset', 'forgot password', 'change password', 'password'],
    answer:
      'On the Sign In screen, tap "Forgot Password". Enter your email address and follow the instructions sent to reset your password.',
  },
  {
    question: 'Is my data safe?',
    keywords: ['data', 'privacy', 'safe', 'secure', 'personal information'],
    answer:
      'Yes. Your data is encrypted and stored securely. We do not sell your personal information. You can read our full Privacy Policy from Profile → Data & Privacy → Privacy Policy.',
  },
  {
    question: 'How do I delete my account?',
    keywords: ['delete account', 'remove account', 'close account'],
    answer:
      'Go to Profile → Data & Privacy → Delete Account. This will permanently remove your profile, scan history, and subscription. This action cannot be undone.',
  },
  {
    question: 'How do I contact support?',
    keywords: ['contact', 'support', 'help', 'email', 'reach'],
    answer:
      'You can reach our support team at support@jivaplants.com. We typically respond within 24–48 hours.',
  },
];

const SUGGESTED_QUESTIONS = [
  'How do I use Jivaplants?',
  'What is Jivaplants?',
  'How does Jivaplants work?',
  'Can Jivaplants detect plant problems?',
  'How accurate are identifications and diagnoses?',
  'Does Jivaplants work offline?',
  'How is my data used?',
  'How do I scan a plant?',
  'How many free scans do I get?',
  'Is my data safe?',
  'How do I contact support?',
];

const GREETING: Message = {
  id: 'greeting',
  text: "Hi! I'm the Jiva Plants assistant. I can help you with common questions about the app. Tap a question below or type your own!",
  isBot: true,
};

function findAnswer(input: string): string {
  const lower = input.toLowerCase();
  for (const faq of FAQS) {
    if (faq.keywords.some((kw) => lower.includes(kw))) {
      return faq.answer;
    }
  }
  return "I'm not sure about that. You can email us at support@jivaplants.com for more help, or try rephrasing your question.";
}

interface ChatbotModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ChatbotModal({ visible, onClose }: ChatbotModalProps) {
  const [messages, setMessages] = React.useState<Message[]>([GREETING]);
  const [inputText, setInputText] = React.useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      setMessages([GREETING]);
      setInputText('');
    }
  }, [visible]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = { id: Date.now().toString(), text: trimmed, isBot: false };
    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: findAnswer(trimmed),
      isBot: true,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInputText('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end"
      >
        <TouchableOpacity className="absolute inset-0 bg-black/40" onPress={onClose} />

        <View
          className="bg-background rounded-t-3xl border-t border-border"
          style={{ maxHeight: '85%', minHeight: '60%' }}
        >
          {/* Header */}
          <View className="flex flex-row items-center justify-between px-5 py-4 border-b border-border">
            <View className="flex flex-row items-center gap-2">
              <MessageCircle size={20} color="#3F7C4C" />
              <Text className="text-base font-semibold">Help & FAQ</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 items-center justify-center rounded-full bg-muted"
            >
              <X size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            className="flex-1 px-4 py-3"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                className={`mb-3 max-w-[82%] ${msg.isBot ? 'self-start' : 'self-end'}`}
              >
                <View
                  className={`px-4 py-3 rounded-2xl ${
                    msg.isBot
                      ? 'bg-[#F2F6F5] rounded-tl-sm'
                      : 'bg-primary rounded-tr-sm'
                  }`}
                >
                  <Text
                    className={`text-sm leading-5 ${
                      msg.isBot ? 'text-foreground' : 'text-white'
                    }`}
                  >
                    {msg.text}
                  </Text>
                </View>
              </View>
            ))}

            {/* Suggested questions (shown only at start) */}
            {messages.length === 1 && (
              <View className="mt-2 mb-3" style={{ gap: 8 }}>
                {SUGGESTED_QUESTIONS.map((q) => (
                  <TouchableOpacity
                    key={q}
                    activeOpacity={0.7}
                    onPress={() => sendMessage(q)}
                    className="self-start bg-primary/10 border border-primary/20 px-4 py-2 rounded-full"
                  >
                    <Text className="text-sm text-primary">{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View className="flex flex-row items-center gap-2 px-4 py-3 border-t border-border">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask a question..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 bg-[#F2F6F5] rounded-full px-4 py-3 text-sm text-foreground"
              onSubmitEditing={() => sendMessage(inputText)}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => sendMessage(inputText)}
              className="w-10 h-10 bg-primary rounded-full items-center justify-center"
            >
              <Send size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
