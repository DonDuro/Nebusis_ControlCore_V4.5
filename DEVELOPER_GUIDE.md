# Nebusis® ControlCore v4.5 - Developer Guide
## How to Edit and Customize the Application
### Updated: July 30, 2025

---

## 🛠️ Development Setup

### Prerequisites
```bash
# Required software
Node.js 20+ (recommended: 20.11.0)
npm 10+ 
PostgreSQL 14+
Git
Code editor (VS Code recommended)
```

### Initial Setup
```bash
# 1. Clone or extract the application
git clone https://github.com/yourusername/controlcore.git
# OR extract from ZIP file
unzip nebusis-controlcore-v4.5-27jan2025.zip

# 2. Navigate to project directory
cd nebusis-controlcore-v4.5-27jan2025

# 3. Install dependencies
npm install

# 4. Set up environment
cp .env.example .env
# Edit .env with your database URL and other settings

# 5. Set up database
npm run db:push

# 6. Start development server
npm run dev
```

---

## 📁 Project Structure & How to Edit

### Frontend (React/TypeScript)
```
client/src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, forms, etc.)
│   ├── BrandName.tsx   # Product branding component
│   ├── Header.tsx      # Main application header
│   └── SidebarSimple.tsx # Navigation sidebar
├── pages/              # Application pages/routes
│   ├── dashboard.tsx   # Main dashboard
│   ├── login.tsx       # Authentication page
│   ├── documents.tsx   # Document management
│   ├── workflows.tsx   # Workflow management
│   └── glossary.tsx    # Bilingual glossary
├── i18n/               # Translation system
│   └── translations/   # Language files (en.ts, es.ts)
├── data/               # Static data files
│   ├── coso-workflows.ts    # COSO framework definitions
│   ├── coso-glossary.ts     # Glossary terms
│   └── glossary-translations.ts # Translated terms
├── lib/                # Utilities and configurations
└── App.tsx            # Main application and routing
```

### Backend (Express.js/TypeScript)
```
server/
├── index.ts           # Main server entry point
├── routes.ts          # API endpoint definitions (45+ endpoints)
├── storage.ts         # Database interface layer
├── database-storage.ts # PostgreSQL implementation
├── seed-simple.ts     # Database seeding
└── services/          # Business logic services
```

### Shared Code
```
shared/
└── schema.ts          # Database schemas and TypeScript types
```

---

## 🎨 Common Editing Tasks

### 1. Adding New Pages

#### Step 1: Create the Page Component
```typescript
// client/src/pages/my-new-page.tsx
import { useTranslation } from '@/lib/i18n';

export default function MyNewPage() {
  const { t } = useTranslation();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{t('myPage.title')}</h1>
      <p>{t('myPage.description')}</p>
    </div>
  );
}
```

#### Step 2: Add Route to App.tsx
```typescript
// client/src/App.tsx
import MyNewPage from '@/pages/my-new-page';

// Add to the routing section:
<Route path="/my-new-page" component={MyNewPage} />
```

#### Step 3: Add Navigation Link
```typescript
// client/src/components/SidebarSimple.tsx
// Add to navigation items array:
{
  label: t('nav.myNewPage'),
  href: '/my-new-page',
  icon: YourIcon
}
```

#### Step 4: Add Translations
```typescript
// client/src/i18n/translations/en.ts
export const en = {
  // ... existing translations
  nav: {
    // ... existing nav items
    myNewPage: "My New Page"
  },
  myPage: {
    title: "My New Page Title",
    description: "Page description here"
  }
};

// client/src/i18n/translations/es.ts
export const es = {
  // ... existing translations
  nav: {
    // ... existing nav items
    myNewPage: "Mi Nueva Página"
  },
  myPage: {
    title: "Título de Mi Nueva Página",
    description: "Descripción de la página aquí"
  }
};
```

### 2. Adding New API Endpoints

#### Step 1: Define Database Schema (if needed)
```typescript
// shared/schema.ts
export const myNewTable = pgTable('my_new_table', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type MyNewItem = typeof myNewTable.$inferSelect;
export type InsertMyNewItem = typeof myNewTable.$inferInsert;
```

#### Step 2: Add Storage Methods
```typescript
// server/storage.ts
export interface IStorage {
  // ... existing methods
  getMyNewItems(): Promise<MyNewItem[]>;
  createMyNewItem(item: InsertMyNewItem): Promise<MyNewItem>;
  updateMyNewItem(id: number, updates: Partial<InsertMyNewItem>): Promise<MyNewItem>;
  deleteMyNewItem(id: number): Promise<void>;
}

// server/database-storage.ts
// Implement the methods in DatabaseStorage class
async getMyNewItems(): Promise<MyNewItem[]> {
  return await this.db.select().from(myNewTable);
}

async createMyNewItem(item: InsertMyNewItem): Promise<MyNewItem> {
  const [result] = await this.db.insert(myNewTable).values(item).returning();
  return result;
}
```

#### Step 3: Add API Routes
```typescript
// server/routes.ts
// Add to the router setup:
app.get('/api/my-new-items', async (req, res) => {
  try {
    const items = await storage.getMyNewItems();
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.post('/api/my-new-items', async (req, res) => {
  try {
    const item = await storage.createMyNewItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});
```

#### Step 4: Use in Frontend
```typescript
// In your React component
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function MyComponent() {
  const queryClient = useQueryClient();
  
  // Fetch data
  const { data: items, isLoading } = useQuery({
    queryKey: ['/api/my-new-items'],
    queryFn: () => fetch('/api/my-new-items').then(res => res.json())
  });
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: (newItem) => 
      fetch('/api/my-new-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-new-items'] });
    }
  });
  
  return (
    <div>
      {isLoading ? <div>Loading...</div> : null}
      {items?.map(item => <div key={item.id}>{item.name}</div>)}
      <button onClick={() => createMutation.mutate({ name: 'New Item' })}>
        Add Item
      </button>
    </div>
  );
}
```

### 3. Modifying Existing Components

#### Editing the Dashboard
```typescript
// client/src/pages/dashboard.tsx
// The dashboard is composed of several sections:

// 1. Stats Cards - Edit the metrics displayed
const statsData = [
  { title: "Your Metric", value: "123", icon: YourIcon },
  // Add or modify metrics here
];

// 2. Charts - Modify the chart data
const chartData = [
  { name: 'Item 1', value: 100 },
  // Modify chart data here
];

// 3. Recent Activity - Change what activities are shown
// This pulls from the activities API - edit server/routes.ts to modify
```

#### Editing the Header
```typescript
// client/src/components/Header.tsx
// Key areas to modify:

// 1. Logo/Branding
<BrandName /> // Controlled by components/BrandName.tsx

// 2. User Menu
// Look for the DropdownMenu component to add/remove menu items

// 3. Navigation Buttons
// Mobile and desktop navigation button arrays
```

#### Editing the Sidebar
```typescript
// client/src/components/SidebarSimple.tsx
// Main navigation is controlled by arrays:

const mainNavItems = [
  { label: t('nav.dashboard'), href: '/dashboard', icon: Home },
  // Add/remove/reorder navigation items here
];

const advancedNavItems = [
  { label: t('nav.planning'), href: '/planning', icon: Target },
  // Advanced features navigation
];
```

### 4. Styling and Theming

#### Modifying Colors and Styles
```css
/* client/src/index.css */
/* Global CSS variables for theming */
:root {
  --primary: 210 40% 98%;      /* Main brand color */
  --primary-foreground: 222.2 84% 4.9%;
  --background: 0 0% 100%;     /* Page background */
  --foreground: 222.2 84% 4.9%; /* Text color */
  /* Edit these to change the overall theme */
}
```

#### Component-Specific Styling
```typescript
// Using Tailwind CSS classes in components
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Custom styled content
</div>

// For complex styling, create new CSS classes in index.css
```

### 5. Adding New Translations

```typescript
// client/src/i18n/translations/en.ts
export const en = {
  // Add new translation keys
  newFeature: {
    title: "New Feature Title",
    subtitle: "Feature description",
    buttons: {
      save: "Save",
      cancel: "Cancel"
    }
  }
};

// client/src/i18n/translations/es.ts
export const es = {
  // Add Spanish translations
  newFeature: {
    title: "Título de Nueva Funcionalidad",
    subtitle: "Descripción de funcionalidad",
    buttons: {
      save: "Guardar",
      cancel: "Cancelar"
    }
  }
};

// Use in components:
const { t } = useTranslation();
<h1>{t('newFeature.title')}</h1>
```

---

## 🗄️ Database Modifications

### Adding New Tables
```typescript
// 1. Define schema in shared/schema.ts
export const newTable = pgTable('new_table', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  // ... other fields
});

// 2. Update storage interface in server/storage.ts
export interface IStorage {
  // Add new methods for the table
  getNewTableItems(): Promise<NewTableItem[]>;
}

// 3. Implement in server/database-storage.ts
async getNewTableItems(): Promise<NewTableItem[]> {
  return await this.db.select().from(newTable);
}

// 4. Push changes to database
npm run db:push
```

### Modifying Existing Tables
```typescript
// 1. Edit schema in shared/schema.ts
export const existingTable = pgTable('existing_table', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  newField: text('new_field'), // Add new field
});

// 2. Update TypeScript types (automatic with Drizzle)

// 3. Push changes
npm run db:push

// WARNING: Be careful with breaking changes!
// Consider data migration scripts for production
```

---

## 🧪 Testing Your Changes

### Running the Development Server
```bash
# Start development mode (auto-reloads on changes)
npm run dev

# Access at http://localhost:5000
# Frontend at http://localhost:3000 (proxied to backend)
```

### Testing API Endpoints
```bash
# Test with curl
curl -X GET http://localhost:5000/api/your-endpoint

# Or use a tool like Postman/Insomnia
```

### Type Checking
```bash
# Check for TypeScript errors
npm run check

# Fix linting issues
npm run lint
```

### Building for Production
```bash
# Build the application
npm run build

# Test production build locally
npm start
```

---

## 🔧 Configuration Changes

### Environment Variables
```bash
# .env file - modify these values:
DATABASE_URL=postgresql://user:pass@host:5432/db
SESSION_SECRET=your-secure-secret-key

# Add new environment variables:
NEW_FEATURE_ENABLED=true
EXTERNAL_API_KEY=your-api-key

# Use in code:
const isEnabled = process.env.NEW_FEATURE_ENABLED === 'true';
```

### Build Configuration
```typescript
// vite.config.ts - modify build settings
export default defineConfig({
  // Change build output directory
  build: {
    outDir: 'custom-dist-folder',
  },
  
  // Add new aliases
  resolve: {
    alias: {
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },
});
```

---

## 🚀 Deployment After Changes

### Development Deployment
```bash
# 1. Test locally
npm run dev

# 2. Build and test production
npm run build
npm start

# 3. Run deployment script
./deploy.sh
```

### Git Workflow
```bash
# 1. Create feature branch
git checkout -b feature/my-new-feature

# 2. Make changes and commit
git add .
git commit -m "Add new feature: description"

# 3. Push and create pull request
git push origin feature/my-new-feature

# 4. Merge to main and deploy
git checkout main
git merge feature/my-new-feature
git push origin main
```

---

## 🐛 Troubleshooting Common Issues

### Database Issues
```bash
# Reset database schema
npm run db:push

# If schema conflicts, drop and recreate
# (WARNING: This deletes all data!)
# Connect to PostgreSQL and run: DROP DATABASE controlcore;
# Then recreate and run: npm run db:push
```

### Build Issues
```bash
# Clear build cache
rm -rf dist/ node_modules/.vite/
npm run build

# TypeScript errors
npm run check
# Fix errors shown in output
```

### Runtime Errors
```bash
# Check server logs
npm run dev
# Look for error messages in console

# Check browser console for frontend errors
# Open Developer Tools > Console
```

### Port Conflicts
```bash
# If port 5000 is in use, kill the process:
lsof -ti:5000 | xargs kill -9

# Or change port in server/index.ts:
const PORT = process.env.PORT || 5001;
```

---

## 📚 Additional Resources

### Code Style Guidelines
- Use TypeScript for all new code
- Follow existing naming conventions (camelCase for variables, PascalCase for components)
- Add proper error handling for all API calls
- Include loading states for all async operations
- Use the translation system for all user-facing text

### Performance Best Practices
- Use React Query for all API calls
- Implement proper loading states
- Use code splitting for large components
- Optimize images and assets
- Cache API responses appropriately

### Security Considerations
- Never expose API keys in frontend code
- Validate all user inputs on the backend
- Use prepared statements for database queries (Drizzle handles this)
- Implement proper authentication checks
- Sanitize user-uploaded files

---

## 🆘 Getting Help

### Documentation
- Review existing code patterns before adding new features
- Check the database schema in `shared/schema.ts`
- Look at similar components for reference

### Common Patterns
- Page components: Look at `pages/dashboard.tsx`
- API endpoints: Look at `server/routes.ts`
- Database operations: Look at `server/database-storage.ts`
- UI components: Look at `components/ui/` directory

### Before Making Changes
1. Understand the existing code structure
2. Test your changes locally
3. Consider impact on existing features
4. Update translations if adding user-facing text
5. Follow the established patterns and conventions

---

**Happy coding! Your Nebusis® ControlCore v4.5 is ready for customization and enhancement.** 🚀