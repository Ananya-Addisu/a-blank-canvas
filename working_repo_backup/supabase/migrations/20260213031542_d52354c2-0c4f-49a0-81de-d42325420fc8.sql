
-- Seed Terms of Service
INSERT INTO public.app_settings (setting_key, setting_value, description)
VALUES (
  'terms_of_service',
  '1. Acceptance of Terms
By accessing and using Magster, you accept and agree to be bound by the terms and provision of this agreement.

2. Use License
Permission is granted to temporarily access the materials on Magster for personal, non-commercial educational use only.

3. User Account
You are responsible for maintaining the confidentiality of your account and PIN. You agree to accept responsibility for all activities that occur under your account.

4. Content Guidelines
Users must not upload, post, or transmit any content that is illegal, harmful, threatening, abusive, harassing, or otherwise objectionable.

5. Modifications
Magster may revise these terms of service at any time without notice. By using this platform, you agree to be bound by the current version of these terms.

6. Privacy
Your use of Magster is also governed by our Privacy Policy.',
  'Terms of Service displayed to students during signup'
)
ON CONFLICT (setting_key) DO NOTHING;

-- Seed Privacy Policy
INSERT INTO public.app_settings (setting_key, setting_value, description)
VALUES (
  'privacy_policy',
  '1. Information We Collect
We collect information you provide directly to us, including your name, phone number, academic information, and institution details.

2. How We Use Your Information
We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to personalize your learning experience.

3. Information Sharing
We do not share your personal information with third parties except as described in this privacy policy or with your consent.

4. Data Security
We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

5. Your Rights
You have the right to access, update, or delete your personal information at any time through your account settings.

6. Contact Us
If you have any questions about this Privacy Policy, please contact us through our support channels.',
  'Privacy Policy displayed to students during signup'
)
ON CONFLICT (setting_key) DO NOTHING;
