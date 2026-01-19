---
Phase: 1.5
Risk Level: None
Effort Estimate: 20 minutes
Non-breaking: Yes
---

## 1.5 Button Styling Consistency

### Purpose

To enforce visual consistency and a predictable user interface by ensuring all buttons and clickable actions adhere to the established design system.

### Scope

This task involves a visual audit of all buttons across the application and updating the class names or component variants to match the design system's specifications for primary, secondary, and tertiary actions.

### Current State

- Most buttons are consistent, but some legacy or one-off styles exist.
- Variations in padding, font weight, and hover states have been noted in secondary pages.
- This minor inconsistency detracts from the overall professional polish of the application.

### Recommended Approach

1.  **Define Button Hierarchy:** Formally document the intended use for each button variant in the design system:
    - **Primary:** For the main call-to-action on a page (e.g., "Save", "Submit").
    - **Secondary:** For secondary actions (e.g., "Cancel", "Back").
    - **Tertiary/Link:** For less prominent actions that don't require a filled button (e.g., "Learn More").
2.  **Visual Audit:** Click through the entire application and visually inspect all buttons.
3.  **Update Classes:** For any buttons that deviate from the standard, update their component variant or CSS classes to match the design system.

#### Illustrative Code Snippet (React component with variants)

```tsx
// Button.tsx (illustrative / not yet enforced)
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary' | 'tertiary';
}

export function Button({ variant, ...props }: ButtonProps) {
  const baseClasses = 'font-bold py-2 px-4 rounded';
  const variantClasses = {
    primary: 'bg-pink-500 text-white hover:bg-pink-600',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600',
    tertiary: 'bg-transparent text-pink-500 hover:underline',
  };

  return <button className={`${baseClasses} ${variantClasses[variant]}`} {...props} />;
}
```

### Non-breaking Confirmation

This change is non-breaking. It is a purely cosmetic UI update that has no impact on application functionality.

### Phase Boundary Notes

- **Phase 1.5:** Achieve 100% button consistency across the application.
- **Phase 2 Follow-ups:** None. All new buttons in Phase 2 must use the established `Button` component and its variants.

---

Ready for GitHub commit: Yes
