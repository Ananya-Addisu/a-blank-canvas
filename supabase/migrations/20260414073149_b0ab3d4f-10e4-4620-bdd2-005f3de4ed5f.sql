
-- Insert 10 library content items with valid content_types
INSERT INTO public.library_content (id, title, description, content_type, subject, author, page_count, category_id, thumbnail_url, approval_status) VALUES
('b0000001-0000-0000-0000-000000000001', 'Calculus Fundamentals: Limits & Derivatives', 'Comprehensive notes covering limits, continuity, and differentiation with worked examples.', 'book', 'Mathematics', 'Ato Dawit Mekonnen', 42, 'a0000001-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80', 'approved'),
('b0000001-0000-0000-0000-000000000002', 'Integral Calculus Practice Problems', 'Over 100 integration problems with step-by-step solutions for Grade 12 students.', 'book', 'Mathematics', 'W/ro Hanna Tadesse', 35, 'a0000001-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&q=80', 'approved'),
('b0000001-0000-0000-0000-000000000003', 'Electromagnetism Complete Guide', 'Electric fields, magnetic fields, and electromagnetic induction explained clearly.', 'book', 'Physics', 'Ato Yohannes Girma', 58, 'a0000001-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80', 'approved'),
('b0000001-0000-0000-0000-000000000004', 'Organic Chemistry Reaction Mechanisms', 'All major organic reaction types with mechanisms, examples, and practice questions.', 'book', 'Chemistry', 'W/ro Sara Bekele', 48, 'a0000001-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&q=80', 'approved'),
('b0000001-0000-0000-0000-000000000005', 'Human Anatomy & Physiology Notes', 'Detailed notes on all human body systems with diagrams and labeling exercises.', 'book', 'Biology', 'Ato Bereket Alemu', 64, 'a0000001-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&q=80', 'approved'),
('b0000001-0000-0000-0000-000000000006', 'EUEE 2024 Mathematics Past Paper', 'Complete 2024 Ethiopian University Entrance Exam mathematics paper with detailed solutions.', 'exam', 'Mathematics', 'Ministry of Education', 24, 'a0000001-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80', 'approved'),
('b0000001-0000-0000-0000-000000000007', 'EUEE 2023 Physics Past Paper', 'Previous year physics entrance exam with answer key and explanations.', 'exam', 'Physics', 'Ministry of Education', 20, 'a0000001-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400&q=80', 'approved'),
('b0000001-0000-0000-0000-000000000008', 'Grade 11 Trigonometry & Pre-Calculus', 'Trigonometric identities, equations, and pre-calculus concepts for Grade 11.', 'book', 'Mathematics', 'Ato Mulugeta Desta', 38, 'a0000001-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=400&q=80', 'approved'),
('b0000001-0000-0000-0000-000000000009', 'Ethiopian History: From Axum to Modern Era', 'Comprehensive Ethiopian history covering ancient kingdoms through contemporary politics.', 'book', 'History', 'Ato Tesfaye Worku', 72, 'a0000001-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&q=80', 'approved'),
('b0000001-0000-0000-0000-000000000010', 'EUEE 2024 Biology Past Paper', 'Complete biology entrance exam with solutions covering genetics, ecology and anatomy.', 'exam', 'Biology', 'Ministry of Education', 18, 'a0000001-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&q=80', 'approved');

-- Delete existing competitions and related data
DELETE FROM competition_questions WHERE competition_id IN (SELECT id FROM competitions);
DELETE FROM student_competitions WHERE competition_id IN (SELECT id FROM competitions);
DELETE FROM competition_participants WHERE competition_id IN (SELECT id FROM competitions);
DELETE FROM competitions;

-- Insert 3 competitions (1 upcoming, 2 past)
INSERT INTO public.competitions (id, title, description, date, time, duration, max_participants, status, is_published, is_finished) VALUES
('c0000001-0000-0000-0000-000000000001', 'National Mathematics Olympiad 2026', 'Test your mathematics skills against the best students nationwide. Covers calculus, algebra, geometry, and number theory.', '2026-04-20', '10:00', 60, 500, 'upcoming', true, false),
('c0000001-0000-0000-0000-000000000002', 'Physics Challenge: Mechanics & Thermodynamics', 'A comprehensive physics competition covering Newtonian mechanics, energy, and thermodynamics.', '2026-04-13', '14:00', 45, 300, 'completed', true, true),
('c0000001-0000-0000-0000-000000000003', 'Biology & Life Sciences Quiz', 'Test your knowledge of genetics, ecology, human anatomy, and cell biology.', '2026-04-13', '09:00', 40, 400, 'completed', true, true);

-- Competition 1: Math Olympiad (20 questions)
INSERT INTO public.competition_questions (competition_id, question_text, question_type, options, correct_answer, explanation, order_index, points) VALUES
('c0000001-0000-0000-0000-000000000001', 'What is the derivative of f(x) = x³ + 2x² - 5x + 3?', 'multiple_choice', '["3x² + 4x - 5", "3x² + 2x - 5", "x² + 4x - 5", "3x³ + 4x - 5"]', '3x² + 4x - 5', 'Apply the power rule to each term.', 1, 5),
('c0000001-0000-0000-0000-000000000001', 'What is the value of lim(x→0) sin(x)/x?', 'multiple_choice', '["0", "1", "∞", "undefined"]', '1', 'Fundamental limit in calculus.', 2, 5),
('c0000001-0000-0000-0000-000000000001', 'If log₂(x) = 5, what is x?', 'multiple_choice', '["10", "25", "32", "64"]', '32', '2⁵ = 32.', 3, 5),
('c0000001-0000-0000-0000-000000000001', 'Sum of first 20 terms of 3, 7, 11, 15, ...?', 'multiple_choice', '["820", "840", "860", "880"]', '820', 'S = n/2 × (2a₁ + (n-1)d) = 820.', 4, 5),
('c0000001-0000-0000-0000-000000000001', 'Determinant of [[2,3],[1,4]]?', 'multiple_choice', '["5", "8", "11", "6"]', '5', '(2)(4)-(3)(1)=5.', 5, 5),
('c0000001-0000-0000-0000-000000000001', 'The integral of 1/x dx is:', 'multiple_choice', '["x²", "ln|x| + C", "1/x² + C", "eˣ + C"]', 'ln|x| + C', 'Antiderivative of 1/x.', 6, 5),
('c0000001-0000-0000-0000-000000000001', 'Right triangle legs 5 and 12, hypotenuse?', 'multiple_choice', '["13", "14", "15", "17"]', '13', '√(25+144)=13.', 7, 5),
('c0000001-0000-0000-0000-000000000001', 'Value of i²?', 'multiple_choice', '["1", "-1", "i", "-i"]', '-1', 'i=√(-1), so i²=-1.', 8, 5),
('c0000001-0000-0000-0000-000000000001', 'How many ways to arrange 5 books?', 'multiple_choice', '["25", "60", "120", "720"]', '120', '5!=120.', 9, 5),
('c0000001-0000-0000-0000-000000000001', 'Probability of sum 7 with two dice?', 'multiple_choice', '["1/6", "5/36", "6/36", "7/36"]', '6/36', '6 favorable out of 36.', 10, 5),
('c0000001-0000-0000-0000-000000000001', 'Quadratic formula?', 'multiple_choice', '["x = -b ± √(b²-4ac) / 2a", "x = b ± √(b²-4ac) / 2a", "x = -b ± √(b²+4ac) / 2a", "x = -b ± √(4ac-b²) / 2a"]', 'x = -b ± √(b²-4ac) / 2a', 'Solves ax²+bx+c=0.', 11, 5),
('c0000001-0000-0000-0000-000000000001', 'Area of circle radius 7?', 'multiple_choice', '["44π", "49π", "14π", "21π"]', '49π', 'πr²=49π.', 12, 5),
('c0000001-0000-0000-0000-000000000001', 'Derivative of eˣ?', 'multiple_choice', '["eˣ", "xeˣ⁻¹", "ln(x)", "1/x"]', 'eˣ', 'eˣ differentiates to itself.', 13, 5),
('c0000001-0000-0000-0000-000000000001', 'GCD of 48 and 36?', 'multiple_choice', '["6", "12", "18", "4"]', '12', 'GCD=12.', 14, 5),
('c0000001-0000-0000-0000-000000000001', 'Solution of |x-3| < 5?', 'multiple_choice', '["(-2, 8)", "(-8, 2)", "(2, 8)", "(-2, -8)"]', '(-2, 8)', '-2 < x < 8.', 15, 5),
('c0000001-0000-0000-0000-000000000001', 'sin(π/6)?', 'multiple_choice', '["1/2", "√3/2", "√2/2", "1"]', '1/2', 'sin(30°)=1/2.', 16, 5),
('c0000001-0000-0000-0000-000000000001', 'Geometric mean of 4 and 16?', 'multiple_choice', '["8", "10", "12", "6"]', '8', '√(64)=8.', 17, 5),
('c0000001-0000-0000-0000-000000000001', 'Slope perpendicular to y=2x+1?', 'multiple_choice', '["2", "-2", "-1/2", "1/2"]', '-1/2', 'Negative reciprocal.', 18, 5),
('c0000001-0000-0000-0000-000000000001', 'Domain of f(x)=√(x-4)?', 'multiple_choice', '["x ≥ 4", "x > 4", "x ≤ 4", "all real numbers"]', 'x ≥ 4', 'x-4≥0.', 19, 5),
('c0000001-0000-0000-0000-000000000001', 'Σ(k=1 to 10) k?', 'multiple_choice', '["45", "50", "55", "100"]', '55', 'n(n+1)/2=55.', 20, 5);

-- Competition 2: Physics (20 questions)
INSERT INTO public.competition_questions (competition_id, question_text, question_type, options, correct_answer, explanation, order_index, points) VALUES
('c0000001-0000-0000-0000-000000000002', 'Newton''s second law?', 'multiple_choice', '["F = ma", "F = mv", "F = m/a", "F = a/m"]', 'F = ma', 'Force equals mass times acceleration.', 1, 5),
('c0000001-0000-0000-0000-000000000002', 'SI unit of work?', 'multiple_choice', '["Watt", "Joule", "Newton", "Pascal"]', 'Joule', 'J = N·m.', 2, 5),
('c0000001-0000-0000-0000-000000000002', '5 kg dropped, velocity after 3s? (g=10)', 'multiple_choice', '["15 m/s", "30 m/s", "45 m/s", "50 m/s"]', '30 m/s', 'v=gt=30.', 3, 5),
('c0000001-0000-0000-0000-000000000002', 'First law of thermodynamics?', 'multiple_choice', '["Energy cannot be created or destroyed", "Entropy always increases", "Heat flows hot to cold", "PV = nRT"]', 'Energy cannot be created or destroyed', 'Conservation of energy.', 4, 5),
('c0000001-0000-0000-0000-000000000002', 'Energy of compressed spring?', 'multiple_choice', '["Kinetic", "Elastic potential", "Gravitational PE", "Thermal"]', 'Elastic potential', '½kx².', 5, 5),
('c0000001-0000-0000-0000-000000000002', 'Acceleration due to gravity?', 'multiple_choice', '["8.9 m/s²", "9.8 m/s²", "10.8 m/s²", "11.2 m/s²"]', '9.8 m/s²', 'Standard value.', 6, 5),
('c0000001-0000-0000-0000-000000000002', 'Entropy in isolated system?', 'multiple_choice', '["Isothermal", "Adiabatic", "Any natural process", "Isobaric"]', 'Any natural process', 'Second law of thermodynamics.', 7, 5),
('c0000001-0000-0000-0000-000000000002', 'Momentum of 10kg at 5m/s?', 'multiple_choice', '["2 kg·m/s", "15 kg·m/s", "50 kg·m/s", "500 kg·m/s"]', '50 kg·m/s', 'p=mv=50.', 8, 5),
('c0000001-0000-0000-0000-000000000002', 'Pendulum length quadrupled, period?', 'multiple_choice', '["Doubles", "Quadruples", "Halves", "Same"]', 'Doubles', 'T∝√L.', 9, 5),
('c0000001-0000-0000-0000-000000000002', 'Carnot efficiency 600K/300K?', 'multiple_choice', '["25%", "50%", "75%", "100%"]', '50%', '1-300/600=0.5.', 10, 5),
('c0000001-0000-0000-0000-000000000002', 'Conserved in all collisions?', 'multiple_choice', '["Kinetic energy", "Momentum", "Velocity", "Force"]', 'Momentum', 'Always conserved.', 11, 5),
('c0000001-0000-0000-0000-000000000002', 'Unit of pressure?', 'multiple_choice', '["Newton", "Pascal", "Joule", "Hertz"]', 'Pascal', 'Pa=N/m².', 12, 5),
('c0000001-0000-0000-0000-000000000002', '20N on 4kg, acceleration?', 'multiple_choice', '["4 m/s²", "5 m/s²", "8 m/s²", "80 m/s²"]', '5 m/s²', 'a=F/m=5.', 13, 5),
('c0000001-0000-0000-0000-000000000002', 'Specific heat of water?', 'multiple_choice', '["2100 J/kg·K", "4200 J/kg·K", "1000 J/kg·K", "3000 J/kg·K"]', '4200 J/kg·K', 'Approximately 4200.', 14, 5),
('c0000001-0000-0000-0000-000000000002', 'KE of 2kg at 6m/s?', 'multiple_choice', '["12 J", "24 J", "36 J", "72 J"]', '36 J', '½mv²=36.', 15, 5),
('c0000001-0000-0000-0000-000000000002', 'Adiabatic means?', 'multiple_choice', '["No heat exchange", "Constant temp", "Constant pressure", "Constant volume"]', 'No heat exchange', 'No Q transfer.', 16, 5),
('c0000001-0000-0000-0000-000000000002', 'GPE of 3kg at 10m? (g=10)', 'multiple_choice', '["30 J", "100 J", "300 J", "3000 J"]', '300 J', 'mgh=300.', 17, 5),
('c0000001-0000-0000-0000-000000000002', 'Pushed back in accelerating car?', 'multiple_choice', '["First law", "Second law", "Third law", "Gravitation"]', 'First law', 'Inertia.', 18, 5),
('c0000001-0000-0000-0000-000000000002', 'Ideal gas law?', 'multiple_choice', '["PV = nRT", "PV = mRT", "PT = nRV", "P = nRTV"]', 'PV = nRT', 'Relates P,V,n,T.', 19, 5),
('c0000001-0000-0000-0000-000000000002', '3N and 4N at right angles, resultant?', 'multiple_choice', '["5 N", "7 N", "1 N", "12 N"]', '5 N', '√(9+16)=5.', 20, 5);

-- Competition 3: Biology (20 questions)
INSERT INTO public.competition_questions (competition_id, question_text, question_type, options, correct_answer, explanation, order_index, points) VALUES
('c0000001-0000-0000-0000-000000000003', 'Powerhouse of the cell?', 'multiple_choice', '["Nucleus", "Mitochondria", "Ribosome", "Golgi"]', 'Mitochondria', 'Produces ATP.', 1, 5),
('c0000001-0000-0000-0000-000000000003', 'Molecule carrying genetic info?', 'multiple_choice', '["RNA", "DNA", "Protein", "ATP"]', 'DNA', 'Stores genetic information.', 2, 5),
('c0000001-0000-0000-0000-000000000003', 'How plants make food?', 'multiple_choice', '["Respiration", "Photosynthesis", "Fermentation", "Transpiration"]', 'Photosynthesis', 'CO₂+H₂O→glucose.', 3, 5),
('c0000001-0000-0000-0000-000000000003', 'Human chromosomes count?', 'multiple_choice', '["23", "44", "46", "48"]', '46', '23 pairs.', 4, 5),
('c0000001-0000-0000-0000-000000000003', 'Bond between DNA strands?', 'multiple_choice', '["Covalent", "Ionic", "Hydrogen", "Peptide"]', 'Hydrogen', 'Between base pairs.', 5, 5),
('c0000001-0000-0000-0000-000000000003', 'Universal blood donor?', 'multiple_choice', '["A", "B", "AB", "O"]', 'O', 'No antigens.', 6, 5),
('c0000001-0000-0000-0000-000000000003', 'Largest human organ?', 'multiple_choice', '["Liver", "Brain", "Skin", "Lungs"]', 'Skin', '~2m² coverage.', 7, 5),
('c0000001-0000-0000-0000-000000000003', 'White blood cell function?', 'multiple_choice', '["Carry oxygen", "Fight infection", "Clot blood", "Transport nutrients"]', 'Fight infection', 'Immune defense.', 8, 5),
('c0000001-0000-0000-0000-000000000003', 'Heterozygous genotype?', 'multiple_choice', '["AA", "Aa", "aa", "AB"]', 'Aa', 'Two different alleles.', 9, 5),
('c0000001-0000-0000-0000-000000000003', 'Protein synthesis organelle?', 'multiple_choice', '["Lysosome", "Ribosome", "Vacuole", "Nucleus"]', 'Ribosome', 'Translates mRNA.', 10, 5),
('c0000001-0000-0000-0000-000000000003', 'Basic unit of life?', 'multiple_choice', '["Atom", "Molecule", "Cell", "Organ"]', 'Cell', 'Fundamental unit.', 11, 5),
('c0000001-0000-0000-0000-000000000003', 'Natural selection?', 'multiple_choice', '["Random mutation", "Survival of fittest", "Gene drift", "Artificial breeding"]', 'Survival of fittest', 'Favorable traits survive.', 12, 5),
('c0000001-0000-0000-0000-000000000003', 'Hemoglobin role?', 'multiple_choice', '["Digest food", "Transport oxygen", "Filter blood", "Produce hormones"]', 'Transport oxygen', 'Binds O₂ in RBCs.', 13, 5),
('c0000001-0000-0000-0000-000000000003', 'Brain part for balance?', 'multiple_choice', '["Cerebrum", "Cerebellum", "Medulla", "Hypothalamus"]', 'Cerebellum', 'Coordinates movement.', 14, 5),
('c0000001-0000-0000-0000-000000000003', 'What is osmosis?', 'multiple_choice', '["Solute movement", "Water across membrane", "Active transport", "Gas diffusion"]', 'Water across membrane', 'Passive water movement.', 15, 5),
('c0000001-0000-0000-0000-000000000003', 'Krebs cycle also called?', 'multiple_choice', '["Glycolysis", "Citric acid cycle", "Calvin cycle", "Electron transport"]', 'Citric acid cycle', 'Stage of respiration.', 16, 5),
('c0000001-0000-0000-0000-000000000003', 'Sunlight produces which vitamin?', 'multiple_choice', '["A", "C", "D", "K"]', 'D', 'UV triggers synthesis.', 17, 5),
('c0000001-0000-0000-0000-000000000003', 'Nephron function?', 'multiple_choice', '["Gas exchange", "Blood filtration", "Nerve impulse", "Hormone secretion"]', 'Blood filtration', 'Kidney functional unit.', 18, 5),
('c0000001-0000-0000-0000-000000000003', 'What is a food chain?', 'multiple_choice', '["Food types", "Energy transfer between organisms", "Food processing", "Nutrient cycle"]', 'Energy transfer between organisms', 'Linear energy flow.', 19, 5),
('c0000001-0000-0000-0000-000000000003', 'Plant cell structure not in animal cells?', 'multiple_choice', '["Nucleus", "Cell wall", "Mitochondria", "Ribosome"]', 'Cell wall', 'Cellulose wall.', 20, 5);
