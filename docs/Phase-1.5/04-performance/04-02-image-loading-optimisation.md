---
Phase: 1.5
Risk Level: Low
Effort Estimate: 1 hour
Non-breaking: Yes
---

## 4.2 Image Loading Optimisation

### Purpose

To improve initial page load performance and reduce bandwidth consumption by implementing lazy loading for images that are not in the initial viewport, such as AI-SME avatars.

### Scope

This task involves updating the image components used for AI-SME avatars and other non-critical images to use the browser's native lazy loading capabilities.

### Current State

- The AI-SME browser page can display a large number of expert avatars.
- All of these images are loaded immediately when the page is rendered, even if they are off-screen.
- This increases the initial page load time and consumes unnecessary data for the user.

### Recommended Approach

1.  **Identify Target Images:** The primary candidates are the AI-SME avatar images on the expert browser page.
2.  **Use Native Lazy Loading:** For all `<img>` tags or Next.js `<Image>` components, add the `loading="lazy"` attribute. This is a simple, effective, and widely supported browser feature.
3.  **Provide Placeholders:** Ensure that while the images are loading, a placeholder (like a blurred image or a skeleton) is displayed to prevent layout shifts. The Next.js `<Image>` component handles this well with the `placeholder="blur"` option.

#### Illustrative Code Snippet (Next.js Image component)

```tsx
// SMEAvatar.tsx (illustrative / not yet enforced)
import Image from 'next/image';

interface SMEAvatarProps {
  src: string;
  alt: string;
}

export function SMEAvatar({ src, alt }: SMEAvatarProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={100}
      height={100}
      loading="lazy" // This is the key change
      placeholder="blur" // Optional but recommended
      blurDataURL="..." // A base64-encoded tiny version of the image
    />
  );
}
```

### Non-breaking Confirmation

This change is non-breaking. It is a performance optimization that only affects how and when images are loaded. It does not change the application's functionality.

### Phase Boundary Notes

- **Phase 1.5:** Apply lazy loading to all non-critical images, especially on list pages.
- **Phase 2 Follow-ups:** None. This should be the default practice for all new image-heavy components.

---

Ready for GitHub commit: Yes
