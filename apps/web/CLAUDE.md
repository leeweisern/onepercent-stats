# One Percent Stats - Web Application

This document contains development guidelines specifically for the web application (`apps/web/`) of the One Percent Stats project.

## 🎯 Quick Reference

**Runtime**: Bun (not npm/yarn/pnpm)  
**Frontend**: React 18 with Vite  
**UI Framework**: shadcn/ui + Tailwind CSS  
**Authentication**: better-auth  
**Routing**: React Router 7  
**State Management**: React hooks + Context API  
**Charts**: shadcn/ui Chart components (Recharts)  
**Build Tool**: Vite  
**Deployment**: Cloudflare Pages


## 🏗️ Architecture

### File Structure
```
src/
├── components/
│   ├── ui/                       # shadcn/ui components (Button, Card, etc.)
│   ├── advertising-costs.tsx     # Feature-specific components
│   ├── leads-filters.tsx
│   ├── monthly-growth-chart.tsx
│   └── ...
├── hooks/
│   └── use-mobile.ts             # Custom React hooks
├── lib/
│   ├── auth-client.ts            # better-auth client configuration
│   ├── date-utils.ts             # Date utility functions
│   └── utils.ts                  # General utilities (cn, etc.)
├── routes/
│   ├── _index.tsx                # Homepage
│   ├── analytics.tsx             # Analytics dashboard
│   ├── leads.tsx                 # Leads management
│   ├── login.tsx                 # Authentication
│   └── ...
├── index.css                     # Tailwind CSS + custom styles
├── root.tsx                      # App root component
└── routes.ts                     # Route definitions
```

### Component Organization
- **`components/ui/`**: shadcn/ui base components (never modify these directly)
- **`components/`**: Application-specific components
- **`routes/`**: Page components that correspond to URL routes
- **`lib/`**: Utility functions and configuration
- **`hooks/`**: Reusable React hooks

## 📋 Coding Standards

### Naming Conventions
- **Components**: PascalCase (`LeadsTable`, `MonthlyGrowthChart`)
- **Files**: kebab-case for all files (`leads-table.tsx`, `monthly-growth-chart.tsx`)
- **Variables**: camelCase (`leadsData`, `isLoading`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE_URL`)

### Import Organization
```tsx
// 1. React and external libraries
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'

// 2. UI components (shadcn/ui first, then custom)
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LeadsFilters } from '@/components/leads-filters'

// 3. Hooks and utilities
import { useMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'

// 4. Types (if needed)
import type { Lead } from '@/types/lead'
```

## 🎨 UI Components & Styling

### Available shadcn/ui Components
Current components in `src/components/ui/`:
- Badge, Button, Card, Chart, Checkbox
- Dialog, Dropdown Menu, Input, Label
- Select, Separator, Sheet, Sidebar
- Skeleton, Sonner, Table, Textarea, Tooltip

### Component Usage Patterns
```tsx
// Badge for status indicators
<Badge variant="success">Closed</Badge>
<Badge variant="secondary">{lead.platform}</Badge>

// Cards for content sections
<Card>
  <CardHeader>
    <CardTitle>Monthly Growth</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Chart or content */}
  </CardContent>
</Card>

// Tables for data display
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Platform</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {leads.map(lead => (
      <TableRow key={lead.id}>
        <TableCell>{lead.name}</TableCell>
        <TableCell>
          <Badge variant="secondary">{lead.platform}</Badge>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Chart Components
```tsx
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from 'recharts'

// Chart configuration
const chartConfig = {
  leads: {
    label: "Leads",
    color: "hsl(var(--chart-1))",
  },
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-2))",
  },
}

// Chart component
<ChartContainer config={chartConfig} className="h-[300px]">
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <XAxis dataKey="month" />
      <YAxis />
      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
      <Bar dataKey="leads" fill="var(--color-leads)" />
      <Bar dataKey="sales" fill="var(--color-sales)" />
    </BarChart>
  </ResponsiveContainer>
</ChartContainer>
```

### Responsive Design
```tsx
// Use Tailwind responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards or components */}
</div>

// Use the mobile hook for JavaScript logic
const isMobile = useMobile()
```

## 🔐 Authentication

### better-auth Integration
```tsx
// Auth client setup (already configured in lib/auth-client.ts)
import { authClient } from '@/lib/auth-client'

// Session management
const { data: session, isPending, error } = authClient.useSession()

// Sign in
const handleSignIn = async (email: string, password: string) => {
  try {
    await authClient.signIn.email({ email, password })
    // Handle success (user will be redirected by protected routes)
  } catch (error) {
    // Handle error
  }
}

// Sign out
const handleSignOut = async () => {
  await authClient.signOut()
}
```

### Protected Routes
```tsx
import { ProtectedRoute } from '@/components/protected-route'

// Wrap routes that require authentication
<ProtectedRoute>
  <LeadsDashboard />
</ProtectedRoute>
```

### Authentication States
```tsx
// Loading state
if (isPending) {
  return <div className="flex items-center justify-center h-screen">
    <Loader />
  </div>
}

// Error state
if (error) {
  return <div>Error: {error.message}</div>
}

// Authenticated
if (session) {
  return <DashboardContent user={session.user} />
}

// Not authenticated
return <Navigate to="/login" replace />
```

## 📊 Data Fetching & State Management

### API Calls
```tsx
// Using native fetch (no external state management library yet)
const [leads, setLeads] = useState<Lead[]>([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  const fetchLeads = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/leads')
      if (!response.ok) throw new Error('Failed to fetch leads')
      
      const data = await response.json()
      setLeads(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  fetchLeads()
}, [])
```

### Local State Patterns
```tsx
// Form state
const [formData, setFormData] = useState({
  name: '',
  email: '',
  platform: ''
})

// Filter state
const [filters, setFilters] = useState({
  platform: '',
  status: '',
  dateRange: null
})

// Modal/dialog state
const [isOpen, setIsOpen] = useState(false)
const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
```

## 🎯 Common Patterns

### Loading States
```tsx
// Skeleton loading for tables
if (isLoading) {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  )
}

// Spinner for buttons
<Button disabled={isLoading}>
  {isLoading ? <Spinner className="mr-2" /> : null}
  Save Changes
</Button>
```

### Error Handling
```tsx
// Toast notifications for errors
import { toast } from 'sonner'

const handleSave = async () => {
  try {
    await saveData()
    toast.success('Data saved successfully!')
  } catch (error) {
    toast.error('Failed to save data. Please try again.')
  }
}
```

### Form Handling
```tsx
// Basic form with validation
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  
  // Basic validation
  if (!formData.name.trim()) {
    toast.error('Name is required')
    return
  }
  
  // Submit form
  handleSave()
}

<form onSubmit={handleSubmit}>
  <div className="space-y-4">
    <div>
      <Label htmlFor="name">Name</Label>
      <Input
        id="name"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({
          ...prev,
          name: e.target.value
        }))}
        placeholder="Enter name"
      />
    </div>
    <Button type="submit" disabled={isLoading}>
      Save
    </Button>
  </div>
</form>
```

## 🎨 Styling Guidelines

### Tailwind Usage
```tsx
// Use semantic spacing
<div className="p-4 md:p-6 lg:p-8">

// Use consistent color palette
<div className="bg-background text-foreground">
<div className="bg-muted text-muted-foreground">
<div className="bg-primary text-primary-foreground">

// Responsive design
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Custom CSS Variables
```css
/* Available in index.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* etc... */
}
```

## ⚠️ Common Pitfalls

### ❌ DON'T
- Modify shadcn/ui components directly in `components/ui/`
- Use hardcoded colors instead of CSS variables
- Forget error handling for async operations
- Skip loading states for better UX
- Use `console.log` in production code
- Ignore TypeScript errors
- Use `any` type without good reason
- Mix different state management patterns inconsistently

### ✅ DO
- Extend shadcn/ui components by creating wrapper components
- Use Tailwind classes with CSS variables (`bg-primary`, `text-foreground`)
- Always handle loading and error states
- Use proper TypeScript types
- Use `toast` notifications for user feedback
- Follow the established file structure
- Use the `cn` utility for conditional classes
- Keep components focused and single-purpose

## 🔧 Development Tools

### VS Code Extensions
Recommended extensions for this project:
- Tailwind CSS IntelliSense
- TypeScript Importer
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag
- Prettier (if not using Biome)

### Environment Setup
```bash
# Make sure you're using Bun
bun --version

# Install dependencies
bun install

# Start development server
bun run dev
```

### Build & Deploy
```bash
# Production build
bun run build

# Preview build locally
bun run preview

# Deploy to Cloudflare Pages (configured in wrangler.jsonc)
wrangler pages deploy dist
```

## 📚 Key Dependencies

### Core
- `react` (18.x) - UI library
- `react-router` (7.x) - Client-side routing
- `vite` - Build tool and dev server

### Authentication
- `better-auth` - Authentication library
- `better-auth/react` - React integration

### UI & Styling
- `@radix-ui/*` - Headless UI components
- `tailwindcss` - Utility-first CSS framework
- `lucide-react` - Icon library
- `class-variance-authority` - CSS class utilities
- `tailwind-merge` - Merge Tailwind classes
- `recharts` - Chart library

### Utilities
- `clsx` - Conditional class names
- `sonner` - Toast notifications

---

**Remember**: Always prioritize user experience, accessibility, and maintainable code. When in doubt, check existing components and patterns in the codebase before creating new ones.
