# TicketFlow - Dynamic Form Management System

A modern Angular application built with Angular 17+ featuring a schema-driven dynamic form renderer with enterprise-grade UX, accessibility compliance, and responsive design.

## 🚀 Features

### Core Features
- **Schema-Driven Dynamic Forms**: Build complex forms from JSON schemas with validation and conditional logic
- **Responsive Split Layout**: Form (70%) and ticket summary (30%) with mobile-first design
- **Real-time Form Validation**: Inline validation with debounced updates
- **Conditional Field Logic**: Show/hide fields and sections based on other field values
- **Repeatable Sections**: Add/remove form sections dynamically
- **Auto-save Functionality**: Configurable auto-save with draft management
- **Accessibility Compliant**: WCAG 2.1 AA compliance with proper ARIA attributes

### UI/UX Features
- **Material Design**: Custom Angular Material theme with TicketFlow branding
- **Sticky Action Bar**: Always-visible save/cancel actions
- **Bottom Tabs**: Full-width tabs for Comments and History
- **Mobile Drawer**: Collapsible ticket summary on mobile devices
- **Loading States**: Smooth loading animations and error handling
- **Status Indicators**: Color-coded badges for status, priority, and SLA

### Technical Features
- **Standalone Components**: Modern Angular 17+ architecture
- **OnPush Change Detection**: Optimized performance
- **RxJS State Management**: Lightweight reactive state handling
- **Type Safety**: Comprehensive TypeScript interfaces
- **Design Tokens**: CSS custom properties for consistent theming
- **8px Grid System**: Consistent spacing and layout

## 🛠 Technology Stack

- **Framework**: Angular 17+ (Standalone Components)
- **UI Library**: Angular Material (MDC) with custom theme
- **Forms**: Reactive Forms with dynamic schema rendering
- **State Management**: RxJS observables and services
- **Styling**: SCSS with design tokens and utility classes
- **Icons**: Material Icons
- **Testing**: Jest/Karma + Jasmine (unit), Playwright/Cypress (e2e)
- **Linting**: ESLint + Prettier
- **Accessibility**: WCAG 2.1 AA compliance

## 🏗 Architecture

### Project Structure
```
src/
├── app/
│   ├── core/                 # Core services and guards
│   ├── shared/               # Shared components, models, services
│   │   ├── models/          # TypeScript interfaces and types
│   │   └── services/        # Dynamic form service and utilities
│   └── features/            # Feature modules
│       └── ticket/          # Ticket management feature
│           ├── pages/       # Page-level components
│           └── components/  # Feature-specific components
├── assets/                  # Static assets
└── styles.scss             # Global styles and theme
```

### Key Components

#### Dynamic Form Service (`DynamicFormService`)
- Converts JSON schema to reactive forms
- Handles validation and conditional logic
- Manages repeatable sections
- Provides form state management

#### Ticket Detail Component (`TicketDetailComponent`)
- Main page component with responsive layout
- Integrates dynamic form rendering
- Manages auto-save and validation
- Handles mobile/desktop view switching

## 📋 Form Schema Structure

The dynamic forms are driven by JSON schemas with the following structure:

```typescript
interface FormSchema {
  id: string;
  title: string;
  sections: FormSection[];
}

interface FormSection {
  id: string;
  title: string;
  collapsible: boolean;
  repeatable: boolean;
  fields: FormField[];
  visibleWhen?: ConditionalRule[];
}

interface FormField {
  id: string;
  label: string;
  type: FieldType;
  validators?: FieldValidator[];
  options?: FieldOption[];
  visibleWhen?: ConditionalRule[];
  // ... additional properties
}
```

### Supported Field Types
- `text` - Single line text input
- `textarea` - Multi-line text input
- `number` - Numeric input with validation
- `select` - Dropdown selection (single/multi)
- `radio` - Radio button group
- `checkbox` - Checkbox input
- `date` - Date picker
- `file` - File upload
- `group` - Nested field groups

### Conditional Logic
Fields and sections support conditional visibility:

```typescript
interface ConditionalRule {
  fieldId: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
}
```

## 🎨 Design System

### Color Palette
- **Primary**: TicketFlow Blue (`#1e3a8a`)
- **Secondary**: Neutral Gray (`#6b7280`)
- **Success**: `#059669`
- **Warning**: `#d97706`
- **Error**: `#dc2626`

### Typography
- **Font Family**: Segoe UI, Roboto, system fonts
- **Scale**: 12px - 32px following 8px grid system

### Spacing
- **Grid**: 8px base unit
- **Scale**: 4px, 8px, 16px, 24px, 32px, 48px

## 📱 Responsive Breakpoints

- **Mobile**: ≤ 767px (Single column, drawer summary)
- **Tablet**: 768px - 1279px (65% form, 35% summary)
- **Desktop**: ≥ 1280px (70% form, 30% summary)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Angular CLI 17+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ticketflow-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   Navigate to `http://localhost:4200`

### Available Scripts

```bash
# Development
npm start              # Start dev server
npm run build          # Build for production
npm run watch          # Build and watch for changes

# Testing
npm test               # Run unit tests
npm run e2e            # Run end-to-end tests

# Code Quality
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
```

## 🧪 Testing

### Unit Tests
- Form service validation logic
- Component rendering and interactions
- Conditional logic evaluation
- Error handling

### E2E Tests
- Complete form submission flow
- Responsive behavior testing
- Accessibility compliance verification
- Cross-browser compatibility

## ♿ Accessibility Features

### WCAG 2.1 AA Compliance
- Proper semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Screen reader compatibility

### Keyboard Navigation
- Tab order follows visual order
- Enter submits forms appropriately
- Escape closes modals/drawers
- Arrow keys navigate tabs

## 🔧 Configuration

### Environment Variables
```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  autoSaveInterval: 5000,
  enableAnalytics: false
};
```

### Form Configuration
```typescript
interface DynamicFormConfig {
  autoSave?: boolean;
  autoSaveInterval?: number;
  validateOnChange?: boolean;
  enableConditionalLogic?: boolean;
  debounceTime?: number;
}
```

## 📊 Performance Considerations

### Optimization Strategies
- OnPush change detection for all components
- TrackBy functions for ngFor loops
- Lazy loading of feature modules
- Debounced form validation and auto-save
- Virtual scrolling for large lists
- Image lazy loading

### Bundle Size Management
- Tree-shakable imports
- Code splitting by feature
- Lazy-loaded routes
- Optimized Material Design components

## 🚀 Deployment

### Build for Production
```bash
npm run build -- --prod
```

### Build Artifacts
- Static files in `dist/` folder
- Optimized bundles with hash versioning
- Service worker for caching (optional)

## 🔮 Future Enhancements

### Planned Features
- Rich text editor for textarea fields
- Drag & drop file uploads with preview
- Advanced field validation rules
- Field dependency graphs
- Form version history
- Offline mode support
- Real-time collaboration
- Advanced analytics and telemetry

### Integration Possibilities
- External form builders
- CRM systems integration
- Workflow automation
- Document generation
- Reporting and analytics platforms

## 🤝 Contributing

### Development Guidelines
1. Follow Angular style guide
2. Maintain accessibility standards
3. Write comprehensive tests
4. Document all public APIs
5. Use conventional commits

### Code Review Process
- All changes require review
- Automated testing must pass
- Accessibility audit required
- Performance impact assessment

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For questions and support:
- Create an issue in the repository
- Check the documentation
- Review the code examples

---

**Built with ❤️ using Angular 17+ and Material Design**
