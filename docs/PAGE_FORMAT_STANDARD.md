# CEPHO Page Format Standard

## Standard Page Header Banner

All main pages MUST use the consistent PageHeader component from `/components/layout/PageHeader.tsx`

### Standard Format

```tsx
import { PageHeader } from '@/components/layout/PageHeader';
import { IconName } from 'lucide-react';

export default function PageName() {
  return (
    <div className="h-[calc(100vh-56px)] md:h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      {/* Header */}
      <PageHeader 
        icon={IconName} 
        title="Page Title"
        subtitle="Optional subtitle describing the page"
      >
        {/* Optional: Action buttons in top right */}
        <Button>Action</Button>
      </PageHeader>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Page content here */}
      </div>
    </div>
  );
}
```

### Header Banner Appearance

The PageHeader creates a consistent black banner at the top showing:

```
CEPHO | [Icon] Page Title
                Subtitle (if provided)
                                        [Optional Actions]
```

### Key Features

1. **Black background** (`bg-black`)
2. **Sticky positioning** (`sticky top-0 z-20`)
3. **CEPHO branding** with brain icon
4. **Page icon** in a rounded container
5. **Title and subtitle**
6. **Optional action buttons** on the right

### Page Container Standard

```tsx
<div className="h-[calc(100vh-56px)] md:h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
```

- **Full height** minus mobile nav bar
- **Flex column** layout
- **Gradient background** (CEPHO dark theme)

### Examples

#### Simple Page
```tsx
<PageHeader 
  icon={Settings} 
  title="Settings"
  subtitle="Manage your account and preferences"
/>
```

#### Page with Actions
```tsx
<PageHeader 
  icon={Users} 
  title="AI-SMEs"
  subtitle="Expert AI specialists"
>
  <Button variant="outline" size="sm">
    <Plus className="w-4 h-4 mr-2" />
    Add Expert
  </Button>
</PageHeader>
```

#### Page with Status Badge
```tsx
<PageHeader 
  icon={Shield} 
  title="The Vault"
  subtitle="Secure encrypted storage"
>
  <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400">
    <Lock className="w-3 h-3 mr-1" />
    Encrypted
  </Badge>
</PageHeader>
```

## Pages to Update

The following pages are currently using the old Breadcrumbs PageHeader and need to be updated:

- [ ] Settings
- [ ] Statistics
- [ ] Commercialization
- [ ] Persephone Board
- [ ] Go Live

## Migration Steps

1. Change import from:
   ```tsx
   import { PageHeader } from '@/components/layout/Breadcrumbs';
   ```
   
   To:
   ```tsx
   import { PageHeader } from '@/components/layout/PageHeader';
   ```

2. Add an icon import:
   ```tsx
   import { IconName } from 'lucide-react';
   ```

3. Update PageHeader usage to include icon:
   ```tsx
   <PageHeader 
     icon={IconName}
     title="Page Title"
     subtitle="Description"
   />
   ```

4. Wrap page in standard container if not already:
   ```tsx
   <div className="h-[calc(100vh-56px)] md:h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
   ```

## DO NOT Use

❌ **DO NOT** use `PageHeader` from `/components/layout/Breadcrumbs.tsx`
❌ **DO NOT** create custom header styles
❌ **DO NOT** use different background colors for the banner

## Consistency is Key

Every page should have the same professional header banner with the CEPHO branding, making the entire application feel cohesive and polished.
