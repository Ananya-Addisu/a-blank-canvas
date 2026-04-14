
INSERT INTO courses (id, name, category, department, description, price, status) VALUES
  (gen_random_uuid(), 'Introduction to Psychology', 'Social Science', 'Freshman - 1st Semester', 'Explore the fundamentals of human behavior and mental processes.', 750, 'active'),
  (gen_random_uuid(), 'Communicative English', 'Language', 'Freshman - 1st Semester', 'Develop academic English communication skills.', 650, 'active'),
  (gen_random_uuid(), 'General Chemistry', 'Natural Science', 'Freshman - 1st Semester', 'Atomic structure, bonding, and chemical reactions.', 850, 'active'),
  (gen_random_uuid(), 'Applied Mathematics I', 'Mathematics', 'Freshman - 2nd Semester', 'Calculus, linear algebra, and differential equations.', 900, 'active'),
  (gen_random_uuid(), 'Introduction to Sociology', 'Social Science', 'Freshman - 2nd Semester', 'Study society, social institutions, and human interaction.', 700, 'active'),
  (gen_random_uuid(), 'General Physics', 'Natural Science', 'Freshman - 2nd Semester', 'Mechanics, thermodynamics, and waves.', 850, 'active'),
  (gen_random_uuid(), 'Data Structures and Algorithms', 'Computer Science', 'Year 2 - 1st Semester', 'Arrays, linked lists, trees, graphs, and sorting algorithms.', 1200, 'active'),
  (gen_random_uuid(), 'Object-Oriented Programming', 'Computer Science', 'Year 2 - 1st Semester', 'OOP concepts using Java with practical projects.', 1100, 'active'),
  (gen_random_uuid(), 'Discrete Mathematics', 'Mathematics', 'Year 2 - 1st Semester', 'Logic, sets, combinatorics, and graph theory.', 950, 'active'),
  (gen_random_uuid(), 'Database Systems', 'Computer Science', 'Year 2 - 2nd Semester', 'Relational databases, SQL, normalization, and ER modeling.', 1150, 'active'),
  (gen_random_uuid(), 'Computer Networks', 'Computer Science', 'Year 2 - 2nd Semester', 'Network protocols, architecture, and security fundamentals.', 1200, 'active'),
  (gen_random_uuid(), 'Statistics for Engineers', 'Mathematics', 'Year 2 - 2nd Semester', 'Probability, distributions, and hypothesis testing.', 900, 'active'),
  (gen_random_uuid(), 'Software Engineering', 'Computer Science', 'Year 3 - 1st Semester', 'SDLC, agile methodologies, and project management.', 1300, 'active'),
  (gen_random_uuid(), 'Operating Systems', 'Computer Science', 'Year 3 - 1st Semester', 'Process management, memory, file systems, and concurrency.', 1250, 'active'),
  (gen_random_uuid(), 'Artificial Intelligence', 'Computer Science', 'Year 3 - 2nd Semester', 'Search algorithms, machine learning basics, and neural networks.', 1400, 'active'),
  (gen_random_uuid(), 'Web Development', 'Computer Science', 'Year 3 - 2nd Semester', 'Full-stack web development with modern frameworks.', 1350, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO bundles (id, name, description, year_level, semester, price, discount_percentage, is_active, display_order) VALUES
  ('b1000001-0000-0000-0000-000000000001', 'Freshman 1st Semester Bundle', 'All first semester freshman courses in one package', 'Freshman', '1st Semester', 1800, 15, true, 1),
  ('b1000001-0000-0000-0000-000000000002', 'Freshman 2nd Semester Bundle', 'All second semester freshman courses in one package', 'Freshman', '2nd Semester', 2000, 10, true, 2),
  ('b1000001-0000-0000-0000-000000000003', 'Year 2 1st Semester Bundle', 'Second year first semester complete package', 'Year 2', '1st Semester', 2800, 20, true, 3),
  ('b1000001-0000-0000-0000-000000000004', 'Year 2 2nd Semester Bundle', 'Second year second semester complete package', 'Year 2', '2nd Semester', 2700, 15, true, 4),
  ('b1000001-0000-0000-0000-000000000005', 'Year 3 1st Semester Bundle', 'Third year first semester courses', 'Year 3', '1st Semester', 2200, 10, true, 5),
  ('b1000001-0000-0000-0000-000000000006', 'Year 3 2nd Semester Bundle', 'Third year second semester courses', 'Year 3', '2nd Semester', 2400, 12, true, 6)
ON CONFLICT DO NOTHING;

INSERT INTO bundle_courses (bundle_id, course_id)
SELECT 'b1000001-0000-0000-0000-000000000001', id FROM courses WHERE department = 'Freshman - 1st Semester'
ON CONFLICT DO NOTHING;

INSERT INTO bundle_courses (bundle_id, course_id)
SELECT 'b1000001-0000-0000-0000-000000000002', id FROM courses WHERE department = 'Freshman - 2nd Semester'
ON CONFLICT DO NOTHING;

INSERT INTO bundle_courses (bundle_id, course_id)
SELECT 'b1000001-0000-0000-0000-000000000003', id FROM courses WHERE department = 'Year 2 - 1st Semester'
ON CONFLICT DO NOTHING;

INSERT INTO bundle_courses (bundle_id, course_id)
SELECT 'b1000001-0000-0000-0000-000000000004', id FROM courses WHERE department = 'Year 2 - 2nd Semester'
ON CONFLICT DO NOTHING;

INSERT INTO bundle_courses (bundle_id, course_id)
SELECT 'b1000001-0000-0000-0000-000000000005', id FROM courses WHERE department = 'Year 3 - 1st Semester'
ON CONFLICT DO NOTHING;

INSERT INTO bundle_courses (bundle_id, course_id)
SELECT 'b1000001-0000-0000-0000-000000000006', id FROM courses WHERE department = 'Year 3 - 2nd Semester'
ON CONFLICT DO NOTHING;
