
INSERT INTO chapters (id, course_id, title, order_index, is_published) VALUES
('a1000001-0001-0001-0001-000000000001', '2817f32d-31d7-4b0a-b070-4c399e9239a0', 'Chapter 1: Mechanics & Motion', 0, true),
('a1000001-0001-0001-0001-000000000002', '2817f32d-31d7-4b0a-b070-4c399e9239a0', 'Chapter 2: Thermodynamics', 1, true),
('a1000002-0001-0001-0001-000000000001', '31e5bd96-b8d4-4975-9301-72c93cbd43f5', 'Chapter 1: Atomic Structure', 0, true),
('a1000002-0001-0001-0001-000000000002', '31e5bd96-b8d4-4975-9301-72c93cbd43f5', 'Chapter 2: Chemical Bonding', 1, true),
('a1000003-0001-0001-0001-000000000001', '934f2866-7c58-433c-a5d5-27cc54efebe4', 'Chapter 1: Limits and Continuity', 0, true),
('a1000003-0001-0001-0001-000000000002', '934f2866-7c58-433c-a5d5-27cc54efebe4', 'Chapter 2: Differentiation', 1, true),
('a1000004-0001-0001-0001-000000000001', '1a06e0e2-c381-45c0-acc4-8e324026bdff', 'Chapter 1: Arrays & Linked Lists', 0, true),
('a1000004-0001-0001-0001-000000000002', '1a06e0e2-c381-45c0-acc4-8e324026bdff', 'Chapter 2: Trees & Graphs', 1, true),
('a1000005-0001-0001-0001-000000000001', 'e4217434-e619-4e2d-aa51-af90f339a306', 'Chapter 1: Logic & Proofs', 0, true),
('a1000005-0001-0001-0001-000000000002', 'e4217434-e619-4e2d-aa51-af90f339a306', 'Chapter 2: Set Theory', 1, true),
('a1000006-0001-0001-0001-000000000001', '57974903-e8df-4aed-ae6d-589d5f20d0df', 'Chapter 1: HTML & CSS Basics', 0, true),
('a1000006-0001-0001-0001-000000000002', '57974903-e8df-4aed-ae6d-589d5f20d0df', 'Chapter 2: JavaScript Essentials', 1, true);

-- General Physics
INSERT INTO lessons (chapter_id, title, lesson_type, order_index, is_preview, is_published, approval_status, content_url) VALUES
('a1000001-0001-0001-0001-000000000001', 'Introduction to Kinematics', 'pdf', 0, true, true, 'approved', ''),
('a1000001-0001-0001-0001-000000000001', 'Newtons Laws of Motion', 'pdf', 1, true, true, 'approved', ''),
('a1000001-0001-0001-0001-000000000001', 'Work Energy and Power', 'pdf', 2, false, true, 'approved', ''),
('a1000001-0001-0001-0001-000000000002', 'Heat and Temperature', 'pdf', 0, false, true, 'approved', ''),
('a1000001-0001-0001-0001-000000000002', 'Laws of Thermodynamics', 'pdf', 1, false, true, 'approved', '');

-- General Chemistry
INSERT INTO lessons (chapter_id, title, lesson_type, order_index, is_preview, is_published, approval_status, content_url) VALUES
('a1000002-0001-0001-0001-000000000001', 'Atomic Models and Quantum Numbers', 'pdf', 0, true, true, 'approved', ''),
('a1000002-0001-0001-0001-000000000001', 'Electron Configuration', 'pdf', 1, false, true, 'approved', ''),
('a1000002-0001-0001-0001-000000000002', 'Ionic and Covalent Bonds', 'pdf', 0, false, true, 'approved', ''),
('a1000002-0001-0001-0001-000000000002', 'Molecular Geometry', 'pdf', 1, false, true, 'approved', '');

-- Applied Mathematics I
INSERT INTO lessons (chapter_id, title, lesson_type, order_index, is_preview, is_published, approval_status, content_url) VALUES
('a1000003-0001-0001-0001-000000000001', 'Introduction to Limits', 'pdf', 0, true, true, 'approved', ''),
('a1000003-0001-0001-0001-000000000001', 'Continuity of Functions', 'video', 1, true, true, 'approved', ''),
('a1000003-0001-0001-0001-000000000001', 'Squeeze Theorem', 'pdf', 2, false, true, 'approved', ''),
('a1000003-0001-0001-0001-000000000002', 'Rules of Differentiation', 'video', 0, false, true, 'approved', ''),
('a1000003-0001-0001-0001-000000000002', 'Applications of Derivatives', 'pdf', 1, false, true, 'approved', '');

-- Data Structures and Algorithms
INSERT INTO lessons (chapter_id, title, lesson_type, order_index, is_preview, is_published, approval_status, content_url) VALUES
('a1000004-0001-0001-0001-000000000001', 'Introduction to Data Structures', 'pdf', 0, true, true, 'approved', ''),
('a1000004-0001-0001-0001-000000000001', 'Linked List Operations', 'pdf', 1, false, true, 'approved', ''),
('a1000004-0001-0001-0001-000000000002', 'Binary Search Trees', 'video', 0, false, true, 'approved', ''),
('a1000004-0001-0001-0001-000000000002', 'Graph Traversal Algorithms', 'pdf', 1, false, true, 'approved', '');

-- Discrete Mathematics
INSERT INTO lessons (chapter_id, title, lesson_type, order_index, is_preview, is_published, approval_status, content_url) VALUES
('a1000005-0001-0001-0001-000000000001', 'Propositional Logic', 'pdf', 0, true, true, 'approved', ''),
('a1000005-0001-0001-0001-000000000001', 'Predicate Logic and Quantifiers', 'video', 1, true, true, 'approved', ''),
('a1000005-0001-0001-0001-000000000002', 'Sets and Operations', 'pdf', 0, false, true, 'approved', ''),
('a1000005-0001-0001-0001-000000000002', 'Relations and Functions', 'pdf', 1, false, true, 'approved', '');

-- Web Development
INSERT INTO lessons (chapter_id, title, lesson_type, order_index, is_preview, is_published, approval_status, content_url) VALUES
('a1000006-0001-0001-0001-000000000001', 'HTML Document Structure', 'pdf', 0, true, true, 'approved', ''),
('a1000006-0001-0001-0001-000000000001', 'CSS Selectors and Box Model', 'pdf', 1, false, true, 'approved', ''),
('a1000006-0001-0001-0001-000000000002', 'Variables Functions and Scope', 'video', 0, false, true, 'approved', ''),
('a1000006-0001-0001-0001-000000000002', 'DOM Manipulation', 'pdf', 1, false, true, 'approved', '');
