-- ============================================================
-- MAGSTER DATA SEED - Essential reference & configuration data
-- Run this AFTER 01_schema.sql
-- Generated: 2026-04-14
-- ============================================================

-- ADMINS
INSERT INTO public.admins (id, full_name, phone_number, pin_hash, role, is_active, created_at, updated_at) VALUES
('dbece8c0-f934-4d74-907d-afca1a474e8d', 'System Administrator', '111111111', '$2a$06$.NiuJ/NsCaNPMqiQduYMJuouv6Z/g/5jIkb2/FMSExXqI0gZ3xama', 'admin', true, '2025-12-30 06:12:35.368823+00', '2025-12-30 06:12:35.368823+00');

-- HOME CATEGORIES
INSERT INTO public.home_categories (id, name, display_order, is_active, is_system, created_at, updated_at) VALUES
('5a4888f8-8b22-4683-9666-ba5179592667', 'Freshman', 0, true, true, '2026-04-01 03:21:50.092526+00', '2026-04-01 03:21:50.092526+00'),
('00be0d8f-369b-4a8a-b803-ed1bdbdfcdc3', 'Year 2', 1, true, true, '2026-04-01 03:21:50.092526+00', '2026-04-01 03:21:50.092526+00'),
('fdc90657-f0f0-4b45-82ec-b3c64027d0ab', 'Year 3', 2, true, true, '2026-04-01 03:21:50.092526+00', '2026-04-01 03:21:50.092526+00'),
('2f48387b-fb88-478f-ac0f-12e722aa0da3', 'Year 4', 3, true, true, '2026-04-01 03:21:50.092526+00', '2026-04-01 03:21:50.092526+00'),
('77b3073d-ba83-4ded-ab1f-2614b8857a48', 'Year 5', 4, true, true, '2026-04-01 03:21:50.092526+00', '2026-04-01 03:21:50.092526+00');

-- APP SETTINGS (all current settings)
INSERT INTO public.app_settings (id, setting_key, setting_value, description, updated_at) VALUES
('b8dfaa2b-4488-4c60-ab05-05d9421ace0c', 'admin_access_code', '28945469332894546932', 'Access code required to reach admin login from browser', '2026-02-21 07:39:11.659407+00'),
('bd3afd86-6fea-4afb-a7c6-17e0528320de', 'allow_student_edit_profile', 'true', NULL, '2026-04-12 19:13:20.931868+00'),
('2d3733df-8dc0-43c9-83fd-a789194597a5', 'allow_teacher_edit_profile', 'false', NULL, '2026-04-12 19:13:21.75873+00'),
('1dfdac92-14f8-46bc-b9ed-1f35b3590069', 'apk_download_url', 'https://cdn-icons-png.flaticon.com/512/7878/7878341.png', NULL, '2026-04-12 19:15:15.850557+00'),
('8c9ee8f2-9a6d-40f0-af80-fa7bdd347b1a', 'app_name', 'Magster', 'The name displayed throughout the app', '2026-02-06 17:49:47.808539+00'),
('e7537416-a05e-4894-8327-70db4278db4e', 'competitions_enabled', 'true', 'Enable competitions feature', '2026-02-12 18:14:47.450216+00'),
('e185bce3-8a20-4227-8aa5-770cbd48a5ce', 'current_app_version', '1.0.0', NULL, '2026-04-12 19:15:15.38678+00'),
('93664fc0-2d5a-4871-97b9-571cca8b4f9a', 'enable_access_gate', 'false', NULL, '2026-04-12 00:28:25.536479+00'),
('4ea80209-f9e8-408a-b3d7-7cde233247ae', 'enable_competitions', 'true', NULL, '2026-04-12 19:13:20.687683+00'),
('d84235ea-50c2-4602-b8dd-3ae70d548b8b', 'enable_library', 'true', NULL, '2026-04-12 19:13:20.420035+00'),
('5bc7e6f1-b1a3-4c1b-8de1-7a9595213cbf', 'home_ui_type', 'type2', NULL, '2026-04-12 19:15:16.381985+00'),
('7734e19f-9c24-4f68-b6d7-6c81fdac4653', 'library_enabled', 'false', 'Enable library access', '2026-02-22 18:30:16.586106+00'),
('62c26d56-f6f7-49b0-ae5d-6fba2be56058', 'min_app_version', '1.0.0', NULL, '2026-04-12 19:15:15.56235+00'),
('b87731b2-92e4-453a-b695-a8a66ec563d0', 'show_featured_paths', 'true', 'Toggle visibility of the Featured Paths section on the home screen', '2026-04-12 19:15:15.212502+00'),
('d41f2427-43a4-41a8-890f-620e7ae2beaa', 'support_email', 'support@magster.com', 'Email for user support inquiries', '2026-02-06 17:49:47.966438+00'),
('9856719a-e8da-4c2e-9833-479700de62ee', 'telegram_support', '@magster_support', 'Telegram handle for support', '2026-02-06 17:49:48.090725+00')
ON CONFLICT (setting_key) DO NOTHING;

-- Terms of Service
INSERT INTO public.app_settings (id, setting_key, setting_value, description, updated_at) VALUES
('2c64fb67-f611-40cb-89d5-264049b6ecf9', 'terms_of_service', '1. Acceptance of Terms
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
Your use of Magster is also governed by our Privacy Policy.', 'Terms of Service displayed to students during signup', '2026-02-13 03:15:41.513523+00')
ON CONFLICT (setting_key) DO NOTHING;

-- Privacy Policy
INSERT INTO public.app_settings (id, setting_key, setting_value, description, updated_at) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'privacy_policy', '1. Information We Collect
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
If you have any questions about this Privacy Policy, please contact us through our support channels.', 'Privacy Policy displayed to students during signup', '2026-02-13 03:15:41.513523+00')
ON CONFLICT (setting_key) DO NOTHING;

-- Teacher Withdrawal Terms
INSERT INTO public.app_settings (id, setting_key, setting_value, description, updated_at) VALUES
('ce8aff6b-ae1f-49d9-b905-0e1b9152ad01', 'teacher_withdrawal_terms', E'General Terms for Withdrawals\n\nThese terms govern the withdrawal of earnings from the Magster platform:\n\n1. Eligibility for Withdrawals\n- Instructors must have a verified account to request withdrawals\n- Minimum withdrawal amount is ETB 500\n- Only earnings from completed course sales are eligible for withdrawal\n- Funds from refunded courses cannot be withdrawn\n\n2. Processing Time\n- Withdrawal requests are processed within 5-7 business days\n- Requests made on weekends or holidays will be processed on the next business day\n- Bank transfers may take an additional 2-3 business days\n- You will receive an email confirmation when your withdrawal is processed\n\n3. Withdrawal Methods\n- Bank transfer to your registered Ethiopian bank account\n- Mobile money transfer (M-Pesa, Telebirr, CBE Birr)\n- Account details must be verified before first withdrawal\n\n4. Fees and Charges\n- Platform commission: 20% of gross earnings\n- Transaction fees may apply depending on withdrawal method\n- All fees will be clearly displayed before confirming withdrawal\n\n5. Tax Obligations\n- Instructors are responsible for their own tax obligations\n- Magster will provide earning statements for tax purposes\n- Please consult with a tax professional for guidance', 'Teacher withdrawal terms and conditions displayed to teachers', '2026-02-13 02:47:01.793362+00')
ON CONFLICT (setting_key) DO NOTHING;

-- PAYMENT METHODS (updated)
INSERT INTO public.payment_methods (id, method_name, account_name, account_number, bank_name, is_active, created_at, updated_at) VALUES
('ab1f4290-dabb-45aa-833f-718a6f9e87c3', 'Commercial Bank of Ethiopia', 'Asmamaw Abebaw', '1000610828276', 'Commercial Bank of Ethiopia', true, '2025-12-30 12:30:03.684154+00', '2026-04-13 22:02:53.579701+00'),
('f458449b-eb24-4234-a42b-75de6b908b08', 'Telebirr', 'Wubamlak', '0918472699', NULL, true, '2025-12-30 12:30:03.684154+00', '2026-04-13 22:02:53.579701+00'),
('40cdc9a9-1575-4f87-ac51-51f4b72cf6da', 'Bank of Abyssinia', 'Asmamaw Abebaw', '163240955', 'Bank of Abyssinia', true, '2026-04-13 22:02:53.579701+00', '2026-04-13 22:02:53.579701+00');

-- TEACHERS
INSERT INTO public.teachers (id, full_name, phone_number, email, pin_hash, specialization, experience, bio, credentials_url, intro_video_url, is_approved, is_active, created_at, updated_at) VALUES
('bcb6a489-08d2-4da7-9211-8ca37b2536c6', 'Test Teacher', '987654321', 'teacher@test.com', '$2a$06$5/UfiH0KpaKtEWK2x09UGOjAzbh.XeRxeSBUwaTTSwOCdwA0n/wGe', 'Mathematics & Engineering', NULL, NULL, NULL, NULL, true, true, '2026-01-08 09:47:36.64574+00', '2026-04-11 05:06:13.312383+00'),
('2ff97382-7e8f-41a7-929f-87b3796e74c9', 'Magster', '918472698', '918472698@noemail.placeholder', '$2a$06$X./btoBAs8IRI3O78d1TsuGnPIXOdQycDSdRB2jL.VJ9oQ3o2Bh.e', 'Engineering', '1-3', 'I am...', NULL, 'https://youtu.be/vuLIUs2qLuE?si=ycV1LX1iGCoI5TTt', true, true, '2026-02-21 05:44:07.6141+00', '2026-02-21 05:44:53.600895+00'),
('cbb5c534-0535-429d-82ef-ae37dd145ea3', 'Asmamaw Abebaw', '986885300', '986885300@noemail.placeholder', '$2a$06$S8LCwFuolbXV3c2kg.dsDumxfctB60.xFIPdxllAUPS/HlzJr9Isq', 'Mathematics', '3-5', NULL, NULL, NULL, true, true, '2026-02-21 07:31:24.143805+00', '2026-02-22 18:33:25.171183+00'),
('253544df-173f-47e3-84f2-172feb2d779c', 'Magster', '963852741', '963852741@noemail.placeholder', '$2a$06$Df66qoRon5HtdR6RoETZBeYmn1VSsGEDSkBuwKCpXJaOmh5dLiNf.', 'Mathematics', '1-3', NULL, NULL, 'https://youtu.be/LS6tQDzBV_8?si=fT9FnTb0P89AWpH_', true, true, '2026-02-22 18:31:50.12706+00', '2026-02-22 18:44:01.552685+00'),
('232a4a00-41c9-4ba1-bd38-91db47ad1c1a', 'Magster Sample', '986885309', '986885309@noemail.placeholder', '$2a$06$n4Y5mDoCKXhAAlRltEGGsOc4sv4DEoR5y8ysgZYBOUNceTpkq2naK', 'Mathematics', '1-3', 'A dedicated and enthusiastic mathematics teacher...', NULL, 'https://youtu.be/VbSWEiqaB9E?si=nERHIu19J_1ueFWp', true, true, '2026-03-24 06:48:42.690923+00', '2026-03-29 14:53:17.494631+00'),
('6cfe29a0-a40f-4a6b-84de-aef2e9a834ab', 'Asm i', '986868686', '986868686@noemail.placeholder', '$2a$06$KrrcF0IHzJRgdz6yH.RJRuG/wPA8/V28Y11RwULnM4dzJZEUBO6Eu', 'Computer Science', '1-3', 'I am nnnn...', NULL, 'https://youtu.be/PLo6-rgCZJA?si=fsEXfrXC_8iOuDYX', true, true, '2026-03-28 08:29:59.143041+00', '2026-03-28 17:13:03.969922+00');

-- TUTORIAL VIDEOS
INSERT INTO public.tutorial_videos (id, title, description, video_url, thumbnail_url, duration, target_audience, display_order, is_active) VALUES
('93ee2e5a-c395-487b-b221-71c0b0472756', 'How to Signup to Magster Academy', 'Complete guide to navigating and using the Magster Academy platform', 'https://www.youtube.com/embed/cNGjD0VG4R8', 'https://img.youtube.com/vi/NHd71FVYw2Y/maxresdefault.jpg', 440, 'student', 1, true),
('6ee4bdb2-06bb-4cde-896e-ff05ef6ac261', 'Getting Started with Courses', 'Learn how to browse, enroll, and access your courses', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 240, 'student', 2, true);

-- ============================================================
-- IMPORTANT: For COMPLETE data migration including all rows from
-- courses, chapters, lessons, students, enrollments, bundles,
-- bundle_courses, quizzes, quiz_questions, quiz_attempts, 
-- competitions, competition_questions, competition_participants,
-- student_competitions, library_items, library_content,
-- payment_submissions, lesson_progress, notifications,
-- testimonials, device_bindings, trusted_devices, 
-- pinned_items, popup_notices, and popup_notice_dismissals:
--
-- Use pg_dump for a complete and accurate data migration:
--
--   pg_dump --data-only --no-owner --no-privileges \
--     -h db.rpfhatpademhbcbrqtch.supabase.co -U postgres -d postgres \
--     --schema=public > full_data_dump.sql
--
-- Then restore on the new database:
--   psql -h <new-host> -U postgres -d postgres < full_data_dump.sql
--
-- Current row counts (as of 2026-04-14):
--   courses: 12, students: 36, chapters: 17, lessons: 18
--   bundles: 17, bundle_courses: 18, enrollments: 19
--   payment_submissions: 6, lesson_progress: 15
--   competitions: 4, competition_questions: 50
--   competition_participants: 2, student_competitions: 1
--   quizzes: 11, quiz_questions: 33, quiz_attempts: 4
--   library_items: 26, library_content: 12
--   notifications: 5, testimonials: 3
--   device_bindings: 4, trusted_devices: 144
--   pinned_items: 3, popup_notices: 1
--   teacher_earnings: 0, popup_notice_dismissals: 0
--   user_downloads: 0
-- ============================================================
