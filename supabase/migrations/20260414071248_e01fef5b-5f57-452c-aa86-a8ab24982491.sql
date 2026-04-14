
-- 10 Library Items
INSERT INTO public.library_items (id, name, description, icon, item_count, status) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Grade 12 Mathematics', 'Complete math resources including calculus, algebra, and geometry', 'Calculator', 24, 'active'),
  ('a0000001-0000-0000-0000-000000000002', 'Grade 12 Physics', 'Mechanics, electromagnetism, optics and modern physics materials', 'Atom', 18, 'active'),
  ('a0000001-0000-0000-0000-000000000003', 'Grade 12 Chemistry', 'Organic, inorganic and physical chemistry study materials', 'FlaskConical', 16, 'active'),
  ('a0000001-0000-0000-0000-000000000004', 'Grade 12 Biology', 'Genetics, ecology, human anatomy and plant biology resources', 'Leaf', 20, 'active'),
  ('a0000001-0000-0000-0000-000000000005', 'Grade 12 English', 'Grammar, literature, essay writing and comprehension guides', 'BookOpen', 14, 'active'),
  ('a0000001-0000-0000-0000-000000000006', 'Ethiopian University Entrance Exam (EUEE)', 'Past entrance exam papers with detailed solutions', 'GraduationCap', 30, 'active'),
  ('a0000001-0000-0000-0000-000000000007', 'Grade 11 Mathematics', 'Pre-calculus, trigonometry and statistics resources', 'Calculator', 22, 'active'),
  ('a0000001-0000-0000-0000-000000000008', 'Grade 11 Physics', 'Thermodynamics, waves, and introductory mechanics', 'Atom', 15, 'active'),
  ('a0000001-0000-0000-0000-000000000009', 'History & Civics', 'Ethiopian and world history, civic education materials', 'Landmark', 12, 'active'),
  ('a0000001-0000-0000-0000-000000000010', 'Aptitude & Reasoning', 'Logical reasoning, verbal ability and quantitative aptitude', 'Brain', 10, 'active')
ON CONFLICT (id) DO NOTHING;

-- 3 Competitions
-- Competition 1: Upcoming (April 20, 2026)
INSERT INTO public.competitions (id, title, description, date, time, duration, max_participants, registered_count, status, is_published, is_finished) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'National Mathematics Challenge 2026', 'Test your math skills against students from across Ethiopia. Covers algebra, calculus, geometry and number theory.', '2026-04-20', '10:00', 60, 500, 87, 'upcoming', true, false);

-- Competition 2: Past (yesterday April 13, 2026 morning)
INSERT INTO public.competitions (id, title, description, date, time, duration, max_participants, registered_count, status, is_published, is_finished) VALUES
  ('c0000001-0000-0000-0000-000000000002', 'Physics Olympiad Qualifier', 'Regional qualifier for the Ethiopian Physics Olympiad. Covers mechanics, electromagnetism, thermodynamics and optics.', '2026-04-13', '09:00', 90, 300, 245, 'completed', true, true);

-- Competition 3: Past (yesterday April 13, 2026 afternoon)
INSERT INTO public.competitions (id, title, description, date, time, duration, max_participants, registered_count, status, is_published, is_finished) VALUES
  ('c0000001-0000-0000-0000-000000000003', 'Biology & Chemistry Combined Quiz', 'A combined science quiz covering cell biology, genetics, organic chemistry and chemical reactions.', '2026-04-13', '14:30', 45, 400, 312, 'completed', true, true);

-- =============================================
-- Competition 1 Questions (National Mathematics Challenge)
-- =============================================
INSERT INTO public.competition_questions (competition_id, question_text, correct_answer, options, order_index, points, question_type) VALUES
('c0000001-0000-0000-0000-000000000001', 'What is the derivative of f(x) = 3x⁴ - 2x² + 5?', 'B', '["6x³ - 2x", "12x³ - 4x", "12x³ - 2x", "3x³ - 4x"]', 1, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000001', 'If log₂(x) = 5, what is x?', 'C', '["10", "25", "32", "64"]', 2, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000001', 'What is the sum of the interior angles of a hexagon?', 'B', '["540°", "720°", "900°", "1080°"]', 3, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000001', 'Solve: 2x + 5 = 3x - 7', 'D', '["2", "-2", "-12", "12"]', 4, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000001', 'What is the value of 15! / 13!?', 'A', '["210", "180", "240", "150"]', 5, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000001', 'The integral of cos(x) dx is:', 'B', '["cos(x) + C", "sin(x) + C", "-sin(x) + C", "-cos(x) + C"]', 6, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000001', 'What is the determinant of the matrix [[2,3],[1,4]]?', 'C', '["11", "3", "5", "7"]', 7, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000001', 'If a circle has radius 7, what is its area?', 'A', '["49π", "14π", "7π", "21π"]', 8, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000001', 'What is the next number in the sequence: 2, 6, 18, 54, ...?', 'B', '["108", "162", "148", "216"]', 9, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000001', 'Simplify: (x² - 9) / (x - 3)', 'D', '["x - 9", "x² - 3", "x - 3", "x + 3"]', 10, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000001', 'What is the slope of the line 4x - 2y = 8?', 'A', '["2", "4", "-2", "-4"]', 11, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000001', 'How many ways can 5 books be arranged on a shelf?', 'C', '["25", "60", "120", "720"]', 12, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000001', 'What is sin(30°)?', 'B', '["1", "0.5", "√3/2", "√2/2"]', 13, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000001', 'If f(x) = x² + 2x, what is f(3)?', 'D', '["9", "11", "12", "15"]', 14, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000001', 'What is the LCM of 12 and 18?', 'A', '["36", "72", "6", "216"]', 15, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000001', 'The quadratic formula gives the roots of ax² + bx + c = 0. What is the discriminant?', 'C', '["b² + 4ac", "b² - 2ac", "b² - 4ac", "4ac - b²"]', 16, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000001', 'What is the probability of rolling a sum of 7 with two dice?', 'B', '["1/12", "1/6", "1/9", "1/3"]', 17, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000001', 'Convert 0.375 to a fraction in lowest terms:', 'D', '["3/4", "1/3", "5/8", "3/8"]', 18, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000001', 'What is the volume of a sphere with radius 3?', 'A', '["36π", "27π", "12π", "108π"]', 19, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000001', 'If 3^x = 81, what is x?', 'C', '["3", "5", "4", "6"]', 20, 5, 'multiple_choice');

-- =============================================
-- Competition 2 Questions (Physics Olympiad Qualifier)
-- =============================================
INSERT INTO public.competition_questions (competition_id, question_text, correct_answer, options, order_index, points, question_type) VALUES
('c0000001-0000-0000-0000-000000000002', 'What is the SI unit of force?', 'B', '["Joule", "Newton", "Watt", "Pascal"]', 1, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000002', 'A car accelerates from 0 to 20 m/s in 5 seconds. What is its acceleration?', 'A', '["4 m/s²", "5 m/s²", "10 m/s²", "100 m/s²"]', 2, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000002', 'Which law states that every action has an equal and opposite reaction?', 'C', '["First law", "Second law", "Third law", "Law of gravitation"]', 3, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000002', 'What is the speed of light in vacuum?', 'D', '["3 × 10⁶ m/s", "3 × 10⁷ m/s", "3 × 10⁹ m/s", "3 × 10⁸ m/s"]', 4, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000002', 'An object of mass 5 kg is lifted 10 m. What is the potential energy gained? (g = 10 m/s²)', 'B', '["250 J", "500 J", "50 J", "100 J"]', 5, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000002', 'What type of lens is used to correct myopia?', 'A', '["Concave", "Convex", "Cylindrical", "Bifocal"]', 6, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000002', 'Ohm''s law states that V equals:', 'C', '["I/R", "R/I", "IR", "I²R"]', 7, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000002', 'What is the unit of electrical resistance?', 'B', '["Ampere", "Ohm", "Volt", "Coulomb"]', 8, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000002', 'A wave has frequency 50 Hz and wavelength 2 m. What is its speed?', 'D', '["25 m/s", "52 m/s", "48 m/s", "100 m/s"]', 9, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000002', 'Which type of electromagnetic radiation has the shortest wavelength?', 'A', '["Gamma rays", "X-rays", "Ultraviolet", "Microwaves"]', 10, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000002', 'What is the first law of thermodynamics essentially about?', 'C', '["Entropy", "Temperature", "Conservation of energy", "Heat transfer"]', 11, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000002', 'A projectile is launched at 45°. What gives maximum range?', 'B', '["30°", "45°", "60°", "90°"]', 12, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000002', 'What happens to the period of a pendulum if its length is quadrupled?', 'A', '["Doubles", "Quadruples", "Halves", "Stays same"]', 13, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000002', 'What is the momentum of a 3 kg object moving at 4 m/s?', 'D', '["7 kg·m/s", "1 kg·m/s", "0.75 kg·m/s", "12 kg·m/s"]', 14, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000002', 'In which medium does sound travel fastest?', 'C', '["Air", "Water", "Steel", "Vacuum"]', 15, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000002', 'What is the charge of an electron?', 'B', '["1.6 × 10⁻¹⁹ C", "-1.6 × 10⁻¹⁹ C", "9.1 × 10⁻³¹ C", "-9.1 × 10⁻³¹ C"]', 16, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000002', 'What is the efficiency formula?', 'A', '["(Useful output / Total input) × 100", "(Input / Output) × 100", "Output - Input", "Input × Output"]', 17, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000002', 'Coulomb''s law describes the force between:', 'D', '["Magnets", "Masses", "Currents", "Charges"]', 18, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000002', 'What is the kinetic energy of a 2 kg ball moving at 3 m/s?', 'C', '["3 J", "6 J", "9 J", "18 J"]', 19, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000002', 'Which color of visible light has the longest wavelength?', 'A', '["Red", "Blue", "Green", "Violet"]', 20, 5, 'multiple_choice');

-- =============================================
-- Competition 3 Questions (Biology & Chemistry Combined Quiz)
-- =============================================
INSERT INTO public.competition_questions (competition_id, question_text, correct_answer, options, order_index, points, question_type) VALUES
('c0000001-0000-0000-0000-000000000003', 'What is the powerhouse of the cell?', 'B', '["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"]', 1, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000003', 'What is the chemical formula of water?', 'A', '["H₂O", "CO₂", "NaCl", "H₂O₂"]', 2, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000003', 'DNA stands for:', 'C', '["Dinitro acid", "Deoxyribo nucleic acid", "Deoxyribonucleic acid", "Dinucleotide acid"]', 3, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000003', 'What is the atomic number of Carbon?', 'B', '["12", "6", "8", "14"]', 4, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000003', 'Photosynthesis primarily occurs in which organelle?', 'D', '["Mitochondria", "Nucleus", "Vacuole", "Chloroplast"]', 5, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000003', 'What is the pH of a neutral solution?', 'C', '["0", "14", "7", "1"]', 6, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000003', 'Which blood type is the universal donor?', 'A', '["O-", "AB+", "A+", "B-"]', 7, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000003', 'What is the most abundant gas in Earth''s atmosphere?', 'B', '["Oxygen", "Nitrogen", "Carbon dioxide", "Argon"]', 8, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000003', 'How many chromosomes do humans have?', 'D', '["23", "44", "48", "46"]', 9, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000003', 'Which element has the symbol Fe?', 'C', '["Fluorine", "Francium", "Iron", "Fermium"]', 10, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000003', 'The process of cell division in somatic cells is called:', 'A', '["Mitosis", "Meiosis", "Binary fission", "Budding"]', 11, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000003', 'What type of bond holds NaCl together?', 'B', '["Covalent", "Ionic", "Metallic", "Hydrogen"]', 12, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000003', 'Which organ produces insulin?', 'D', '["Liver", "Kidney", "Stomach", "Pancreas"]', 13, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000003', 'Avogadro''s number is approximately:', 'A', '["6.022 × 10²³", "3.14 × 10²³", "1.6 × 10⁻¹⁹", "9.8 × 10²³"]', 14, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000003', 'Which vitamin is produced when skin is exposed to sunlight?', 'C', '["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin K"]', 15, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000003', 'What is the molecular geometry of methane (CH₄)?', 'B', '["Linear", "Tetrahedral", "Trigonal planar", "Octahedral"]', 16, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000003', 'The largest organ in the human body is:', 'A', '["Skin", "Liver", "Brain", "Lungs"]', 17, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000003', 'Rust is chemically known as:', 'D', '["FeO", "Fe₂O₂", "FeCl₃", "Fe₂O₃"]', 18, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000003', 'Which nucleotide base is found in RNA but not DNA?', 'C', '["Adenine", "Cytosine", "Uracil", "Guanine"]', 19, 5, 'multiple_choice'),
('c0000001-0000-0000-0000-000000000003', 'What is the molar mass of CO₂?', 'B', '["28 g/mol", "44 g/mol", "32 g/mol", "18 g/mol"]', 20, 5, 'multiple_choice');
