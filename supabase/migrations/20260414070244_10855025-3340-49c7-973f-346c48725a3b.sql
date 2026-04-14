
-- 10 Library Items
INSERT INTO library_items (name, description, icon, item_count, status) VALUES
('Grade 12 Mathematics', 'Comprehensive math resources for grade 12 students', 'Calculator', 0, 'active'),
('Grade 12 Physics', 'Physics study materials and past exams', 'Atom', 0, 'active'),
('Grade 12 Chemistry', 'Chemistry notes, formulas and lab guides', 'FlaskConical', 0, 'active'),
('Grade 12 Biology', 'Biology study guides and diagrams', 'Leaf', 0, 'active'),
('Grade 11 Mathematics', 'Grade 11 math fundamentals and practice sets', 'Calculator', 0, 'active'),
('Grade 11 Physics', 'Grade 11 physics concepts and problem sets', 'Atom', 0, 'active'),
('Grade 10 Mathematics', 'Grade 10 math foundations and exercises', 'Calculator', 0, 'active'),
('Ethiopian University Entrance Exam', 'EUEE preparation materials and past papers', 'GraduationCap', 0, 'active'),
('English Language', 'English grammar, vocabulary and reading comprehension', 'BookOpen', 0, 'active'),
('Aptitude and Reasoning', 'Logical reasoning and aptitude test preparation', 'Brain', 0, 'active');

-- 3 Competitions
INSERT INTO competitions (title, description, date, time, duration, max_participants, registered_count, status, is_published, is_finished) VALUES
('National Mathematics Challenge 2026', 'Test your math skills against students nationwide. Covers algebra, geometry, calculus and number theory.', (CURRENT_DATE + INTERVAL '7 days')::date, '14:00', 60, 500, 0, 'upcoming', true, false),
('Physics Problem Solving Contest', 'A challenging physics competition covering mechanics, thermodynamics, optics and electromagnetism.', (CURRENT_DATE - INTERVAL '1 day')::date, '10:00', 45, 300, 187, 'completed', true, true),
('Chemistry Olympiad Qualifier', 'Qualify for the national chemistry olympiad. Covers organic, inorganic and physical chemistry.', (CURRENT_DATE - INTERVAL '1 day')::date, '15:30', 50, 400, 243, 'completed', true, true);

-- Questions for all 3 competitions
DO $$
DECLARE
  comp RECORD;
  q_idx INT;
BEGIN
  FOR comp IN SELECT id, title FROM competitions WHERE title IN (
    'National Mathematics Challenge 2026',
    'Physics Problem Solving Contest',
    'Chemistry Olympiad Qualifier'
  ) ORDER BY title
  LOOP
    IF comp.title LIKE '%Mathematics%' THEN
      FOR q_idx IN 1..20 LOOP
        INSERT INTO competition_questions (competition_id, question_text, question_type, correct_answer, options, order_index, points, explanation)
        VALUES (
          comp.id,
          CASE q_idx
            WHEN 1 THEN 'What is the derivative of f(x) = 3x² + 2x - 5?'
            WHEN 2 THEN 'Solve: 2x + 7 = 15'
            WHEN 3 THEN 'What is the value of log₁₀(1000)?'
            WHEN 4 THEN 'If sin(θ) = 0.5, what is θ in degrees (0° ≤ θ ≤ 90°)?'
            WHEN 5 THEN 'What is the sum of the first 10 natural numbers?'
            WHEN 6 THEN 'Simplify: (x² - 9) / (x - 3)'
            WHEN 7 THEN 'What is the area of a circle with radius 7 cm? (use π ≈ 22/7)'
            WHEN 8 THEN 'Find the determinant of the matrix [[2, 3], [1, 4]]'
            WHEN 9 THEN 'What is the integral of 2x dx?'
            WHEN 10 THEN 'How many ways can 5 books be arranged on a shelf?'
            WHEN 11 THEN 'What is the 10th term of the arithmetic sequence 3, 7, 11, 15, ...?'
            WHEN 12 THEN 'Solve the quadratic equation: x² - 5x + 6 = 0'
            WHEN 13 THEN 'What is the slope of the line 3x - 2y + 6 = 0?'
            WHEN 14 THEN 'Find the GCD of 48 and 36'
            WHEN 15 THEN 'What is 7! (7 factorial)?'
            WHEN 16 THEN 'If P(A) = 0.3 and P(B) = 0.5 and A,B are independent, what is P(A∩B)?'
            WHEN 17 THEN 'What is the distance between points (1, 2) and (4, 6)?'
            WHEN 18 THEN 'Simplify: √(75)'
            WHEN 19 THEN 'What is the median of 3, 7, 9, 12, 15?'
            WHEN 20 THEN 'Convert 45° to radians'
          END,
          'multiple_choice',
          CASE q_idx WHEN 1 THEN 'A' WHEN 2 THEN 'B' WHEN 3 THEN 'C' WHEN 4 THEN 'A' WHEN 5 THEN 'B' WHEN 6 THEN 'A' WHEN 7 THEN 'C' WHEN 8 THEN 'B' WHEN 9 THEN 'A' WHEN 10 THEN 'D' WHEN 11 THEN 'C' WHEN 12 THEN 'B' WHEN 13 THEN 'A' WHEN 14 THEN 'B' WHEN 15 THEN 'C' WHEN 16 THEN 'A' WHEN 17 THEN 'B' WHEN 18 THEN 'C' WHEN 19 THEN 'A' WHEN 20 THEN 'D' END,
          CASE q_idx
            WHEN 1 THEN '["6x + 2", "3x + 2", "6x - 5", "3x² + 2"]'::jsonb
            WHEN 2 THEN '["x = 3", "x = 4", "x = 5", "x = 8"]'::jsonb
            WHEN 3 THEN '["1", "2", "3", "10"]'::jsonb
            WHEN 4 THEN '["30°", "45°", "60°", "90°"]'::jsonb
            WHEN 5 THEN '["45", "55", "50", "60"]'::jsonb
            WHEN 6 THEN '["x + 3", "x - 3", "x² - 3", "x + 9"]'::jsonb
            WHEN 7 THEN '["44 cm²", "88 cm²", "154 cm²", "308 cm²"]'::jsonb
            WHEN 8 THEN '["3", "5", "7", "11"]'::jsonb
            WHEN 9 THEN '["x² + C", "x + C", "2x² + C", "x²"]'::jsonb
            WHEN 10 THEN '["25", "50", "100", "120"]'::jsonb
            WHEN 11 THEN '["35", "37", "39", "41"]'::jsonb
            WHEN 12 THEN '["x = 1, x = 6", "x = 2, x = 3", "x = -2, x = -3", "x = 5, x = 1"]'::jsonb
            WHEN 13 THEN '["3/2", "2/3", "-3/2", "-2/3"]'::jsonb
            WHEN 14 THEN '["6", "12", "18", "24"]'::jsonb
            WHEN 15 THEN '["720", "2520", "5040", "40320"]'::jsonb
            WHEN 16 THEN '["0.15", "0.8", "0.2", "0.35"]'::jsonb
            WHEN 17 THEN '["4", "5", "6", "7"]'::jsonb
            WHEN 18 THEN '["3√5", "5√5", "5√3", "25√3"]'::jsonb
            WHEN 19 THEN '["9", "7", "12", "10"]'::jsonb
            WHEN 20 THEN '["π/6", "π/3", "π/2", "π/4"]'::jsonb
          END,
          q_idx, 5,
          CASE q_idx
            WHEN 1 THEN 'Using the power rule: d/dx(3x²) = 6x, d/dx(2x) = 2, d/dx(-5) = 0'
            WHEN 2 THEN '2x + 7 = 15 → 2x = 8 → x = 4'
            WHEN 3 THEN 'log₁₀(1000) = log₁₀(10³) = 3'
            WHEN 4 THEN 'sin(30°) = 0.5'
            WHEN 5 THEN 'Sum = n(n+1)/2 = 10(11)/2 = 55'
            WHEN 6 THEN '(x²-9)/(x-3) = (x-3)(x+3)/(x-3) = x+3'
            WHEN 7 THEN 'Area = πr² = (22/7)(49) = 154 cm²'
            WHEN 8 THEN 'det = (2)(4) - (3)(1) = 8 - 3 = 5'
            WHEN 9 THEN '∫2x dx = x² + C'
            WHEN 10 THEN '5! = 5×4×3×2×1 = 120'
            WHEN 11 THEN 'a₁₀ = 3 + (10-1)×4 = 3 + 36 = 39'
            WHEN 12 THEN 'x² - 5x + 6 = (x-2)(x-3) = 0, so x = 2 or x = 3'
            WHEN 13 THEN '3x - 2y + 6 = 0 → y = (3/2)x + 3, slope = 3/2'
            WHEN 14 THEN 'GCD(48, 36) = 12'
            WHEN 15 THEN '7! = 7×6×5×4×3×2×1 = 5040'
            WHEN 16 THEN 'P(A∩B) = P(A)×P(B) = 0.3×0.5 = 0.15'
            WHEN 17 THEN 'd = √((4-1)²+(6-2)²) = √(9+16) = √25 = 5'
            WHEN 18 THEN '√75 = √(25×3) = 5√3'
            WHEN 19 THEN 'The middle value of sorted data is 9'
            WHEN 20 THEN '45° × π/180 = π/4'
          END
        );
      END LOOP;

    ELSIF comp.title LIKE '%Physics%' THEN
      FOR q_idx IN 1..20 LOOP
        INSERT INTO competition_questions (competition_id, question_text, question_type, correct_answer, options, order_index, points, explanation)
        VALUES (
          comp.id,
          CASE q_idx
            WHEN 1 THEN 'What is Newton''s second law of motion?'
            WHEN 2 THEN 'A car accelerates from 0 to 20 m/s in 5 seconds. What is the acceleration?'
            WHEN 3 THEN 'What is the SI unit of electric current?'
            WHEN 4 THEN 'A 5 kg object is lifted 10 m. What is the potential energy gained? (g=10 m/s²)'
            WHEN 5 THEN 'What is the speed of light in vacuum?'
            WHEN 6 THEN 'Which type of lens is used to correct myopia?'
            WHEN 7 THEN 'What is the frequency of a wave with wavelength 2m and speed 340 m/s?'
            WHEN 8 THEN 'What is Ohm''s law?'
            WHEN 9 THEN 'A ball is thrown upward at 30 m/s. What is the maximum height? (g=10 m/s²)'
            WHEN 10 THEN 'What is the unit of power?'
            WHEN 11 THEN 'Which mirror is used in car headlights?'
            WHEN 12 THEN 'What is the kinetic energy of a 2 kg object moving at 3 m/s?'
            WHEN 13 THEN 'What is the principle behind hydraulic machines?'
            WHEN 14 THEN 'What happens to resistance when temperature increases in a conductor?'
            WHEN 15 THEN 'What is the angle of incidence equal to?'
            WHEN 16 THEN 'A 1500 W heater runs for 2 hours. How much energy in kWh?'
            WHEN 17 THEN 'What is the escape velocity from Earth?'
            WHEN 18 THEN 'Which electromagnetic wave has the shortest wavelength?'
            WHEN 19 THEN 'What is the work done when a force of 10 N moves an object 5 m?'
            WHEN 20 THEN 'What is the principle of conservation of momentum?'
          END,
          'multiple_choice',
          CASE q_idx WHEN 1 THEN 'B' WHEN 2 THEN 'A' WHEN 3 THEN 'C' WHEN 4 THEN 'B' WHEN 5 THEN 'D' WHEN 6 THEN 'A' WHEN 7 THEN 'B' WHEN 8 THEN 'C' WHEN 9 THEN 'A' WHEN 10 THEN 'B' WHEN 11 THEN 'C' WHEN 12 THEN 'A' WHEN 13 THEN 'B' WHEN 14 THEN 'A' WHEN 15 THEN 'C' WHEN 16 THEN 'B' WHEN 17 THEN 'D' WHEN 18 THEN 'A' WHEN 19 THEN 'C' WHEN 20 THEN 'B' END,
          CASE q_idx
            WHEN 1 THEN '["F = ma²", "F = ma", "F = mv", "F = m/a"]'::jsonb
            WHEN 2 THEN '["4 m/s²", "5 m/s²", "2 m/s²", "10 m/s²"]'::jsonb
            WHEN 3 THEN '["Volt", "Ohm", "Ampere", "Watt"]'::jsonb
            WHEN 4 THEN '["250 J", "500 J", "100 J", "1000 J"]'::jsonb
            WHEN 5 THEN '["3×10⁶ m/s", "3×10⁷ m/s", "3×10⁹ m/s", "3×10⁸ m/s"]'::jsonb
            WHEN 6 THEN '["Concave lens", "Convex lens", "Plano-convex", "Bifocal"]'::jsonb
            WHEN 7 THEN '["680 Hz", "170 Hz", "340 Hz", "85 Hz"]'::jsonb
            WHEN 8 THEN '["V = I/R", "V = IR²", "V = IR", "V = R/I"]'::jsonb
            WHEN 9 THEN '["45 m", "30 m", "90 m", "60 m"]'::jsonb
            WHEN 10 THEN '["Joule", "Watt", "Newton", "Pascal"]'::jsonb
            WHEN 11 THEN '["Plane mirror", "Convex mirror", "Concave mirror", "Cylindrical mirror"]'::jsonb
            WHEN 12 THEN '["9 J", "6 J", "12 J", "18 J"]'::jsonb
            WHEN 13 THEN '["Archimedes'' principle", "Pascal''s law", "Bernoulli''s principle", "Boyle''s law"]'::jsonb
            WHEN 14 THEN '["Increases", "Decreases", "Stays same", "Becomes zero"]'::jsonb
            WHEN 15 THEN '["Angle of refraction", "Critical angle", "Angle of reflection", "Brewster''s angle"]'::jsonb
            WHEN 16 THEN '["1.5 kWh", "3 kWh", "2 kWh", "4.5 kWh"]'::jsonb
            WHEN 17 THEN '["7.9 km/s", "9.8 km/s", "10.2 km/s", "11.2 km/s"]'::jsonb
            WHEN 18 THEN '["Gamma rays", "X-rays", "Ultraviolet", "Radio waves"]'::jsonb
            WHEN 19 THEN '["15 J", "2 J", "50 J", "100 J"]'::jsonb
            WHEN 20 THEN '["Energy is conserved", "Total momentum before = total momentum after collision", "Force equals mass times acceleration", "Action and reaction are equal"]'::jsonb
          END,
          q_idx, 5,
          CASE q_idx
            WHEN 1 THEN 'Newton''s second law: Force = mass × acceleration'
            WHEN 2 THEN 'a = Δv/t = 20/5 = 4 m/s²'
            WHEN 3 THEN 'The SI unit of electric current is the Ampere (A)'
            WHEN 4 THEN 'PE = mgh = 5 × 10 × 10 = 500 J'
            WHEN 5 THEN 'Speed of light = 3 × 10⁸ m/s'
            WHEN 6 THEN 'Concave (diverging) lens corrects myopia'
            WHEN 7 THEN 'f = v/λ = 340/2 = 170 Hz'
            WHEN 8 THEN 'Ohm''s law: V = IR'
            WHEN 9 THEN 'h = v²/(2g) = 900/20 = 45 m'
            WHEN 10 THEN 'Power is measured in Watts (W)'
            WHEN 11 THEN 'Concave mirrors focus light into a beam'
            WHEN 12 THEN 'KE = ½mv² = ½(2)(9) = 9 J'
            WHEN 13 THEN 'Pascal''s law: pressure applied to a confined fluid is transmitted equally'
            WHEN 14 THEN 'In conductors, resistance increases with temperature'
            WHEN 15 THEN 'Law of reflection: angle of incidence = angle of reflection'
            WHEN 16 THEN '1.5 kW × 2 h = 3 kWh'
            WHEN 17 THEN 'Earth''s escape velocity is approximately 11.2 km/s'
            WHEN 18 THEN 'Gamma rays have the shortest wavelength'
            WHEN 19 THEN 'W = F × d = 10 × 5 = 50 J'
            WHEN 20 THEN 'In a closed system, total momentum is conserved'
          END
        );
      END LOOP;

    ELSIF comp.title LIKE '%Chemistry%' THEN
      FOR q_idx IN 1..20 LOOP
        INSERT INTO competition_questions (competition_id, question_text, question_type, correct_answer, options, order_index, points, explanation)
        VALUES (
          comp.id,
          CASE q_idx
            WHEN 1 THEN 'What is the atomic number of Carbon?'
            WHEN 2 THEN 'What type of bond is formed between Na and Cl?'
            WHEN 3 THEN 'What is the pH of pure water at 25°C?'
            WHEN 4 THEN 'Which gas is released when an acid reacts with a metal?'
            WHEN 5 THEN 'What is Avogadro''s number?'
            WHEN 6 THEN 'What is the molecular formula of glucose?'
            WHEN 7 THEN 'Which element has the highest electronegativity?'
            WHEN 8 THEN 'What is the oxidation state of Oxygen in most compounds?'
            WHEN 9 THEN 'How many moles are in 44g of CO₂?'
            WHEN 10 THEN 'What is the IUPAC name of CH₃COOH?'
            WHEN 11 THEN 'Which subatomic particle determines chemical properties?'
            WHEN 12 THEN 'What is the common name of NaOH?'
            WHEN 13 THEN 'How many electrons can the second energy level hold?'
            WHEN 14 THEN 'What type of reaction is: 2H₂ + O₂ → 2H₂O?'
            WHEN 15 THEN 'What is the molar mass of NaCl?'
            WHEN 16 THEN 'Which gas is produced during photosynthesis?'
            WHEN 17 THEN 'What is the hybridization of carbon in methane (CH₄)?'
            WHEN 18 THEN 'What is Le Chatelier''s principle about?'
            WHEN 19 THEN 'Which indicator turns pink in a basic solution?'
            WHEN 20 THEN 'What is the electron configuration of Neon (Z=10)?'
          END,
          'multiple_choice',
          CASE q_idx WHEN 1 THEN 'B' WHEN 2 THEN 'A' WHEN 3 THEN 'C' WHEN 4 THEN 'B' WHEN 5 THEN 'D' WHEN 6 THEN 'A' WHEN 7 THEN 'C' WHEN 8 THEN 'B' WHEN 9 THEN 'A' WHEN 10 THEN 'B' WHEN 11 THEN 'C' WHEN 12 THEN 'A' WHEN 13 THEN 'B' WHEN 14 THEN 'A' WHEN 15 THEN 'C' WHEN 16 THEN 'B' WHEN 17 THEN 'D' WHEN 18 THEN 'A' WHEN 19 THEN 'C' WHEN 20 THEN 'B' END,
          CASE q_idx
            WHEN 1 THEN '["4", "6", "8", "12"]'::jsonb
            WHEN 2 THEN '["Ionic bond", "Covalent bond", "Metallic bond", "Hydrogen bond"]'::jsonb
            WHEN 3 THEN '["1", "5", "7", "14"]'::jsonb
            WHEN 4 THEN '["Oxygen", "Hydrogen", "Nitrogen", "Carbon dioxide"]'::jsonb
            WHEN 5 THEN '["6.022×10²⁰", "6.022×10²¹", "6.022×10²²", "6.022×10²³"]'::jsonb
            WHEN 6 THEN '["C₆H₁₂O₆", "C₆H₆", "C₂H₅OH", "CH₃COOH"]'::jsonb
            WHEN 7 THEN '["Oxygen", "Chlorine", "Fluorine", "Nitrogen"]'::jsonb
            WHEN 8 THEN '["−1", "−2", "+2", "0"]'::jsonb
            WHEN 9 THEN '["1 mol", "2 mol", "0.5 mol", "44 mol"]'::jsonb
            WHEN 10 THEN '["Methanoic acid", "Ethanoic acid", "Propanoic acid", "Butanoic acid"]'::jsonb
            WHEN 11 THEN '["Proton", "Neutron", "Electron", "Photon"]'::jsonb
            WHEN 12 THEN '["Caustic soda", "Baking soda", "Washing soda", "Lime water"]'::jsonb
            WHEN 13 THEN '["2", "8", "18", "32"]'::jsonb
            WHEN 14 THEN '["Combination", "Decomposition", "Displacement", "Double displacement"]'::jsonb
            WHEN 15 THEN '["40 g/mol", "52 g/mol", "58.5 g/mol", "74 g/mol"]'::jsonb
            WHEN 16 THEN '["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"]'::jsonb
            WHEN 17 THEN '["sp", "sp²", "sp³d", "sp³"]'::jsonb
            WHEN 18 THEN '["Equilibrium shifts to counteract change", "Energy is conserved", "Matter cannot be created", "Electrons orbit the nucleus"]'::jsonb
            WHEN 19 THEN '["Methyl orange", "Litmus", "Phenolphthalein", "Universal indicator"]'::jsonb
            WHEN 20 THEN '["1s² 2s² 2p⁴", "1s² 2s² 2p⁶", "1s² 2s² 2p⁶ 3s²", "1s² 2s² 2p³"]'::jsonb
          END,
          q_idx, 5,
          CASE q_idx
            WHEN 1 THEN 'Carbon has 6 protons, so atomic number = 6'
            WHEN 2 THEN 'Na transfers electron to Cl forming ionic bond'
            WHEN 3 THEN 'Pure water is neutral with pH = 7'
            WHEN 4 THEN 'Acid + Metal → Salt + Hydrogen gas'
            WHEN 5 THEN 'Avogadro''s number = 6.022 × 10²³'
            WHEN 6 THEN 'Glucose molecular formula is C₆H₁₂O₆'
            WHEN 7 THEN 'Fluorine has the highest electronegativity (3.98)'
            WHEN 8 THEN 'Oxygen typically has −2 oxidation state'
            WHEN 9 THEN 'Molar mass of CO₂ = 44 g/mol, so 44g = 1 mol'
            WHEN 10 THEN 'CH₃COOH is ethanoic acid (acetic acid)'
            WHEN 11 THEN 'Electrons determine chemical bonding and properties'
            WHEN 12 THEN 'NaOH is commonly known as caustic soda'
            WHEN 13 THEN 'Second shell holds max 8 electrons (2n² = 8)'
            WHEN 14 THEN 'Two reactants combine to form one product = combination'
            WHEN 15 THEN 'NaCl: Na=23 + Cl=35.5 = 58.5 g/mol'
            WHEN 16 THEN 'Photosynthesis produces oxygen'
            WHEN 17 THEN 'Carbon in CH₄ has sp³ hybridization'
            WHEN 18 THEN 'Le Chatelier: system shifts to oppose applied changes'
            WHEN 19 THEN 'Phenolphthalein turns pink in basic solutions'
            WHEN 20 THEN 'Ne: 1s² 2s² 2p⁶ (noble gas)'
          END
        );
      END LOOP;
    END IF;
  END LOOP;
END $$;
