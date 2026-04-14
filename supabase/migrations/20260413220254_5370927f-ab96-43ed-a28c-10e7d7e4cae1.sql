-- Delete M-Pesa payment method
DELETE FROM payment_methods WHERE method_name = 'M-Pesa';

-- Update CBE Birr with correct details
UPDATE payment_methods 
SET account_name = 'Asmamaw Abebaw', 
    account_number = '1000610828276',
    bank_name = 'Commercial Bank of Ethiopia',
    method_name = 'Commercial Bank of Ethiopia',
    updated_at = now()
WHERE id = 'ab1f4290-dabb-45aa-833f-718a6f9e87c3';

-- Update Telebirr with correct details
UPDATE payment_methods 
SET account_name = 'Wubamlak', 
    account_number = '0918472699',
    method_name = 'Telebirr',
    updated_at = now()
WHERE id = 'f458449b-eb24-4234-a42b-75de6b908b08';

-- Insert Bank of Abyssinia
INSERT INTO payment_methods (method_name, account_name, account_number, bank_name, is_active)
VALUES ('Bank of Abyssinia', 'Asmamaw Abebaw', '163240955', 'Bank of Abyssinia', true);