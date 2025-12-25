import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Header } from '../components/ui/Header';
import { UserPlus } from 'lucide-react-native';

interface RegisterScreenProps {
  onRegister: (name: string, email: string, password: string, country: string) => void;
  onBack: () => void;
  onSignIn: () => void;
}

const COUNTRIES = [
  { value: '', label: 'Select your country' },
  { value: 'AF', label: 'Afghanistan' },
  { value: 'AX', label: 'Åland Islands' },
  { value: 'AL', label: 'Albania' },
  { value: 'DZ', label: 'Algeria' },
  { value: 'AS', label: 'American Samoa' },
  { value: 'AD', label: 'Andorra' },
  { value: 'AO', label: 'Angola' },
  { value: 'AI', label: 'Anguilla' },
  { value: 'AQ', label: 'Antarctica' },
  { value: 'AG', label: 'Antigua and Barbuda' },
  { value: 'AR', label: 'Argentina' },
  { value: 'AM', label: 'Armenia' },
  { value: 'AW', label: 'Aruba' },
  { value: 'AU', label: 'Australia' },
  { value: 'AT', label: 'Austria' },
  { value: 'AZ', label: 'Azerbaijan' },
  { value: 'BS', label: 'Bahamas (the)' },
  { value: 'BH', label: 'Bahrain' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'BB', label: 'Barbados' },
  { value: 'BY', label: 'Belarus' },
  { value: 'BE', label: 'Belgium' },
  { value: 'BZ', label: 'Belize' },
  { value: 'BJ', label: 'Benin' },
  { value: 'BM', label: 'Bermuda' },
  { value: 'BT', label: 'Bhutan' },
  { value: 'BO', label: 'Bolivia (Plurinational State of)' },
  { value: 'BQ', label: 'Bonaire, Sint Eustatius and Saba' },
  { value: 'BA', label: 'Bosnia and Herzegovina' },
  { value: 'BW', label: 'Botswana' },
  { value: 'BV', label: 'Bouvet Island' },
  { value: 'BR', label: 'Brazil' },
  { value: 'IO', label: 'British Indian Ocean Territory (the)' },
  { value: 'BN', label: 'Brunei Darussalam' },
  { value: 'BG', label: 'Bulgaria' },
  { value: 'BF', label: 'Burkina Faso' },
  { value: 'BI', label: 'Burundi' },
  { value: 'CV', label: 'Cabo Verde' },
  { value: 'KH', label: 'Cambodia' },
  { value: 'CM', label: 'Cameroon' },
  { value: 'CA', label: 'Canada' },
  { value: 'KY', label: 'Cayman Islands (the)' },
  { value: 'CF', label: 'Central African Republic (the)' },
  { value: 'TD', label: 'Chad' },
  { value: 'CL', label: 'Chile' },
  { value: 'CN', label: 'China' },
  { value: 'CX', label: 'Christmas Island' },
  { value: 'CC', label: 'Cocos (Keeling) Islands (the)' },
  { value: 'CO', label: 'Colombia' },
  { value: 'KM', label: 'Comoros (the)' },
  { value: 'CD', label: 'Congo (the Democratic Republic of the)' },
  { value: 'CG', label: 'Congo (the)' },
  { value: 'CK', label: 'Cook Islands (the)' },
  { value: 'CR', label: 'Costa Rica' },
  { value: 'CI', label: "Côte d'Ivoire" },
  { value: 'HR', label: 'Croatia' },
  { value: 'CU', label: 'Cuba' },
  { value: 'CW', label: 'Curaçao' },
  { value: 'CY', label: 'Cyprus' },
  { value: 'CZ', label: 'Czechia' },
  { value: 'DK', label: 'Denmark' },
  { value: 'DJ', label: 'Djibouti' },
  { value: 'DM', label: 'Dominica' },
  { value: 'DO', label: 'Dominican Republic (the)' },
  { value: 'EC', label: 'Ecuador' },
  { value: 'EG', label: 'Egypt' },
  { value: 'SV', label: 'El Salvador' },
  { value: 'GQ', label: 'Equatorial Guinea' },
  { value: 'ER', label: 'Eritrea' },
  { value: 'EE', label: 'Estonia' },
  { value: 'SZ', label: 'Eswatini' },
  { value: 'ET', label: 'Ethiopia' },
  { value: 'FK', label: 'Falkland Islands (the) [Malvinas]' },
  { value: 'FO', label: 'Faroe Islands (the)' },
  { value: 'FJ', label: 'Fiji' },
  { value: 'FI', label: 'Finland' },
  { value: 'FR', label: 'France' },
  { value: 'GF', label: 'French Guiana' },
  { value: 'PF', label: 'French Polynesia' },
  { value: 'TF', label: 'French Southern Territories (the)' },
  { value: 'GA', label: 'Gabon' },
  { value: 'GM', label: 'Gambia (the)' },
  { value: 'GE', label: 'Georgia' },
  { value: 'DE', label: 'Germany' },
  { value: 'GH', label: 'Ghana' },
  { value: 'GI', label: 'Gibraltar' },
  { value: 'GR', label: 'Greece' },
  { value: 'GL', label: 'Greenland' },
  { value: 'GD', label: 'Grenada' },
  { value: 'GP', label: 'Guadeloupe' },
  { value: 'GU', label: 'Guam' },
  { value: 'GT', label: 'Guatemala' },
  { value: 'GG', label: 'Guernsey' },
  { value: 'GN', label: 'Guinea' },
  { value: 'GW', label: 'Guinea-Bissau' },
  { value: 'GY', label: 'Guyana' },
  { value: 'HT', label: 'Haiti' },
  { value: 'HM', label: 'Heard Island and McDonald Islands' },
  { value: 'VA', label: 'Holy See (the)' },
  { value: 'HN', label: 'Honduras' },
  { value: 'HK', label: 'Hong Kong' },
  { value: 'HU', label: 'Hungary' },
  { value: 'IS', label: 'Iceland' },
  { value: 'IN', label: 'India' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'IR', label: 'Iran (Islamic Republic of)' },
  { value: 'IQ', label: 'Iraq' },
  { value: 'IE', label: 'Ireland' },
  { value: 'IM', label: 'Isle of Man' },
  { value: 'IL', label: 'Israel' },
  { value: 'IT', label: 'Italy' },
  { value: 'JM', label: 'Jamaica' },
  { value: 'JP', label: 'Japan' },
  { value: 'JE', label: 'Jersey' },
  { value: 'JO', label: 'Jordan' },
  { value: 'KZ', label: 'Kazakhstan' },
  { value: 'KE', label: 'Kenya' },
  { value: 'KI', label: 'Kiribati' },
  { value: 'KP', label: "Korea (the Democratic People's Republic of)" },
  { value: 'KR', label: 'Korea (the Republic of)' },
  { value: 'KW', label: 'Kuwait' },
  { value: 'KG', label: 'Kyrgyzstan' },
  { value: 'LA', label: "Lao People's Democratic Republic (the)" },
  { value: 'LV', label: 'Latvia' },
  { value: 'LB', label: 'Lebanon' },
  { value: 'LS', label: 'Lesotho' },
  { value: 'LR', label: 'Liberia' },
  { value: 'LY', label: 'Libya' },
  { value: 'LI', label: 'Liechtenstein' },
  { value: 'LT', label: 'Lithuania' },
  { value: 'LU', label: 'Luxembourg' },
  { value: 'MO', label: 'Macao' },
  { value: 'MK', label: 'Republic of North Macedonia' },
  { value: 'MG', label: 'Madagascar' },
  { value: 'MW', label: 'Malawi' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'MV', label: 'Maldives' },
  { value: 'ML', label: 'Mali' },
  { value: 'MT', label: 'Malta' },
  { value: 'MH', label: 'Marshall Islands (the)' },
  { value: 'MQ', label: 'Martinique' },
  { value: 'MR', label: 'Mauritania' },
  { value: 'MU', label: 'Mauritius' },
  { value: 'YT', label: 'Mayotte' },
  { value: 'MX', label: 'Mexico' },
  { value: 'FM', label: 'Micronesia (Federated States of)' },
  { value: 'MD', label: 'Moldova (the Republic of)' },
  { value: 'MC', label: 'Monaco' },
  { value: 'MN', label: 'Mongolia' },
  { value: 'ME', label: 'Montenegro' },
  { value: 'MS', label: 'Montserrat' },
  { value: 'MA', label: 'Morocco' },
  { value: 'MZ', label: 'Mozambique' },
  { value: 'MM', label: 'Myanmar' },
  { value: 'NA', label: 'Namibia' },
  { value: 'NR', label: 'Nauru' },
  { value: 'NP', label: 'Nepal' },
  { value: 'NL', label: 'Netherlands (the)' },
  { value: 'NC', label: 'New Caledonia' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'NI', label: 'Nicaragua' },
  { value: 'NE', label: 'Niger (the)' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'NU', label: 'Niue' },
  { value: 'NF', label: 'Norfolk Island' },
  { value: 'MP', label: 'Northern Mariana Islands (the)' },
  { value: 'NO', label: 'Norway' },
  { value: 'OM', label: 'Oman' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'PW', label: 'Palau' },
  { value: 'PS', label: 'Palestine, State of' },
  { value: 'PA', label: 'Panama' },
  { value: 'PG', label: 'Papua New Guinea' },
  { value: 'PY', label: 'Paraguay' },
  { value: 'PE', label: 'Peru' },
  { value: 'PH', label: 'Philippines (the)' },
  { value: 'PN', label: 'Pitcairn' },
  { value: 'PL', label: 'Poland' },
  { value: 'PT', label: 'Portugal' },
  { value: 'PR', label: 'Puerto Rico' },
  { value: 'QA', label: 'Qatar' },
  { value: 'RE', label: 'Réunion' },
  { value: 'RO', label: 'Romania' },
  { value: 'RU', label: 'Russian Federation (the)' },
  { value: 'RW', label: 'Rwanda' },
  { value: 'BL', label: 'Saint Barthélemy' },
  { value: 'SH', label: 'Saint Helena, Ascension and Tristan da Cunha' },
  { value: 'KN', label: 'Saint Kitts and Nevis' },
  { value: 'LC', label: 'Saint Lucia' },
  { value: 'MF', label: 'Saint Martin (French part)' },
  { value: 'PM', label: 'Saint Pierre and Miquelon' },
  { value: 'VC', label: 'Saint Vincent and the Grenadines' },
  { value: 'WS', label: 'Samoa' },
  { value: 'SM', label: 'San Marino' },
  { value: 'ST', label: 'Sao Tome and Principe' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'SN', label: 'Senegal' },
  { value: 'RS', label: 'Serbia' },
  { value: 'SC', label: 'Seychelles' },
  { value: 'SL', label: 'Sierra Leone' },
  { value: 'SG', label: 'Singapore' },
  { value: 'SX', label: 'Sint Maarten (Dutch part)' },
  { value: 'SK', label: 'Slovakia' },
  { value: 'SI', label: 'Slovenia' },
  { value: 'SB', label: 'Solomon Islands' },
  { value: 'SO', label: 'Somalia' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'GS', label: 'South Georgia and the South Sandwich Islands' },
  { value: 'SS', label: 'South Sudan' },
  { value: 'ES', label: 'Spain' },
  { value: 'LK', label: 'Sri Lanka' },
  { value: 'SD', label: 'Sudan (the)' },
  { value: 'SR', label: 'Suriname' },
  { value: 'SJ', label: 'Svalbard and Jan Mayen' },
  { value: 'SE', label: 'Sweden' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'SY', label: 'Syrian Arab Republic' },
  { value: 'TW', label: 'Taiwan (Province of China)' },
  { value: 'TJ', label: 'Tajikistan' },
  { value: 'TZ', label: 'Tanzania, United Republic of' },
  { value: 'TH', label: 'Thailand' },
  { value: 'TL', label: 'Timor-Leste' },
  { value: 'TG', label: 'Togo' },
  { value: 'TK', label: 'Tokelau' },
  { value: 'TO', label: 'Tonga' },
  { value: 'TT', label: 'Trinidad and Tobago' },
  { value: 'TN', label: 'Tunisia' },
  { value: 'TR', label: 'Turkey' },
  { value: 'TM', label: 'Turkmenistan' },
  { value: 'TC', label: 'Turks and Caicos Islands (the)' },
  { value: 'TV', label: 'Tuvalu' },
  { value: 'UG', label: 'Uganda' },
  { value: 'UA', label: 'Ukraine' },
  { value: 'AE', label: 'United Arab Emirates (the)' },
  { value: 'GB', label: 'United Kingdom of Great Britain and Northern Ireland (the)' },
  { value: 'UM', label: 'United States Minor Outlying Islands (the)' },
  { value: 'US', label: 'United States of America (the)' },
  { value: 'UY', label: 'Uruguay' },
  { value: 'UZ', label: 'Uzbekistan' },
  { value: 'VU', label: 'Vanuatu' },
  { value: 'VE', label: 'Venezuela (Bolivarian Republic of)' },
  { value: 'VN', label: 'Viet Nam' },
  { value: 'VG', label: 'Virgin Islands (British)' },
  { value: 'VI', label: 'Virgin Islands (U.S.)' },
  { value: 'WF', label: 'Wallis and Futuna' },
  { value: 'EH', label: 'Western Sahara' },
  { value: 'YE', label: 'Yemen' },
  { value: 'ZM', label: 'Zambia' },
  { value: 'ZW', label: 'Zimbabwe' },
  { value: 'OTHER', label: 'Other' },
];

export function RegisterScreen({
  onRegister,
  onBack,
  onSignIn,
}: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
  });

  const handleSubmit = () => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      country: '',
    };

    if (!name) newErrors.name = 'Name is required';
    else if (name.length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6)
      newErrors.password = 'Must be at least 6 characters';

    if (!confirmPassword)
      newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    if (!country) newErrors.country = 'Select your country';

    setErrors(newErrors);

    if (
      !newErrors.name &&
      !newErrors.email &&
      !newErrors.password &&
      !newErrors.confirmPassword &&
      !newErrors.country
    ) {
      onRegister(name, email, password, country);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <Header title="
      " showBack onBack={onBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
  contentContainerStyle={{
    paddingBottom: 80,
    flexGrow: 1,
  }}
  showsVerticalScrollIndicator={false}
>
          <View className="px-6 pt-8 w-full">
            {/* Intro */}
            <View className="mb-10">
              <Text className="text-2xl font-bold mb-2">
                Join Jiva Plants
              </Text>
              <Text className="text-sm text-muted-foreground leading-relaxed">
                Create your account to start diagnosing plant health with AI-powered insights.
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-5">
              <Input
                label="Name"
                placeholder="Your name"
                value={name}
                onChangeText={setName}
                error={errors.name}
              />

              <Input
                type="email"
                label="Email"
                placeholder="your@email.com"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
              />

              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                error={errors.password}
                helperText="At least 6 characters"
              />

              <Input
                type="password"
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={errors.confirmPassword}
              />

              <View className="pb-4">
                <Select
                  label="Country"
                  options={COUNTRIES}
                  value={country}
                  onValueChange={setCountry}
                  error={errors.country}
                />
              </View>
            </View>

            {/* CTA */}
            <Button
              size="lg"
              fullWidth
              onPress={handleSubmit}
              className="mb-5 mt-8"
            >
                  Create account
            </Button>

            {/* Sign in */}
            <View className="flex-row justify-center mb-8">
              <Text className="text-sm text-muted-foreground">
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={onSignIn}>
                <Text className="text-sm text-primary font-medium">
                  Sign in
                </Text>
              </TouchableOpacity>
            </View>

            {/* Terms */}
            <View className="px-4 py-4 rounded-xl bg-muted/40">
              <Text className="text-xs text-muted-foreground text-center leading-relaxed">
                By creating an account, you agree to our Terms of Service and
                Privacy Policy. Your data is protected and never shared without
                permission.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}