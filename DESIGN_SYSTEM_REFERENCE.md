# Design System Quick Reference

**CommunityOS UI/UX Pro Max Foundation**

## 🎨 Color Palette

| Usage | Variable | Hex | Tailwind Class |
|-------|----------|-----|----------------|
| Primary (Rose) | `--color-primary` | #E11D48 | `text-primary` / `bg-primary` |
| Secondary (Pink) | `--color-secondary` | #FB7185 | `text-secondary` / `bg-secondary` |
| CTA (Blue) | `--color-cta` | #2563EB | `text-cta` / `bg-cta` |
| Success | `--color-success` | #10B981 | `text-success` / `bg-success` |
| Warning | `--color-warning` | #F59E0B | `text-warning` / `bg-warning` |
| Error | `--color-error` | #DC2626 | `text-error` / `bg-error` |
| Background | `--color-background` | #FFF1F2 | - |
| Text | `--color-text` | #881337 | - |

## 📝 Typography

### Fonts

- **Headings**: Russo One (gaming, bold, esports vibe)
- **Body**: Chakra Petch (clean, readable, technical)

### Usage in JSX

```tsx
<h1 className="font-heading text-4xl">Mission Title</h1>
<p className="font-body text-base">Description text</p>
```

### Sizes

- `text-sm`: 14px (labels, badges)
- `text-base`: 16px (body text)
- `text-lg`: 18px (subheadings)
- `text-xl`: 20px (card titles)
- `text-2xl`: 24px (section headers)
- `text-4xl`: 36px (hero headings)

## 🧩 Components

### Button

```tsx
import { Button } from './components';

<Button variant="primary" size="md">Accept Mission</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="emergency">🚨 SWARM MODE</Button>
<Button variant="success">Complete</Button>
```

**Variants**: `primary` | `secondary` | `emergency` | `success`  
**Sizes**: `sm` | `md` | `lg`

### Badge

```tsx
import { Badge } from './components';

<Badge variant="active">Active</Badge>
<Badge variant="completed">Completed</Badge>
<Badge variant="streak">🔥 7-Day Streak</Badge>
<Badge variant="trustScore">Trust: 94</Badge>
<Badge variant="pending">Pending</Badge>
<Badge variant="urgent">Urgent</Badge>
```

**Variants**: `active` | `completed` | `streak` | `trustScore` | `pending` | `urgent`

### Card

```tsx
import { Card } from './components';

<Card variant="mission" hoverable>
  {/* Mission content */}
</Card>

<Card variant="profile">
  {/* Profile content */}
</Card>

<Card variant="stats">
  {/* Stats content */}
</Card>
```

**Variants**: `default` | `mission` | `profile` | `stats`  
**Props**: `hoverable` (adds hover animation)

### ProgressBar

```tsx
import { ProgressBar } from './components';

<ProgressBar 
  current={150}
  max={500}
  label="XP to Level 5"
  variant="gradient"
  showPercentage={true}
/>
```

**Variants**: `default` | `gradient` | `success`

## 🎯 Icons (Lucide React)

Already imported in your `index.html`. Just use:

```tsx
import { Zap, Trophy, Users, MapPin, Clock, AlertTriangle } from 'lucide-react';

<Zap className="w-6 h-6 text-cta" />
<Trophy className="w-8 h-8 text-primary" />
<AlertTriangle className="w-6 h-6 text-error" />
```

**Common Icons**:

- `Zap` - XP, energy, mission rewards
- `Trophy` - Achievements, skills, completed missions
- `Users` - Recruits, team missions
- `MapPin` - Locations, crisis zones
- `Clock` - Time tracking, volunteer hours
- `AlertTriangle` - Warnings, emergencies
- `Flame` - Streaks, hot missions
- `Star` - Ratings, featured missions

## 🎭 Animations

### Pulse Ring (Emergency/Active)

```tsx
<div className="animate-pulse-ring bg-error w-4 h-4 rounded-full" />
```

### Pulse Dot (Breathing effect)

```tsx
<div className="animate-pulse-dot bg-orange-500 w-8 h-8 rounded-full" />
```

### Hover Effects

```tsx
<div className="transition-all hover:shadow-lg hover:-translate-y-1">
  Card content
</div>
```

## 📐 Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-xs` | 4px | Tight gaps |
| `space-sm` | 8px | Icon gaps |
| `space-md` | 16px | Standard padding |
| `space-lg` | 24px | Section padding |
| `space-xl` | 32px | Large gaps |
| `space-2xl` | 48px | Section margins |
| `space-3xl` | 64px | Hero padding |

**Tailwind Classes**: `gap-2`, `p-4`, `m-6`, `space-y-4`

## 🌑 Dark Mode

Design system automatically supports dark mode!

```tsx
// Toggle dark mode
document.documentElement.classList.toggle('dark');

// Or in React
const [darkMode, setDarkMode] = useState(false);

useEffect(() => {
  document.documentElement.classList.toggle('dark', darkMode);
}, [darkMode]);
```

Dark mode color overrides defined in `:root.dark` in `index.css`.

## ♿ Accessibility

All components follow WCAG AAA standards:

- ✅ Focus states: 3px outline on all interactive elements
- ✅ Touch targets: Minimum 44x44px
- ✅ Color contrast: 4.5:1 minimum ratio
- ✅ Keyboard navigation: Full support
- ✅ Screen readers: Semantic HTML
- ✅ Reduced motion: `prefers-reduced-motion` respected

## 🚀 Quick Migration Guide

### Before (Old Style)

```tsx
<button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
  Accept
</button>
```

### After (Design System)

```tsx
<Button variant="primary">Accept</Button>
```

---

### Before (Old Badge)

```tsx
<span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">
  Active
</span>
```

### After (Design System)

```tsx
<Badge variant="active">Active</Badge>
```

---

### Before (Old Card)

```tsx
<div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg">
  {content}
</div>
```

### After (Design System)

```tsx
<Card variant="mission" hoverable>
  {content}
</Card>
```

## 📚 Full Examples

See `components/Examples.tsx` for:

- Mission cards
- Profile stats
- Streak displays
- Swarm mode button
- Skill tree nodes
- Active mission pins
- Button showcase
- Badge showcase

## 🎯 Pro Tips

1. **Use semantic variants**: `variant="emergency"` instead of custom red styling
2. **Leverage hover states**: Add `hoverable` to cards for instant polish
3. **Consistent icons**: Always use Lucide, never emojis for UI icons
4. **Font hierarchy**: Russo One for impact, Chakra Petch for readability
5. **Color psychology**: Rose = compassion/urgency, Blue = trust/action

---

**Generated by UI/UX Pro Max** • See `UI_UX_ENHANCEMENT_PLAN.md` for full roadmap
