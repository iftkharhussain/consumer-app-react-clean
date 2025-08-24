# AdvisorTypeBadge Component

A badge component that displays advisor types with colored dots to distinguish between different advisor categories.

## Features

- Displays advisor type with a colored dot indicator
- Supports different advisor types: Mortgage Broker, Insurance Broker, Financial Advisor
- Responsive design with proper spacing and typography
- Customizable styling through className prop

## Usage

```jsx
import { AdvisorTypeBadge } from 'components';

// Basic usage
<AdvisorTypeBadge type="Mortgage Broker" />
<AdvisorTypeBadge type="Insurance Broker" />
<AdvisorTypeBadge type="Financial Advisor" />

// With custom className
<AdvisorTypeBadge type="Mortgage Broker" className="custom-style" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | string | - | The advisor type to display (required) |
| `className` | string | `''` | Additional CSS classes |
| `...props` | object | - | Additional props passed to the container div |

## Supported Types

- **Mortgage Broker** - Blue dot (#2E90FA)
- **Insurance Broker** - Green dot (#17B26A)  
- **Financial Advisor** - Indigo dot (#6366F1)
- **Default** - Gray dot (#717680) for any other type

## Styling

The component uses CSS modules for scoped styling. The main styles include:
- Flexible container with proper padding and spacing
- 8px circular dot indicator
- 12px Inter font with medium weight
- Border and shadow for visual depth
- Responsive gap between dot and text

## Example Output

The component renders as a small badge with a colored dot followed by the advisor type text, styled according to the provided design specifications.
