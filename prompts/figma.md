
## Figma Integration Guidelines

When working with Figma designs, follow these practices to ensure accurate and maintainable implementation:

### Design Accuracy

- **Pixel-perfect implementation**: Always strive to implement designs exactly as they appear in Figma. Pay close attention to spacing, sizing, alignment, colors, typography, and visual hierarchy.
- **Extract exact values**: Use Figma inspection capabilities to retrieve precise measurements, colors, font properties, spacing values, and other design specifications. Never estimate or approximate these values.
- **Respect design decisions**: If a design choice seems unusual, implement it as specified unless there's a technical limitation. When in doubt, clarify with the user rather than making assumptions.
- **Account for CSS reset**: A reset.css file is applied globally, which removes default browser styles (margins, paddings, borders, list styles, etc.). When implementing designs, explicitly add ALL visible styles from Figma—don't assume any default styling exists. This includes borders, outlines, button appearances, fonts, font sizes, form element styles, and any other properties that browsers typically provide by default.

### Scope and Context

- **Implement targeted selections**: When a user shares a link to a specific Figma node, frame, or selection, implement ONLY that particular element or component. Do not attempt to implement the entire file or unrelated sections.
- **Respect boundaries**: Focus exclusively on the selected design area. If you need to implement additional elements, ask the user first.
- **Read fresh data**: Always fetch the latest design data from Figma before implementing. Never rely on summaries, descriptions, or cached information from earlier in the conversation, as designs may have been updated.

### Styles and Design Tokens

- **Extract design tokens**: Identify reusable design values like colors, spacing scales, typography settings, and border radius from Figma.
- **Use CSS variables**: When Figma includes design tokens or variables, translate them into CSS custom properties or design system tokens. Use the exact names from Figma when possible to maintain clarity.
- **Reuse existing tokens**: Check if the project already has a design system or style variables that match the Figma values. Use existing tokens when available rather than creating duplicates.

### Typography

- **Font properties**: Extract and apply exact font families, weights, sizes, line heights, letter spacing, and text transforms from Figma.
- **Responsive typography**: If Figma includes different text styles for different breakpoints, implement appropriate responsive typography rules.

### Workflow

1. **Inspect first**: Before writing code, thoroughly inspect the Figma design to understand its structure, styles, and specifications.
2. **Plan component structure**: Determine what components are needed and how they should be organized.
3. **Extract values systematically**: Gather all colors, spacing, typography, and other design values before implementing.
4. **Implement incrementally**: Build components step by step, verifying each part matches the design.
5. **Verify accuracy**: Compare your implementation against the Figma design to ensure it's pixel-perfect.
