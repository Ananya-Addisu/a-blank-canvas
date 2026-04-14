
-- Replace TOS/Privacy with teacher withdrawal terms in app_settings
DELETE FROM public.app_settings WHERE setting_key IN ('terms_of_service', 'privacy_policy');

INSERT INTO public.app_settings (setting_key, setting_value, description)
VALUES (
  'teacher_withdrawal_terms',
  E'General Terms for Withdrawals\n\nThese terms govern the withdrawal of earnings from the Magster platform:\n\n1. Eligibility for Withdrawals\n- Instructors must have a verified account to request withdrawals\n- Minimum withdrawal amount is ETB 500\n- Only earnings from completed course sales are eligible for withdrawal\n- Funds from refunded courses cannot be withdrawn\n\n2. Processing Time\n- Withdrawal requests are processed within 5-7 business days\n- Requests made on weekends or holidays will be processed on the next business day\n- Bank transfers may take an additional 2-3 business days\n- You will receive an email confirmation when your withdrawal is processed\n\n3. Withdrawal Methods\n- Bank transfer to your registered Ethiopian bank account\n- Mobile money transfer (M-Pesa, Telebirr, CBE Birr)\n- Account details must be verified before first withdrawal\n\n4. Fees and Charges\n- Platform commission: 20% of gross earnings\n- Transaction fees may apply depending on withdrawal method\n- All fees will be clearly displayed before confirming withdrawal\n\n5. Tax Obligations\n- Instructors are responsible for their own tax obligations\n- Magster will provide earning statements for tax purposes\n- Please consult with a tax professional for guidance',
  'Teacher withdrawal terms and conditions displayed to teachers'
)
ON CONFLICT (setting_key) DO NOTHING;
