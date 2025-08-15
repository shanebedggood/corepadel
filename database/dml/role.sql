-- Seed  roles
INSERT INTO core.role (role_id, role_name) 
VALUES 
    (gen_random_uuid(), 'player'),
    (gen_random_uuid(), 'admin'),
    (gen_random_uuid(), 'sysadmin')
ON CONFLICT (role_name) DO NOTHING;
