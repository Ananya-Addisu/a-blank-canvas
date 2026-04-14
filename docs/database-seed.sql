-- =============================================
-- Magster Platform - Database Seed Data
-- Generated: 2026-02-23
-- Run AFTER database-schema.sql
-- =============================================

-- =============================================
-- ADMINS
-- =============================================
INSERT INTO public.admins (id, full_name, phone_number, pin_hash, role, is_active, created_at, updated_at) VALUES
('dbece8c0-f934-4d74-907d-afca1a474e8d', 'System Administrator', '111111111', '$2a$06$.NiuJ/NsCaNPMqiQduYMJuouv6Z/g/5jIkb2/FMSExXqI0gZ3xama', 'admin', true, '2025-12-30 06:12:35.368823+00', '2025-12-30 06:12:35.368823+00');

-- =============================================
-- APP SETTINGS
-- =============================================
INSERT INTO public.app_settings (id, setting_key, setting_value, description, updated_at) VALUES
('b8dfaa2b-4488-4c60-ab05-05d9421ace0c', 'admin_access_code', '28945469332894546932', 'Access code required to reach admin login from browser', '2026-02-21 07:39:11.659407+00'),
('bd3afd86-6fea-4afb-a7c6-17e0528320de', 'allow_student_edit_profile', 'true', NULL, '2026-02-21 16:34:48.589985+00'),
('2d3733df-8dc0-43c9-83fd-a789194597a5', 'allow_teacher_edit_profile', 'false', NULL, '2026-02-21 16:34:48.696186+00'),
('1dfdac92-14f8-46bc-b9ed-1f35b3590069', 'apk_download_url', '', NULL, '2026-02-15 06:33:03.796+00'),
('8c9ee8f2-9a6d-40f0-af80-fa7bdd347b1a', 'app_name', 'Magster', 'The name displayed throughout the app', '2026-02-06 17:49:47.808539+00'),
('e7537416-a05e-4894-8327-70db4278db4e', 'competitions_enabled', 'true', 'Enable competitions feature', '2026-02-12 18:14:47.450216+00'),
('e185bce3-8a20-4227-8aa5-770cbd48a5ce', 'current_app_version', '1.0.0', NULL, '2026-02-15 06:33:03.957+00'),
('4ea80209-f9e8-408a-b3d7-7cde233247ae', 'enable_competitions', 'false', NULL, '2026-02-21 16:34:48.484263+00'),
('d84235ea-50c2-4602-b8dd-3ae70d548b8b', 'enable_library', 'false', NULL, '2026-02-21 16:34:48.345734+00'),
('7734e19f-9c24-4f68-b6d7-6c81fdac4653', 'library_enabled', 'true', 'Enable library access', '2026-02-14 18:11:20.834913+00'),
('62c26d56-f6f7-49b0-ae5d-6fba2be56058', 'min_app_version', '1.0.0', NULL, '2026-02-15 06:33:03.36+00'),
('d41f2427-43a4-41a8-890f-620e7ae2beaa', 'support_email', 'support@magster.com', 'Email for user support inquiries', '2026-02-06 17:49:47.966438+00'),
('9856719a-e8da-4c2e-9833-479700de62ee', 'telegram_support', '@magster_support', 'Telegram handle for support', '2026-02-06 17:49:48.090725+00'),
('ce8aff6b-ae1f-49d9-b905-0e1b9152ad01', 'teacher_withdrawal_terms', 'General Terms for Withdrawals

These terms govern the withdrawal of earnings from the Magster platform:

1. Eligibility for Withdrawals
- Instructors must have a verified account to request withdrawals
- Minimum withdrawal amount is ETB 500
- Only earnings from completed course sales are eligible for withdrawal
- Funds from refunded courses cannot be withdrawn

2. Processing Time
- Withdrawal requests are processed within 5-7 business days
- Requests made on weekends or holidays will be processed on the next business day
- Bank transfers may take an additional 2-3 business days
- You will receive an email confirmation when your withdrawal is processed

3. Withdrawal Methods
- Bank transfer to your registered Ethiopian bank account
- Mobile money transfer (M-Pesa, Telebirr, CBE Birr)
- Account details must be verified before first withdrawal

4. Fees and Charges
- Platform commission: 20% of gross earnings
- Transaction fees may apply depending on withdrawal method
- All fees will be clearly displayed before confirming withdrawal

5. Tax Obligations
- Instructors are responsible for their own tax obligations
- Magster will provide earning statements for tax purposes
- Please consult with a tax professional for guidance', 'Teacher withdrawal terms and conditions displayed to teachers', '2026-02-13 02:47:01.864276+00'),
('b41f8769-81b3-4c5e-998d-bd2a3b86867d', 'terms_of_service', '1. Acceptance of Terms
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
Your use of Magster is also governed by our Privacy Policy.', 'Terms of Service displayed to students during signup', '2026-02-13 03:15:41.513523+00'),
('2c64fb67-f611-40cb-89d5-264049b6ecf9', 'privacy_policy', '1. Information We Collect
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
If you have any questions about this Privacy Policy, please contact us through our support channels.', 'Privacy Policy displayed to students during signup', '2026-02-13 03:15:41.513523+00');

-- =============================================
-- STUDENTS
-- =============================================
INSERT INTO public.students (id, full_name, phone_number, pin_hash, email, academic_year, gender, stream, institution, is_active, is_approved, last_logout_at, created_at, updated_at) VALUES
('385ae7da-380f-4d2a-9383-d69f226b8c80', 'Ananya', '912345678', '$2a$06$DfG4LL7Dt2RQtGQzN4Gnte/QF8r9iHykDtictTy3Se6EVQtRjbo0a', 'test@example.com', '2', 'Male', '', 'Arba Minch University', true, true, '2026-02-21 18:40:43.915+00', '2025-12-30 06:13:27.891566+00', '2026-02-22 14:38:07.632181+00'),
('67ea82d2-5e5f-420c-b938-182581bed113', 'Ananya Addisu', '911111111', '$2a$06$tUyx/M9aV6FLA4ppuUNkOOO6dOb2kF22gsrahef2JMIJw91fKZ.Ii', NULL, 'freshman', 'male', 'natural', 'Bahir Dar University', true, true, NULL, '2026-01-09 10:44:24.592221+00', '2026-02-21 02:00:23.07877+00'),
('73b1dbf3-d176-44a9-a1a2-633ead0208b9', 'Alore Dan Dan', '111111112', '$2a$06$MkNqAFE4mkEN.jWtPuH9SeseeUbxHiFLEpEftJgRuxILibcHbUGDe', NULL, 'sophomore', 'male', 'engineering', 'Adama Science & Technology', true, true, NULL, '2026-01-09 10:57:09.024678+00', '2026-02-12 18:20:04.829826+00'),
('ee220af2-7a88-42ec-8065-1991dc7ba7aa', 'Qwer Tyui', '918472699', '$2a$06$nvb75E4X5/lWbOt0dOUk9.fV3foEBWZ6fEhSc75r0LbthdxABid/q', NULL, '1st year', 'male', 'natural', 'AA SCI. & TECH UNIVERSITY', true, true, '2026-02-22 12:07:50.132+00', '2026-02-12 06:49:42.142469+00', '2026-02-22 12:07:50.208877+00'),
('c1e814d4-1a83-45e8-ae13-a86709600b83', 'aa', '999999999', '$2a$06$MHJAIYinEwlCHMpjphzjwuJauJiIIHirux4WmV49QRl10B4I0szEK', NULL, '3rd year', 'male', 'natural', 'AA SCI. & TECH UNIVERSITY', true, true, NULL, '2026-02-14 19:42:14.633397+00', '2026-02-14 19:42:14.633397+00'),
('ca4a8119-8bff-42af-85ca-2d26d959f1a8', 'Ggh', '912121212', '$2a$06$b2kMDUbjd74hNxMoow3Fpu/Uq6vM0nvoeKYNHfJgCYH4f0pv27Kk6', NULL, '2nd year', 'male', 'not_assigned', 'Bahir Dar University', true, true, NULL, '2026-02-16 03:05:15.664516+00', '2026-02-16 03:05:15.664516+00'),
('83fa323e-f142-4497-a5ad-82a8ef94d46a', 'Abcd Efgh', '986885300', '$2a$06$CKOu03KpQKC1O.9FPUkpAO1iiDBgT3TZelLQJlGa4DAQNe4.1YL5.', NULL, '2nd year', 'male', 'natural', 'Bahir Dar University', true, true, NULL, '2026-02-16 04:46:19.557245+00', '2026-02-16 04:46:19.557245+00'),
('5ded669e-bd19-4e69-82d1-932a7dcb7fbb', 'Aha', '933333333', '$2a$06$rWRVtHbcnebd1G4..qtPieWWLTaKMEfzEpCsKXkKGtYvANaxmKWZa', NULL, '3rd year', 'male', 'natural', 'AA SCI. & TECH UNIVERSITY', true, true, NULL, '2026-02-16 04:52:17.74714+00', '2026-02-16 04:52:17.74714+00'),
('9339086e-0a18-4e1a-bf79-b5455307d0ff', 'Abc', '933781075', '$2a$06$rtMYe.oNn3mrUzIzKb2RAO4gQ.GysTwAxunYu7Ur/FOW70Itvd.2C', NULL, '1st year', 'male', 'natural', 'Bahir Dar University', true, true, '2026-02-22 12:01:51.73+00', '2026-02-16 05:00:14.371234+00', '2026-02-22 12:01:51.788823+00'),
('a851ad4a-e2aa-42d2-8345-fd2db89f0643', 'Anan', '922222222', '$2a$06$tVS49uwtC4xFDRhL6zASGuna9iaXMvcE6iQw8bWftRiPHEO7V8yKC', NULL, '3rd year', 'male', 'not_assigned', 'Adigrat University', true, true, NULL, '2026-02-16 05:37:03.994357+00', '2026-02-16 05:37:03.994357+00'),
('7fae2b89-0e5e-432b-a7d2-3231d12b8e2e', 'Hh', '939393939', '$2a$06$7q/knLoTSuIbm5UTNcwnlOdxAyJmHAndRbdLUdlkGvagXVzjyq9sK', NULL, '3rd year', 'male', 'social', 'Adigrat University', true, true, NULL, '2026-02-16 08:09:17.607155+00', '2026-02-16 08:09:17.607155+00');

-- =============================================
-- TEACHERS
-- =============================================
INSERT INTO public.teachers (id, full_name, phone_number, pin_hash, email, specialization, bio, experience, intro_video_url, is_active, is_approved, last_logout_at, created_at, updated_at) VALUES
('bcb6a489-08d2-4da7-9211-8ca37b2536c6', 'Test Teacher', '987654321', '$2a$06$vcl0BTwZQNoiFpz7ellg8OzGo31exiqZA303zDNQhEfIxVnxcH9sm', 'teacher@test.com', 'Mathematics & Engineering', NULL, NULL, NULL, true, true, '2026-02-21 18:44:06.842+00', '2026-01-08 09:47:36.64574+00', '2026-02-21 18:44:06.933789+00'),
('2ff97382-7e8f-41a7-929f-87b3796e74c9', 'Magster', '918472698', '$2a$06$X./btoBAs8IRI3O78d1TsuGnPIXOdQycDSdRB2jL.VJ9oQ3o2Bh.e', '918472698@noemail.placeholder', 'Engineering', 'I am...', '1-3', 'https://youtu.be/vuLIUs2qLuE?si=ycV1LX1iGCoI5TTt', true, true, NULL, '2026-02-21 05:44:07.6141+00', '2026-02-21 05:44:53.600895+00'),
('cbb5c534-0535-429d-82ef-ae37dd145ea3', 'Asmamaw Abebaw', '986885300', '$2a$06$hGOwKH5y.H7O4.8hlvqKzevjOoPANzWKmfJNpueHbINLfxXXCAkbu', '986885300@noemail.placeholder', 'Mathematics', NULL, '3-5', NULL, true, true, '2026-02-21 18:35:47.078+00', '2026-02-21 07:31:24.143805+00', '2026-02-21 18:35:47.170082+00');

-- =============================================
-- COURSES
-- =============================================
INSERT INTO public.courses (id, name, description, category, department, price, discount_percentage, is_bundle_exclusive, teacher_id, thumbnail_url, status, created_at, updated_at) VALUES
('7260bd73-b958-44f7-9e2a-5bc5974b2665', 'Applied Mathematics III', 'Here we talk about ...', 'Year 2', 'General', 250.00, 0, true, 'bcb6a489-08d2-4da7-9211-8ca37b2536c6', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400', 'active', '2026-02-14 18:31:10.669513+00', '2026-02-21 16:29:05.336321+00'),
('03e4a47b-0c49-45e8-8f7d-8a32a87939b5', 'Engineering Mechanics II (Dynamics)', 'This ...', 'Year 2', 'Engineering', 200.00, 0, false, 'bcb6a489-08d2-4da7-9211-8ca37b2536c6', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400', 'active', '2026-02-16 05:03:42.635325+00', '2026-02-16 05:03:42.635325+00');

-- =============================================
-- CHAPTERS
-- =============================================
INSERT INTO public.chapters (id, course_id, title, description, order_index, is_published, created_at, updated_at) VALUES
('f615f7cb-b62e-4607-9664-380cc4c7b907', '7260bd73-b958-44f7-9e2a-5bc5974b2665', 'Chapter 1: Differential equation', 'DE is ...', 1, false, '2026-02-14 18:32:08.81623+00', '2026-02-14 18:32:08.81623+00'),
('b9d7a357-36c2-4dc9-8f8d-297c62a571e3', '7260bd73-b958-44f7-9e2a-5bc5974b2665', 'Chapter 2: Laplace Transformation', 'This ...', 2, false, '2026-02-14 18:32:47.457414+00', '2026-02-14 18:32:47.457414+00'),
('7dddfdd6-8a25-4251-a4f2-3ddc3a55fe5b', '03e4a47b-0c49-45e8-8f7d-8a32a87939b5', 'jj', 'kk', 0, false, '2026-02-21 16:15:32.029412+00', '2026-02-21 16:15:32.029412+00');

-- =============================================
-- LESSONS
-- =============================================
INSERT INTO public.lessons (id, chapter_id, title, description, lesson_type, content_url, youtube_url, video_source, duration, page_count, order_index, is_preview, is_published, is_downloadable, download_url, approval_status, approved_at, approved_by, rejection_reason, created_at, updated_at) VALUES
('ce83c193-3d18-40d6-9db0-e8c8f11a4cd6', 'f615f7cb-b62e-4607-9664-380cc4c7b907', 'Part 1', 'Hshsh', 'video', 'https://youtu.be/xMi7ry-SGkc', 'https://youtu.be/xMi7ry-SGkc', 'youtube', 20, NULL, 0, true, false, true, 'https://drive.google.com/file/d/1SCzdoiD3xgAanSVeUlCvrYsL9nvhCpr9/view?usp=drive_link', 'approved', '2026-02-14 18:53:49.294+00', 'dbece8c0-f934-4d74-907d-afca1a474e8d', NULL, '2026-02-14 18:38:36.235423+00', '2026-02-21 02:23:05.889071+00'),
('b0af17d4-e332-4bf2-9fe6-8265be7dda6a', 'f615f7cb-b62e-4607-9664-380cc4c7b907', 'Part 2', NULL, 'video', 'https://youtu.be/xMi7ry-SGkc', 'https://youtu.be/xMi7ry-SGkc', 'youtube', 20, NULL, 2, false, false, true, 'https://drive.google.com/file/d/1SCzdoiD3xgAanSVeUlCvrYsL9nvhCpr9/view?usp=drive_link', 'approved', '2026-02-14 18:52:55.843+00', 'dbece8c0-f934-4d74-907d-afca1a474e8d', NULL, '2026-02-14 18:52:32.904122+00', '2026-02-21 02:23:05.888965+00'),
('15429c7b-fdeb-4cbd-adb6-3e1fcf1d260c', 'f615f7cb-b62e-4607-9664-380cc4c7b907', 'Note', NULL, 'pdf', 'https://drive.google.com/file/d/1ErGmWMJwGTTeVuks-oZLG8Ye8GaHfxB_/view?usp=drive_link', NULL, 'gdrive', NULL, 30, 1, false, false, false, NULL, 'approved', '2026-02-14 19:23:54.211+00', 'dbece8c0-f934-4d74-907d-afca1a474e8d', NULL, '2026-02-14 19:23:41.624801+00', '2026-02-14 19:23:54.211+00');
-- NOTE: Additional lessons with large text content omitted for brevity

-- =============================================
-- BUNDLES
-- =============================================
INSERT INTO public.bundles (id, name, description, semester, year_level, price, discount_percentage, thumbnail_url, is_active, created_at, updated_at) VALUES
('8930fafb-acce-460e-be30-a15eb6b0bf07', 'Engineering 2nd semester', 'Now', 'Semester 2', 'Year 2', 350, 30, NULL, true, '2026-02-16 05:05:03.133734+00', '2026-02-16 05:05:03.133734+00');

-- =============================================
-- BUNDLE_COURSES
-- =============================================
INSERT INTO public.bundle_courses (id, bundle_id, course_id, created_at) VALUES
('f48d6486-8c14-4854-a8f6-eb29045931bf', '8930fafb-acce-460e-be30-a15eb6b0bf07', '7260bd73-b958-44f7-9e2a-5bc5974b2665', '2026-02-16 05:05:03.264462+00'),
('32c11e82-9790-42f9-b2d6-b06f82bb060a', '8930fafb-acce-460e-be30-a15eb6b0bf07', '03e4a47b-0c49-45e8-8f7d-8a32a87939b5', '2026-02-16 05:05:03.264462+00');

-- =============================================
-- PAYMENT METHODS
-- =============================================
INSERT INTO public.payment_methods (id, method_name, account_name, account_number, bank_name, is_active, created_at, updated_at) VALUES
('ab1f4290-dabb-45aa-833f-718a6f9e87c3', 'CBE Birr', 'ETB Academy', '1000123456789', 'Commercial Bank of Ethiopia', true, '2025-12-30 12:30:03.684154+00', '2025-12-30 12:30:03.684154+00'),
('f458449b-eb24-4234-a42b-75de6b908b08', 'Telebirr', 'ETB Academy', '0911234567', NULL, true, '2025-12-30 12:30:03.684154+00', '2025-12-30 12:30:03.684154+00'),
('9151d712-f1d6-4f7a-aa62-b4906ea4842c', 'M-Pesa', 'ETB Academy', '0922345678', NULL, true, '2025-12-30 12:30:03.684154+00', '2025-12-30 12:30:03.684154+00');

-- =============================================
-- COMPETITIONS
-- =============================================
INSERT INTO public.competitions (id, title, description, date, time, duration, max_participants, registered_count, status, created_at, updated_at) VALUES
('00125837-c9da-4c11-ac61-e085b18944eb', 'Science Quiz Challenge', 'Multi-subject science quiz covering Biology, Chemistry, and Physics', '2026-02-22', '14:00:00', 90, 300, 0, 'upcoming', '2026-01-08 18:13:55.935173+00', '2026-01-08 18:13:55.935173+00');

-- =============================================
-- LIBRARY ITEMS (categories)
-- =============================================
INSERT INTO public.library_items (id, name, description, icon, item_count, status, created_at, updated_at) VALUES
('b4786fba-e720-42e5-8a91-1547678f3358', 'Mathematics Resources', 'Comprehensive math study materials', 'Calculator', 0, 'active', '2026-01-08 18:13:55.935173+00', '2026-01-08 18:13:55.935173+00'),
('79e22f2c-9782-4de8-8b93-cba02ba93c35', 'Biology Resources', 'Books, exams and videos for biology students', 'Book', 0, 'active', '2026-01-08 18:13:55.935173+00', '2026-01-08 18:13:55.935173+00'),
('0b3140b4-21fc-438b-ab22-5702c25f291c', 'History Resources', 'Ethiopian and world history materials', 'BookOpen', 0, 'active', '2026-01-08 18:13:55.935173+00', '2026-01-08 18:13:55.935173+00'),
('72a479e0-bea1-47ca-8a50-9c8aea780e14', 'Past Exams', 'Previous year examination papers', 'FileText', 0, 'active', '2026-01-08 18:13:55.935173+00', '2026-01-08 18:13:55.935173+00');

-- =============================================
-- LIBRARY CONTENT
-- =============================================
INSERT INTO public.library_content (id, category_id, title, description, subject, content_type, file_url, thumbnail_url, author, approval_status, requires_enrollment, download_count, video_source, created_at, updated_at) VALUES
('58543122-8eda-41ad-a7d6-d058f83b8394', '79e22f2c-9782-4de8-8b93-cba02ba93c35', 'Cell Biology Textbook', 'Comprehensive guide to cellular biology', 'Biology', 'book', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=300', 'Dr. Ahmed Mohammed', 'approved', false, 0, 'upload', '2026-01-08 18:13:55.935173+00', '2026-01-08 18:13:55.935173+00'),
('c13f3744-c62b-4fee-ad96-123afdfc5026', '79e22f2c-9782-4de8-8b93-cba02ba93c35', 'Introduction to Genetics', 'Video lecture series on genetics', 'Biology', 'video', 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=300', 'Prof. Sara Tesfaye', 'approved', false, 0, 'upload', '2026-01-08 18:13:55.935173+00', '2026-01-08 18:13:55.935173+00'),
('340ad2af-2b04-45bc-a717-22ad81ee7505', '79e22f2c-9782-4de8-8b93-cba02ba93c35', 'Biology Grade 12 Exam 2023', 'Previous year examination paper', 'Biology', 'exam', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', NULL, 'Ministry of Education', 'approved', false, 0, 'upload', '2026-01-08 18:13:55.935173+00', '2026-01-08 18:13:55.935173+00'),
('6936d2b1-04bd-4d36-98d6-b81948d55ce2', '72a479e0-bea1-47ca-8a50-9c8aea780e14', 'Physics Grade 12 - 2023', 'National exam paper 2023', 'Physics', 'exam', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', NULL, 'MOE', 'approved', false, 0, 'upload', '2026-01-08 18:13:55.935173+00', '2026-01-08 18:13:55.935173+00'),
('90f2fc0b-30b1-447a-bf6c-521ad90cf795', '72a479e0-bea1-47ca-8a50-9c8aea780e14', 'Mathematics Grade 12 - 2023', 'National exam paper 2023', 'Mathematics', 'exam', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', NULL, 'MOE', 'approved', false, 0, 'upload', '2026-01-08 18:13:55.935173+00', '2026-01-08 18:13:55.935173+00'),
('1c1effde-ca30-4e50-b360-fa9a296cf20c', '72a479e0-bea1-47ca-8a50-9c8aea780e14', 'English Grade 12 - 2023', 'National exam paper 2023', 'English', 'exam', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', NULL, 'MOE', 'approved', false, 0, 'upload', '2026-01-08 18:13:55.935173+00', '2026-01-08 18:13:55.935173+00');

-- =============================================
-- ENROLLMENTS
-- =============================================
INSERT INTO public.enrollments (id, student_id, course_id, bundle_id, enrollment_type, payment_amount, status, expires_at, created_at, updated_at) VALUES
('9ca4868b-b17f-41f0-96c8-826a2b572296', 'ee220af2-7a88-42ec-8065-1991dc7ba7aa', '7260bd73-b958-44f7-9e2a-5bc5974b2665', NULL, 'course', 250, 'approved', '2026-08-14 18:42:37.813+00', '2026-02-14 18:40:25.009285+00', '2026-02-14 18:40:25.009285+00'),
('024a31a9-9855-488a-8e31-4780653a74c6', '9339086e-0a18-4e1a-bf79-b5455307d0ff', NULL, '8930fafb-acce-460e-be30-a15eb6b0bf07', 'bundle', 350, 'pending', NULL, '2026-02-16 05:08:20.250565+00', '2026-02-16 05:08:20.250565+00'),
('f3c13b1d-c755-4b3e-98bb-7de995a52347', '385ae7da-380f-4d2a-9383-d69f226b8c80', '03e4a47b-0c49-45e8-8f7d-8a32a87939b5', NULL, 'course', 200, 'pending', NULL, '2026-02-16 06:29:20.846506+00', '2026-02-16 06:29:20.846506+00'),
('440745c3-5603-4cad-a6a6-4e3414ac0be9', 'ee220af2-7a88-42ec-8065-1991dc7ba7aa', '03e4a47b-0c49-45e8-8f7d-8a32a87939b5', NULL, 'course', 200, 'pending', NULL, '2026-02-18 14:35:57.562704+00', '2026-02-18 14:35:57.562704+00'),
('18c51c45-2871-497f-9a8c-7e764cfa4ced', 'ee220af2-7a88-42ec-8065-1991dc7ba7aa', '03e4a47b-0c49-45e8-8f7d-8a32a87939b5', NULL, 'course', 200, 'pending', NULL, '2026-02-18 14:36:39.744821+00', '2026-02-18 14:36:39.744821+00'),
('8715d51d-0473-4a7a-abdd-a64ea4a0c4ba', '385ae7da-380f-4d2a-9383-d69f226b8c80', NULL, '8930fafb-acce-460e-be30-a15eb6b0bf07', 'bundle', 350, 'pending', NULL, '2026-02-21 04:48:52.160292+00', '2026-02-21 04:48:52.160292+00'),
('a5304037-19bb-4050-a4ac-0a2e0f340496', '385ae7da-380f-4d2a-9383-d69f226b8c80', '03e4a47b-0c49-45e8-8f7d-8a32a87939b5', NULL, 'course', 200, 'approved', '2026-08-21 17:48:24.186+00', '2026-02-21 17:47:28.478548+00', '2026-02-21 17:47:28.478548+00');

-- =============================================
-- TUTORIAL VIDEOS
-- =============================================
INSERT INTO public.tutorial_videos (id, title, description, video_url, thumbnail_url, target_audience, duration, display_order, is_active, uploaded_by, created_at, updated_at) VALUES
('93ee2e5a-c395-487b-b221-71c0b0472756', 'How to Signup to Magster Academy', 'Complete guide to navigating and using the Magster Academy platform', 'https://www.youtube.com/embed/NHd71FVYw2Y', 'https://img.youtube.com/vi/NHd71FVYw2Y/maxresdefault.jpg', 'student', 440, 1, true, NULL, '2026-01-08 18:51:30.497751+00', '2026-01-09 10:55:23.645+00'),
('6ee4bdb2-06bb-4cde-896e-ff05ef6ac261', 'Getting Started with Courses', 'Learn how to browse, enroll, and access your courses', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 'student', 240, 2, true, NULL, '2026-01-08 18:51:30.497751+00', '2026-01-08 18:51:30.497751+00'),
('0ddb7661-6494-4db4-99ae-82486dda233d', 'jjj', 'Engineering Dynamics is a foundational course designed for students from all engineering disciplines.', 'https://youtu.be/xMi7ry-SGkc?si=ABdSCOp0dnlxVG2A', 'https://drive.google.com/file/d/1i8PUGPtMMU_RcRVSx4lE2mC97j9cPHkW/view?usp=sharing', 'student', 1156, 1, true, 'dbece8c0-f934-4d74-907d-afca1a474e8d', '2026-02-12 17:54:59.132476+00', '2026-02-12 17:54:59.132476+00');

-- =============================================
-- LESSON PROGRESS
-- =============================================
INSERT INTO public.lesson_progress (id, student_id, lesson_id, enrollment_id, status, progress_percentage, last_position, created_at, updated_at) VALUES
('4282cb14-6946-4265-8b21-cca05bd5c31c', 'ee220af2-7a88-42ec-8065-1991dc7ba7aa', 'ce83c193-3d18-40d6-9db0-e8c8f11a4cd6', '9ca4868b-b17f-41f0-96c8-826a2b572296', 'in_progress', 0, 0, '2026-02-14 18:42:58.088388+00', '2026-02-21 18:39:16.645981+00'),
('1a826c83-4f18-423b-a3f1-6930e9cf24c7', 'ee220af2-7a88-42ec-8065-1991dc7ba7aa', 'b0af17d4-e332-4bf2-9fe6-8265be7dda6a', '9ca4868b-b17f-41f0-96c8-826a2b572296', 'in_progress', 0, 0, '2026-02-14 18:54:16.106883+00', '2026-02-16 05:15:06.519667+00');

-- =============================================
-- PAYMENT SUBMISSIONS
-- =============================================
INSERT INTO public.payment_submissions (id, enrollment_id, student_id, screenshot_urls, payment_method, amount, status, admin_notes, reviewed_at, reviewed_by, submitted_at) VALUES
('18754f3e-a03a-4d6a-8876-5b5b5fb2d57c', '9ca4868b-b17f-41f0-96c8-826a2b572296', 'ee220af2-7a88-42ec-8065-1991dc7ba7aa', ARRAY['https://rpfhatpademhbcbrqtch.supabase.co/storage/v1/object/public/payment-proofs/ee220af2-7a88-42ec-8065-1991dc7ba7aa/9ca4868b-b17f-41f0-96c8-826a2b572296/1771094441157-k5lbiyufnsj.jpg'], 'Bank Transfer', 250, 'approved', '', '2026-02-14 18:42:37.631+00', 'dbece8c0-f934-4d74-907d-afca1a474e8d', '2026-02-14 18:40:56.634462+00'),
('7f8f5fa3-7203-402f-9cff-9bb0582aea17', '024a31a9-9855-488a-8e31-4780653a74c6', '9339086e-0a18-4e1a-bf79-b5455307d0ff', ARRAY['https://rpfhatpademhbcbrqtch.supabase.co/storage/v1/object/public/payment-proofs/9339086e-0a18-4e1a-bf79-b5455307d0ff/024a31a9-9855-488a-8e31-4780653a74c6/1771218639720-5fd4lbiyagx.png'], 'Bank Transfer', 350, 'pending', NULL, NULL, NULL, '2026-02-16 05:10:48.621353+00'),
('060c78df-65b0-4cac-a01c-7a3331f3ad5e', 'f3c13b1d-c755-4b3e-98bb-7de995a52347', '385ae7da-380f-4d2a-9383-d69f226b8c80', ARRAY['https://rpfhatpademhbcbrqtch.supabase.co/storage/v1/object/public/payment-proofs/385ae7da-380f-4d2a-9383-d69f226b8c80/f3c13b1d-c755-4b3e-98bb-7de995a52347/1771223385407-2g6aowpoccf.jpg'], 'Bank Transfer', 200, 'pending', NULL, NULL, NULL, '2026-02-16 06:29:52.46708+00'),
('f8e34a9c-1e96-4eef-8d39-e2d8bdb3176f', '18c51c45-2871-497f-9a8c-7e764cfa4ced', 'ee220af2-7a88-42ec-8065-1991dc7ba7aa', ARRAY['https://rpfhatpademhbcbrqtch.supabase.co/storage/v1/object/public/payment-proofs/ee220af2-7a88-42ec-8065-1991dc7ba7aa/18c51c45-2871-497f-9a8c-7e764cfa4ced/1771425409059-n4bshvksinf.jpg'], 'Bank Transfer', 200, 'pending', NULL, NULL, NULL, '2026-02-18 14:37:01.144631+00'),
('1da28e94-5635-42f8-83e5-5d07f927b17b', '8715d51d-0473-4a7a-abdd-a64ea4a0c4ba', '385ae7da-380f-4d2a-9383-d69f226b8c80', ARRAY['https://rpfhatpademhbcbrqtch.supabase.co/storage/v1/object/public/payment-proofs/385ae7da-380f-4d2a-9383-d69f226b8c80/8715d51d-0473-4a7a-abdd-a64ea4a0c4ba/1771649352021-qmj5odfxhl.png'], 'Bank Transfer', 350, 'pending', NULL, NULL, NULL, '2026-02-21 04:49:17.633363+00'),
('a9b18eff-c4a2-4ad1-ab56-c6b47fe46d53', 'a5304037-19bb-4050-a4ac-0a2e0f340496', '385ae7da-380f-4d2a-9383-d69f226b8c80', ARRAY['https://rpfhatpademhbcbrqtch.supabase.co/storage/v1/object/public/payment-proofs/385ae7da-380f-4d2a-9383-d69f226b8c80/a5304037-19bb-4050-a4ac-0a2e0f340496/1771696086278-uqzdgasr4aj.png'], 'Bank Transfer', 200, 'approved', '', '2026-02-21 17:48:24.077+00', 'dbece8c0-f934-4d74-907d-afca1a474e8d', '2026-02-21 17:48:10.960579+00');

-- =============================================
-- NOTE: Tables with no data (empty):
-- competition_questions, competition_participants,
-- quizzes, quiz_questions, quiz_attempts,
-- teacher_earnings, user_downloads
-- =============================================
-- NOTE: device_bindings, trusted_devices, and notifications
-- contain operational data that changes frequently and
-- are not included in seed data.
-- =============================================
