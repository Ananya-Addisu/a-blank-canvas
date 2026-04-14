export interface LibraryMarkdownItem {
  id: string;
  title: string;
  subject: string;
  author: string;
  description: string;
  contentType: 'book' | 'exam' | 'reference';
  markdown: string;
}

export const libraryMarkdownItems: LibraryMarkdownItem[] = [
  {
    id: 'md-calc-1',
    title: 'Calculus I: Limits & Continuity',
    subject: 'Mathematics',
    author: 'Dr. Abebe Tadesse',
    description: 'Foundational concepts of limits, continuity, and the epsilon-delta definition.',
    contentType: 'book',
    markdown: `# Calculus I: Limits & Continuity

## 1. Introduction to Limits

A **limit** describes the value that a function approaches as the input approaches some value.

$$\\lim_{x \\to a} f(x) = L$$

This means that as $x$ gets closer to $a$, $f(x)$ gets closer to $L$.

### 1.1 Intuitive Understanding

Consider the function:

$$f(x) = \\frac{x^2 - 1}{x - 1}$$

At $x = 1$, this function is undefined (division by zero). However:

$$f(x) = \\frac{(x-1)(x+1)}{x-1} = x + 1 \\quad (x \\neq 1)$$

So $\\lim_{x \\to 1} f(x) = 2$

### 1.2 One-Sided Limits

- **Left-hand limit**: $\\lim_{x \\to a^-} f(x)$ — approaching from the left
- **Right-hand limit**: $\\lim_{x \\to a^+} f(x)$ — approaching from the right

> **Theorem**: $\\lim_{x \\to a} f(x) = L$ exists if and only if both one-sided limits exist and are equal.

## 2. Limit Laws

| Law | Formula |
|-----|---------|
| Sum | $\\lim [f(x) + g(x)] = L + M$ |
| Product | $\\lim [f(x) \\cdot g(x)] = L \\cdot M$ |
| Quotient | $\\lim \\frac{f(x)}{g(x)} = \\frac{L}{M}$, $M \\neq 0$ |
| Power | $\\lim [f(x)]^n = L^n$ |

## 3. Continuity

A function $f$ is **continuous** at $x = a$ if:

1. $f(a)$ is defined
2. $\\lim_{x \\to a} f(x)$ exists
3. $\\lim_{x \\to a} f(x) = f(a)$

### Types of Discontinuity

- **Removable**: The limit exists but $f(a)$ is not defined or $f(a) \\neq \\lim f(x)$
- **Jump**: Left and right limits exist but are not equal
- **Infinite**: The function approaches $\\pm\\infty$

## 4. Practice Problems

1. Evaluate $\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}$
2. Find $\\lim_{x \\to 0} \\frac{\\sin x}{x}$
3. Determine if $f(x) = |x|/x$ is continuous at $x = 0$

---

*Chapter review complete. Proceed to Derivatives.*
`
  },
  {
    id: 'md-physics-1',
    title: 'Classical Mechanics: Newton\'s Laws',
    subject: 'Physics',
    author: 'Prof. Kebede Alemu',
    description: 'Core principles of Newtonian mechanics including force, mass, and acceleration.',
    contentType: 'book',
    markdown: `# Classical Mechanics: Newton's Laws

## 1. Newton's First Law — Law of Inertia

> An object at rest stays at rest, and an object in motion stays in motion with the same speed and in the same direction, unless acted upon by an unbalanced force.

**Key concept**: Inertia is the resistance of an object to changes in its state of motion.

$$\\sum \\vec{F} = 0 \\implies \\vec{v} = \\text{constant}$$

## 2. Newton's Second Law

The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.

$$\\vec{F} = m\\vec{a}$$

Where:
- $\\vec{F}$ = net force (Newtons, N)
- $m$ = mass (kilograms, kg)
- $\\vec{a}$ = acceleration (m/s²)

### Example Problem

A 5 kg block is pushed with a force of 20 N on a frictionless surface.

$$a = \\frac{F}{m} = \\frac{20}{5} = 4 \\text{ m/s}^2$$

## 3. Newton's Third Law

> For every action, there is an equal and opposite reaction.

$$\\vec{F}_{AB} = -\\vec{F}_{BA}$$

### Applications

| Scenario | Action Force | Reaction Force |
|----------|-------------|----------------|
| Walking | Foot pushes ground backward | Ground pushes foot forward |
| Rocket | Engine expels gas downward | Gas pushes rocket upward |
| Swimming | Hand pushes water backward | Water pushes swimmer forward |

## 4. Free Body Diagrams

Steps to draw a free body diagram:
1. Identify the object of interest
2. Draw the object as a point
3. Draw all forces acting **on** the object
4. Label each force with magnitude and direction

## 5. Friction

$$f_s \\leq \\mu_s N \\quad \\text{(static)}$$
$$f_k = \\mu_k N \\quad \\text{(kinetic)}$$

Where $N$ is the normal force and $\\mu$ is the coefficient of friction.

---

*Continue to Work, Energy, and Power →*
`
  },
  {
    id: 'md-chem-1',
    title: 'Organic Chemistry: Functional Groups',
    subject: 'Chemistry',
    author: 'Dr. Sara Mohammed',
    description: 'Identification and properties of key organic functional groups.',
    contentType: 'book',
    markdown: `# Organic Chemistry: Functional Groups

## 1. Introduction

Organic chemistry is the study of carbon-containing compounds. **Functional groups** determine the chemical properties of organic molecules.

## 2. Common Functional Groups

| Group | Structure | Example |
|-------|-----------|---------|
| Hydroxyl | $-OH$ | Ethanol ($C_2H_5OH$) |
| Carbonyl | $C=O$ | Acetone |
| Carboxyl | $-COOH$ | Acetic acid |
| Amino | $-NH_2$ | Glycine |
| Ester | $-COO-$ | Ethyl acetate |

## 3. Alcohols ($-OH$)

Alcohols contain the hydroxyl group. They are classified as:

- **Primary (1°)**: $-CH_2OH$ — one carbon attached
- **Secondary (2°)**: two carbons attached to the $C-OH$
- **Tertiary (3°)**: three carbons attached

### Properties
- Hydrogen bonding → higher boiling points
- Soluble in water (small alcohols)
- Can undergo oxidation and dehydration

## 4. Carboxylic Acids ($-COOH$)

Weak acids that donate $H^+$ from the carboxyl group:

$$R-COOH \\rightleftharpoons R-COO^- + H^+$$

> **Note**: The stability of the conjugate base ($R-COO^-$) is due to resonance — the negative charge is delocalized over both oxygen atoms.

## 5. Amines ($-NH_2$)

Amines are organic bases:

$$R-NH_2 + H_2O \\rightleftharpoons R-NH_3^+ + OH^-$$

### Classification
- Primary amine: $R-NH_2$
- Secondary amine: $R_2NH$
- Tertiary amine: $R_3N$

## 6. Summary

Understanding functional groups is essential for:
- Predicting reactivity
- Naming compounds (IUPAC nomenclature)
- Understanding biological molecules (amino acids, sugars, lipids)

---

*Next chapter: Reaction Mechanisms*
`
  },
  {
    id: 'md-math-exam-1',
    title: 'Mathematics Midterm Exam 2024',
    subject: 'Mathematics',
    author: 'Department of Mathematics',
    description: 'Practice midterm covering derivatives, integrals, and applications.',
    contentType: 'exam',
    markdown: `# Mathematics Midterm Exam — 2024

**Duration**: 2 hours | **Total Marks**: 100

---

## Part I: Short Answer (40 marks)

### Question 1 (10 marks)
Evaluate the following limits:

a) $\\lim_{x \\to 2} \\frac{x^3 - 8}{x - 2}$

b) $\\lim_{x \\to 0} \\frac{1 - \\cos x}{x^2}$

### Question 2 (10 marks)
Find the derivative of each function:

a) $f(x) = x^3 \\sin(2x)$

b) $g(x) = \\frac{e^x}{x^2 + 1}$

c) $h(x) = \\ln(\\sqrt{x^2 + 1})$

### Question 3 (10 marks)
Evaluate the integrals:

a) $\\int x e^{x} dx$

b) $\\int_0^{\\pi/2} \\sin^2(x) dx$

### Question 4 (10 marks)
Find the equation of the tangent line to $y = x^2 - 3x + 2$ at the point where $x = 1$.

---

## Part II: Long Answer (60 marks)

### Question 5 (20 marks)
A particle moves along a straight line with position function:

$$s(t) = t^3 - 6t^2 + 9t + 2$$

a) Find the velocity and acceleration functions.
b) When is the particle at rest?
c) When is the particle moving in the positive direction?
d) Find the total distance traveled in the first 5 seconds.

### Question 6 (20 marks)
A farmer wants to fence a rectangular area adjacent to a river. No fence is needed along the river. If 200 meters of fencing is available:

a) Express the area as a function of one variable.
b) Find the dimensions that maximize the area.
c) What is the maximum area?

### Question 7 (20 marks)
Prove that if $f$ is continuous on $[a, b]$ and differentiable on $(a, b)$, then there exists $c \\in (a, b)$ such that:

$$f'(c) = \\frac{f(b) - f(a)}{b - a}$$

*(Mean Value Theorem)*

---

**End of Exam — Good Luck!**
`
  },
  {
    id: 'md-physics-ref-1',
    title: 'Physics Formula Reference Sheet',
    subject: 'Physics',
    author: 'Physics Department',
    description: 'Quick reference for essential physics formulas and constants.',
    contentType: 'reference',
    markdown: `# Physics Formula Reference Sheet

## Fundamental Constants

| Constant | Symbol | Value |
|----------|--------|-------|
| Speed of light | $c$ | $3.0 \\times 10^8$ m/s |
| Gravitational constant | $G$ | $6.674 \\times 10^{-11}$ N·m²/kg² |
| Planck's constant | $h$ | $6.626 \\times 10^{-34}$ J·s |
| Boltzmann constant | $k_B$ | $1.381 \\times 10^{-23}$ J/K |
| Electron charge | $e$ | $1.602 \\times 10^{-19}$ C |
| Avogadro's number | $N_A$ | $6.022 \\times 10^{23}$ mol⁻¹ |

## Kinematics

$$v = v_0 + at$$

$$x = x_0 + v_0 t + \\frac{1}{2}at^2$$

$$v^2 = v_0^2 + 2a(x - x_0)$$

## Dynamics

$$\\vec{F}_{net} = m\\vec{a}$$

$$W = \\vec{F} \\cdot \\vec{d} = Fd\\cos\\theta$$

$$KE = \\frac{1}{2}mv^2$$

$$PE = mgh$$

## Circular Motion

$$a_c = \\frac{v^2}{r}$$

$$F_c = \\frac{mv^2}{r}$$

$$T = \\frac{2\\pi r}{v}$$

## Waves

$$v = f\\lambda$$

$$f = \\frac{1}{T}$$

## Electromagnetism

$$F = k\\frac{q_1 q_2}{r^2}$$

$$E = \\frac{F}{q}$$

$$V = \\frac{kq}{r}$$

$$\\Phi = BA\\cos\\theta$$

## Thermodynamics

$$Q = mc\\Delta T$$

$$\\Delta U = Q - W$$

$$PV = nRT$$

---

*Keep this sheet handy during problem solving.*
`
  },
  {
    id: 'md-bio-1',
    title: 'Cell Biology: Structure & Function',
    subject: 'Biology',
    author: 'Dr. Hana Girma',
    description: 'Comprehensive overview of cell organelles and their functions.',
    contentType: 'book',
    markdown: `# Cell Biology: Structure & Function

## 1. The Cell Theory

1. All living organisms are composed of cells
2. The cell is the basic unit of life
3. All cells arise from pre-existing cells

## 2. Prokaryotic vs Eukaryotic Cells

| Feature | Prokaryotic | Eukaryotic |
|---------|------------|------------|
| Nucleus | No (nucleoid) | Yes (membrane-bound) |
| Size | 1–10 μm | 10–100 μm |
| Organelles | Few, no membrane-bound | Many membrane-bound |
| DNA | Circular | Linear chromosomes |
| Examples | Bacteria, Archaea | Plants, Animals, Fungi |

## 3. Cell Organelles

### Nucleus
- Contains DNA (genetic material)
- Surrounded by nuclear envelope (double membrane)
- **Nucleolus**: site of ribosome assembly

### Mitochondria
- **Powerhouse of the cell**
- Site of cellular respiration
- Produces ATP via oxidative phosphorylation

$$C_6H_{12}O_6 + 6O_2 \\rightarrow 6CO_2 + 6H_2O + \\text{ATP}$$

### Endoplasmic Reticulum (ER)
- **Rough ER**: studded with ribosomes → protein synthesis
- **Smooth ER**: lipid synthesis, detoxification

### Golgi Apparatus
- Modifies, packages, and ships proteins
- Forms lysosomes

### Lysosomes
- Contain digestive enzymes
- Break down waste materials and cellular debris

## 4. Cell Membrane

The **fluid mosaic model** describes the cell membrane as:
- Phospholipid bilayer
- Embedded proteins (integral and peripheral)
- Cholesterol for fluidity
- Glycoproteins for cell recognition

### Transport Mechanisms

| Type | Energy? | Direction | Example |
|------|---------|-----------|---------|
| Diffusion | No | High → Low | O₂ crossing membrane |
| Osmosis | No | High → Low (water) | Water balance |
| Active transport | Yes (ATP) | Low → High | Na⁺/K⁺ pump |

## 5. Cell Division

### Mitosis (somatic cells)
Prophase → Metaphase → Anaphase → Telophase → Cytokinesis

Result: **2 identical diploid cells**

### Meiosis (gametes)
Two divisions producing **4 haploid cells** for sexual reproduction.

---

*Next: Genetics and DNA Replication*
`
  },
  {
    id: 'md-chem-exam-1',
    title: 'Chemistry Practice Exam: Bonding',
    subject: 'Chemistry',
    author: 'Chemistry Department',
    description: 'Practice exam on chemical bonding, molecular geometry, and intermolecular forces.',
    contentType: 'exam',
    markdown: `# Chemistry Practice Exam: Chemical Bonding

**Duration**: 90 minutes | **Total Marks**: 80

---

## Part I: Multiple Choice (20 marks)

**1.** Which type of bond forms between a metal and a non-metal?
- a) Covalent
- b) Ionic ✓
- c) Metallic
- d) Hydrogen

**2.** The shape of a molecule with 4 bonding pairs and 0 lone pairs is:
- a) Trigonal planar
- b) Linear
- c) Tetrahedral ✓
- d) Bent

**3.** Which intermolecular force is the strongest?
- a) London dispersion
- b) Dipole-dipole
- c) Hydrogen bonding ✓
- d) Ion-dipole (in solution)

**4.** A bond between atoms with electronegativity difference > 1.7 is classified as:
- a) Nonpolar covalent
- b) Polar covalent
- c) Ionic ✓
- d) Metallic

---

## Part II: Short Answer (30 marks)

### Question 5 (10 marks)
Draw Lewis structures for:
a) $CO_2$
b) $NH_3$
c) $H_2O$

For each, state the molecular geometry and bond angle.

### Question 6 (10 marks)
Explain why $HF$ has a higher boiling point than $HCl$ despite having a lower molecular mass.

### Question 7 (10 marks)
Compare ionic and covalent bonds in terms of:
- Electron behavior
- Physical properties of resulting compounds
- Electrical conductivity

---

## Part III: Long Answer (30 marks)

### Question 8 (15 marks)
Using VSEPR theory, predict the molecular geometry for:
a) $BF_3$
b) $SF_6$
c) $XeF_2$

Show your work including electron domain count and any lone pairs.

### Question 9 (15 marks)
Explain the concept of hybridization. Describe $sp$, $sp^2$, and $sp^3$ hybridization with examples.

---

**End of Exam**
`
  },
  {
    id: 'md-cs-1',
    title: 'Data Structures: Arrays & Linked Lists',
    subject: 'Computer Science',
    author: 'Prof. Daniel Tesfaye',
    description: 'Introduction to fundamental data structures with examples.',
    contentType: 'book',
    markdown: `# Data Structures: Arrays & Linked Lists

## 1. Arrays

An array is a collection of elements stored in **contiguous memory** locations.

### Time Complexity

| Operation | Average | Worst |
|-----------|---------|-------|
| Access | $O(1)$ | $O(1)$ |
| Search | $O(n)$ | $O(n)$ |
| Insert | $O(n)$ | $O(n)$ |
| Delete | $O(n)$ | $O(n)$ |

### Declaration

\`\`\`python
# Python
arr = [1, 2, 3, 4, 5]

# Access by index
print(arr[0])  # Output: 1

# Append
arr.append(6)

# Insert at index
arr.insert(2, 10)  # [1, 2, 10, 3, 4, 5, 6]
\`\`\`

### Advantages
- Fast random access ($O(1)$)
- Cache-friendly (contiguous memory)
- Simple to implement

### Disadvantages
- Fixed size (static arrays)
- Expensive insertions/deletions
- Wasted space if not fully utilized

## 2. Linked Lists

A linked list is a linear data structure where elements (**nodes**) are connected via **pointers**.

### Types
1. **Singly Linked List**: Each node points to the next
2. **Doubly Linked List**: Each node points to both next and previous
3. **Circular Linked List**: Last node points back to first

### Time Complexity

| Operation | Average | Worst |
|-----------|---------|-------|
| Access | $O(n)$ | $O(n)$ |
| Search | $O(n)$ | $O(n)$ |
| Insert (head) | $O(1)$ | $O(1)$ |
| Delete (head) | $O(1)$ | $O(1)$ |

### Implementation

\`\`\`python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def insert_at_head(self, data):
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node

    def display(self):
        current = self.head
        while current:
            print(current.data, end=" -> ")
            current = current.next
        print("None")
\`\`\`

## 3. Comparison

| Feature | Array | Linked List |
|---------|-------|-------------|
| Memory | Contiguous | Scattered |
| Size | Fixed/Dynamic | Dynamic |
| Access | $O(1)$ | $O(n)$ |
| Insert/Delete | $O(n)$ | $O(1)$ at head |
| Cache | Excellent | Poor |

## 4. When to Use What?

- **Arrays**: When you need fast access by index, know the size in advance
- **Linked Lists**: When you need frequent insertions/deletions, size is unknown

---

*Next: Stacks, Queues, and Trees*
`
  }
];
