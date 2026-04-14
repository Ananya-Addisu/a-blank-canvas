-- Clear all existing device bindings since we changed the fingerprinting algorithm
-- from browser-based to device-based. All users will re-bind on next login.
UPDATE device_bindings SET is_active = false WHERE is_active = true;
