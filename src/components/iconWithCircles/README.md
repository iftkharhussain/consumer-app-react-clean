# IconWithCircles Component

A wrapper component that displays SVG icons inside concentric circles with various styling options.

## Usage

```jsx
import IconWithCircles from '../components/iconWithCircles';
import { CheckIcon, InfoIcon } from '../components/icon';

// Basic usage
<IconWithCircles icon={CheckIcon} />

// With different sizes
<IconWithCircles icon={CheckIcon} size="xs" />
<IconWithCircles icon={CheckIcon} size="sm" />
<IconWithCircles icon={CheckIcon} size="md" /> // default
<IconWithCircles icon={CheckIcon} size="lg" />
<IconWithCircles icon={CheckIcon} size="xl" />

// With different variants (color schemes)
<IconWithCircles icon={CheckIcon} variant="primary" /> // default
<IconWithCircles icon={CheckIcon} variant="secondary" />
<IconWithCircles icon={CheckIcon} variant="success" />
<IconWithCircles icon={CheckIcon} variant="warning" />
<IconWithCircles icon={CheckIcon} variant="error" />
<IconWithCircles icon={CheckIcon} variant="info" />

// With custom icon color
<IconWithCircles icon={CheckIcon} iconColor="white" /> // default
<IconWithCircles icon={CheckIcon} iconColor="black" />
<IconWithCircles icon={CheckIcon} iconColor="primary" />

// Interactive (clickable)
<IconWithCircles 
  icon={CheckIcon} 
  variant="success" 
  onClick={() => console.log('Clicked!')} 
/>

// With custom SVG icon
<IconWithCircles 
  icon={() => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M15 5L5 15M5 5L15 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )}
  variant="error"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `React.Component \| Function \| string` | - | **Required.** The SVG icon to display |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Size of the icon wrapper |
| `variant` | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error' \| 'info'` | `'primary'` | Color scheme variant |
| `iconColor` | `'white' \| 'black' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error'` | `'white'` | Color of the icon itself |
| `className` | `string` | `''` | Additional CSS classes |
| `onClick` | `function` | - | Click handler to make the component interactive |

## Features

- **Responsive Design**: Adapts to different screen sizes
- **Interactive States**: Hover and click animations when `onClick` is provided
- **Accessibility**: Proper focus states and keyboard navigation
- **Customizable**: Multiple size, color, and variant options
- **Icon Flexibility**: Supports SVG components, functions, or string icons
- **Design System**: Follows UntitledUI design patterns

## Examples in Demo

Check out `src/components/demo/ComponentsDemo.jsx` for live examples of all variants, sizes, and interactive states.
