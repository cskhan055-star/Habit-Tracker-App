export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
  tier: 1 | 2 | 3;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  // Primary
  { code: 'en', name: 'English', nativeName: 'English', isRTL: false, tier: 1, flag: '🇺🇸' },
  // Tier 1
  { code: 'es', name: 'Spanish', nativeName: 'Español', isRTL: false, tier: 1, flag: '🇪🇸' },
  { code: 'pt_BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', isRTL: false, tier: 1, flag: '🇧🇷' },
  { code: 'fr', name: 'French', nativeName: 'Français', isRTL: false, tier: 1, flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', isRTL: false, tier: 1, flag: '🇩🇪' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', isRTL: false, tier: 1, flag: '🇮🇳' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', isRTL: false, tier: 1, flag: '🇮🇩' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', isRTL: false, tier: 1, flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', isRTL: false, tier: 1, flag: '🇰🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', isRTL: false, tier: 1, flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRTL: true, tier: 1, flag: '🇸🇦' },
  // Tier 2
  { code: 'it', name: 'Italian', nativeName: 'Italiano', isRTL: false, tier: 2, flag: '🇮🇹' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', isRTL: false, tier: 2, flag: '🇹🇷' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', isRTL: false, tier: 2, flag: '🇵🇱' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', isRTL: false, tier: 2, flag: '🇳🇱' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', isRTL: false, tier: 2, flag: '🇻🇳' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', isRTL: false, tier: 2, flag: '🇹🇭' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', isRTL: false, tier: 2, flag: '🇺🇦' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', isRTL: true, tier: 2, flag: '🇵🇰' },
  { code: 'zh_CN', name: 'Chinese (Simplified)', nativeName: '简体中文', isRTL: false, tier: 2, flag: '🇨🇳' },
  { code: 'zh_TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', isRTL: false, tier: 2, flag: '🇹🇼' },
  // Tier 3
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', isRTL: false, tier: 3, flag: '🇧🇩' },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino', isRTL: false, tier: 3, flag: '🇵🇭' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', isRTL: false, tier: 3, flag: '🇲🇾' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', isRTL: false, tier: 3, flag: '🇸🇪' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', isRTL: false, tier: 3, flag: '🇬🇷' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', isRTL: false, tier: 3, flag: '🇨🇿' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', isRTL: false, tier: 3, flag: '🇷🇴' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', isRTL: false, tier: 3, flag: '🇭🇺' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', isRTL: true, tier: 3, flag: '🇮🇱' },
  { code: 'fa', name: 'Persian (Farsi)', nativeName: 'فارسی', isRTL: true, tier: 3, flag: '🇮🇷' },
];

export const RTL_LANGUAGES = ['ar', 'ur', 'he', 'fa'];

export function isLanguageRTL(code: string): boolean {
  return RTL_LANGUAGES.includes(code);
}
