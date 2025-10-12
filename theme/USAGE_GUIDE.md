# Shade Design System - Usage Guide

## Quick Start

### 1. Import the Theme Hook

```tsx
import { useTheme } from '../theme/ThemeProvider';

function MyComponent() {
  const { colors, brand, typography, spacing, borderRadius, shadows } = useTheme();
  
  return (
    <View style={{ 
      backgroundColor: colors.background,
      padding: spacing.lg,
      borderRadius: borderRadius.xl,
    }}>
      <Text style={{ 
        color: colors.text.primary,
        fontSize: typography.size.lg,
        fontWeight: typography.weight.bold,
      }}>
        Hello Shade!
      </Text>
    </View>
  );
}
```

## Theme Properties

### Colors
```tsx
const { colors } = useTheme();

// Backgrounds
colors.background      // Main app background
colors.surface        // Elevated surfaces
colors.card          // Card backgrounds
colors.border        // Border colors
colors.divider       // Divider lines

// Text
colors.text.primary   // Main text
colors.text.secondary // Secondary text
colors.text.tertiary  // Tertiary/muted text
colors.text.disabled  // Disabled text
colors.text.inverse   // Inverse (white on dark, dark on white)

// Semantic
colors.semantic.success   // Success green
colors.semantic.error     // Error red
colors.semantic.warning   // Warning amber
colors.semantic.info      // Info blue

// Social
colors.social.spotify
colors.social.apple
colors.social.google
```

### Brand Colors
```tsx
const { brand } = useTheme();

brand.primary         // #6366F1 Indigo
brand.primaryDark     // #4F46E5
brand.primaryLight    // #818CF8
brand.secondary       // #EC4899 Pink
brand.secondaryDark   // #DB2777
brand.secondaryLight  // #F472B6
```

### Spacing
```tsx
const { spacing } = useTheme();

spacing.xs    // 4px
spacing.sm    // 8px
spacing.md    // 12px
spacing.lg    // 16px
spacing.xl    // 20px
spacing['2xl'] // 24px
spacing['3xl'] // 32px
spacing['4xl'] // 40px
spacing['5xl'] // 48px
spacing['6xl'] // 64px
spacing['7xl'] // 80px
```

### Typography
```tsx
const { typography } = useTheme();

// Sizes
typography.size.xs     // 12px
typography.size.sm     // 14px
typography.size.base   // 16px
typography.size.lg     // 18px
typography.size.xl     // 20px
typography.size['2xl'] // 24px
typography.size['3xl'] // 28px
typography.size['4xl'] // 32px

// Weights
typography.weight.regular   // '400'
typography.weight.medium    // '500'
typography.weight.semibold  // '600'
typography.weight.bold      // '700'
typography.weight.extrabold // '800'

// Line Heights
typography.lineHeight.tight   // 1.2
typography.lineHeight.normal  // 1.5
typography.lineHeight.relaxed // 1.75
```

### Border Radius
```tsx
const { borderRadius } = useTheme();

borderRadius.xs    // 4px
borderRadius.sm    // 6px
borderRadius.md    // 8px
borderRadius.lg    // 12px
borderRadius.xl    // 16px
borderRadius['2xl'] // 20px
borderRadius.full  // 9999px (circle)
```

### Shadows
```tsx
const { shadows } = useTheme();

shadows.sm      // Small shadow
shadows.md      // Medium shadow
shadows.lg      // Large shadow
shadows.xl      // Extra large shadow
shadows.brand   // Purple brand shadow

// Usage
<View style={{
  ...shadows.md,
  backgroundColor: colors.card,
}}>
```

## Common Patterns

### Screen Layout
```tsx
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';

function MyScreen() {
  const { colors, spacing } = useTheme();
  
  return (
    <SafeAreaView 
      style={{ flex: 1, backgroundColor: colors.background }} 
      edges={['top']}
    >
      <ScrollView 
        contentContainerStyle={{ paddingBottom: spacing['3xl'] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Content */}
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Card Component
```tsx
function MyCard() {
  const { colors, borderRadius, spacing, shadows } = useTheme();
  
  return (
    <View style={{
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.md,
    }}>
      {/* Card content */}
    </View>
  );
}
```

### Button
```tsx
import Button from '../components/ui/Button';

<Button
  variant="primary"  // or 'secondary', 'outline', 'ghost', 'danger'
  size="lg"         // or 'sm', 'md'
  onPress={handlePress}
  loading={isLoading}
  disabled={isDisabled}
  fullWidth
>
  Click Me
</Button>
```

### Input Field
```tsx
import Input from '../components/ui/Input';
import { Mail } from 'lucide-react-native';

<Input
  value={email}
  onChangeText={setEmail}
  placeholder="Email address"
  keyboardType="email-address"
  leftIcon={<Mail size={20} color={colors.text.tertiary} />}
  error={error}
/>
```

### Header with Branding
```tsx
function MyHeader() {
  const { colors, brand, typography, spacing } = useTheme();
  
  return (
    <View style={{
      height: 56,
      paddingHorizontal: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <View style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: brand.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Umbrella size={18} color="#FFFFFF" strokeWidth={2.5} />
        </View>
        <Text style={{ 
          color: colors.text.primary,
          fontWeight: typography.weight.bold,
          fontSize: typography.size.xl,
          letterSpacing: -0.5,
        }}>
          Shade
        </Text>
      </View>
    </View>
  );
}
```

### Icon Button
```tsx
function IconButton({ icon: Icon, onPress }) {
  const { colors, spacing, shadows } = useTheme();
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Icon size={20} color={colors.text.secondary} strokeWidth={2} />
    </TouchableOpacity>
  );
}
```

### Badge/Tag
```tsx
function Badge({ children }) {
  const { brand, typography, spacing, borderRadius } = useTheme();
  
  return (
    <View style={{
      backgroundColor: `${brand.primary}15`,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    }}>
      <Text style={{
        color: brand.primary,
        fontSize: typography.size.xs,
        fontWeight: typography.weight.medium,
      }}>
        {children}
      </Text>
    </View>
  );
}
```

## Best Practices

### ✅ DO
- Always use theme values instead of hardcoded colors
- Use spacing tokens for all margins and padding
- Use typography tokens for all text
- Use borderRadius tokens for rounded corners
- Use shadows from the design system
- Use SafeAreaView with proper edges
- Use premium lucide icons with consistent stroke widths

### ❌ DON'T
- Don't hardcode colors like `#FFFFFF` or `backgroundColor: 'white'`
- Don't use magic numbers for spacing like `margin: 12`
- Don't mix different shadow implementations
- Don't use inline styles for repeated patterns
- Don't forget to handle dark mode
- Don't use different icon libraries

## Color Opacity

For semi-transparent colors, append opacity hex:
```tsx
// 15% opacity
backgroundColor: `${brand.primary}15`

// 40% opacity
backgroundColor: `${brand.primary}40`

// Common opacities:
// 08 = 5%
// 15 = 8%
// 20 = 12%
// 40 = 25%
// 60 = 38%
// 80 = 50%
```

## Dark Mode

The theme automatically handles dark mode. Just use the theme colors:
```tsx
// This works in both light and dark mode
<View style={{ backgroundColor: colors.background }}>
  <Text style={{ color: colors.text.primary }}>
    Hello Shade!
  </Text>
</View>
```

## Changing Theme

Users can toggle dark mode:
```tsx
const { isDark, setDark } = useTheme();

<Button onPress={() => setDark(!isDark)}>
  Toggle Theme
</Button>
```

## Tips

1. **Use the theme hook at the top of your component**
   ```tsx
   const theme = useTheme();
   const { colors, spacing } = theme;
   ```

2. **Create style objects with theme values**
   ```tsx
   const styles = {
     container: {
       padding: spacing.lg,
       backgroundColor: colors.card,
     },
   };
   ```

3. **Use meaningful variable names**
   ```tsx
   // Good
   const primaryColor = brand.primary;
   
   // Bad
   const color1 = '#8B5CF6';
   ```

4. **Spread shadows for consistency**
   ```tsx
   <View style={{ ...shadows.md, backgroundColor: colors.card }} />
   ```

---

**Happy coding with Shade! 🎨**

