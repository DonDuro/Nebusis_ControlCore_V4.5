# Nebusis® ControlCore v4.5
## Universal Internal Control Framework Platform
### Production Deployment Package - July 30, 2025

---

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone https://github.com/nebusis/controlcore.git
cd controlcore
npm install

# 2. Configure environment
cp .env.v4.5.production .env
# Edit .env with your actual values

# 3. Deploy
chmod +x deploy.v4.5.sh
./deploy.v4.5.sh
```

---

## 📋 Version 4.5 Features

### ✨ New in v4.5
- **Enhanced Document Analysis** - AI-powered COSO/INTOSAI framework mapping
- **Comprehensive Bilingual Glossary** - 89+ terms in English/Spanish
- **Advanced Workflow Assessments** - Automated fidelity scoring and PDF reports
- **Fixed Navigation System** - Reliable back buttons and routing
- **Professional PDF Generation** - Complete assessment reports with branding

### 🏗️ Core Features
- **Bilingual Interface** - Complete English/Spanish translation system
- **Framework Support** - COSO and INTOSAI standards compliance
- **Real-time Analytics** - Interactive dashboards and progress tracking
- **Document Management** - Upload, categorize, and analyze institutional documents
- **Workflow Engine** - Step-by-step compliance process management
- **User Management** - Multi-role authentication with professional profiles

---

## 🛠 Technology Stack

### Frontend
- **React 18.3** - Modern UI framework
- **TypeScript 5.6** - Type-safe development
- **Tailwind CSS 3.4** - Utility-first styling
- **Radix UI** - Accessible component primitives  
- **TanStack Query 5.6** - Server state management
- **Wouter 3.3** - Lightweight routing
- **Recharts 2.15** - Data visualization

### Backend
- **Node.js 20+** - Server runtime
- **Express.js 4.21** - Web framework
- **PostgreSQL** - Primary database
- **Drizzle ORM 0.39** - Type-safe database queries
- **PDFKit 0.15** - PDF generation
- **Zod 3.24** - Schema validation

### AI & Analysis
- **Anthropic Claude** - Document analysis
- **OpenAI GPT** - Alternative AI provider
- **SendGrid** - Email notifications
- **Stripe** - Payment processing

---

## 🌐 Deployment Platforms

### Render (Recommended)
```bash
# Build Command
npm run build

# Start Command  
npm start

# Environment Variables
DATABASE_URL=postgresql://...
SESSION_SECRET=your-64-char-secret
ANTHROPIC_API_KEY=your-api-key
```

### Railway
```bash
# Auto-detects Node.js
# Just connect GitHub repo and configure environment variables
```

### Vercel
```bash
# Uses vercel.json (auto-created by deploy script)
npm install -g vercel
vercel --prod
```

### AWS Elastic Beanstalk
```bash
# Uses .platform directory (auto-created)
eb init
eb create production
eb deploy
```

---

## 📁 Project Structure

```
nebusis-controlcore-v4.5/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # Application routes
│   │   ├── i18n/                   # Translation system
│   │   ├── data/                   # Static data (glossary, etc)
│   │   └── lib/                    # Utilities
├── server/                          # Express backend
│   ├── index.ts                    # Main server
│   ├── routes.ts                   # API endpoints (45+)
│   ├── storage.ts                  # Database interface
│   └── seed-simple.ts              # Database seeding
├── shared/                          # Shared TypeScript schemas
│   └── schema.ts                   # Database & validation schemas
├── attached_assets/                 # Static assets & uploads
├── package.v4.5.production.json    # Production dependencies
├── vite.config.v4.5.production.ts  # Build configuration
├── .env.v4.5.production            # Environment template
├── deploy.v4.5.sh                  # Universal deployment script
└── README.v4.5.production.md       # This file
```

---

## ⚙️ Configuration

### Required Environment Variables
```bash
# Database (REQUIRED)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Security (REQUIRED)  
SESSION_SECRET=your-ultra-secure-64-character-secret-key

# Node Environment
NODE_ENV=production
```

### Optional Features
```bash
# AI Document Analysis
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key

# Email Notifications
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=notifications@yourdomain.com

# Payment Processing
STRIPE_SECRET_KEY=sk_live_your-stripe-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-public-key

# Cloud Storage (Optional)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=your-bucket-name
```

---

## 🗄️ Database Schema

### Core Tables (13 total)
- **users** - Authentication and profiles
- **institutions** - Government/organization entities  
- **workflows** - COSO/INTOSAI component processes
- **workflow_steps** - Individual process tasks
- **evidence** - Supporting documents and files
- **institution_documents** - Document categorization
- **assessment_reports** - Framework compliance reports
- **assessment_responses** - Checklist responses
- **workflow_execution_assessments** - Process fidelity analysis
- **planning_objectives** - Strategic planning integration
- **objective_resources** - Resource allocation tracking
- **checklist_items** - Verification requirements
- **activities** - Audit trail and logging

---

## 📊 API Endpoints (45+)

### Authentication
```
POST   /api/auth/login           # User authentication
GET    /api/auth/user            # Current user info
POST   /api/auth/logout          # Session termination
```

### Core Data Management
```
GET    /api/institutions/:id     # Institution details
GET    /api/workflows            # Available workflows
POST   /api/workflows            # Create workflow
GET    /api/workflows/:id        # Workflow details
```

### Version 4.5 Features
```
GET    /api/documents/:id/analyze           # AI document analysis
GET    /api/workflow-execution-assessments  # Assessment reports
GET    /api/assessment-reports/:id/pdf      # PDF generation
POST   /api/planning/objectives             # Strategic planning
```

### Enhanced Reporting
```
GET    /api/assessment-reports/:institutionId    # Framework reports
GET    /api/compliance-scores/:institutionId     # Compliance metrics
GET    /api/activities/:institutionId            # Activity logs
```

---

## 🚀 Deployment Instructions

### 1. GitHub Repository Setup
```bash
git init
git add .
git commit -m "Initial commit - ControlCore v4.5"
git branch -M main
git remote add origin https://github.com/yourusername/controlcore.git
git push -u origin main
```

### 2. Cloud Platform Deployment
Choose your preferred platform and follow the deployment script:

```bash
# Make deployment script executable
chmod +x deploy.v4.5.sh

# Run deployment (auto-detects platform)
./deploy.v4.5.sh
```

### 3. Environment Configuration
1. Copy `.env.v4.5.production` to `.env`
2. Configure required variables (DATABASE_URL, SESSION_SECRET)
3. Add optional API keys for enhanced features
4. Deploy and test

---

## 🔒 Security Features

### Production Security
- **Session Management** - Secure cookie-based authentication
- **Input Validation** - Zod schema validation on all inputs
- **SQL Injection Protection** - Parameterized queries via Drizzle ORM
- **XSS Protection** - Content Security Policy headers
- **Rate Limiting** - API request throttling
- **CORS Configuration** - Cross-origin request control

### Data Protection
- **Database Encryption** - SSL/TLS connections required
- **File Upload Security** - Type validation and size limits
- **User Data Privacy** - GDPR/CCPA compliant data handling
- **API Key Management** - Environment-based secret storage

---

## 📈 Performance Features

### Frontend Optimizations
- **Code Splitting** - Lazy loading of route components
- **Bundle Optimization** - Vendor/UI/utility chunk separation
- **Tree Shaking** - Unused code elimination
- **Compression** - Gzip/Brotli asset compression
- **Caching** - Aggressive static asset caching

### Backend Optimizations
- **Connection Pooling** - Database connection reuse
- **Query Optimization** - Indexed database queries
- **Background Jobs** - Asynchronous processing
- **Memory Management** - Efficient data structures
- **Error Handling** - Comprehensive error boundaries

---

## 🧪 Testing & Quality

### Automated Testing
```bash
# Run test suite
npm test

# Coverage report
npm run test:coverage

# Type checking
npm run check

# Linting
npm run lint
```

### Manual Testing Checklist
- [ ] User authentication flow
- [ ] Document upload and analysis  
- [ ] Workflow creation and execution
- [ ] PDF report generation
- [ ] Bilingual interface switching
- [ ] Assessment scoring accuracy
- [ ] Email notification delivery
- [ ] Database backup/restore

---

## 📞 Support & Documentation

### Technical Support
- **Documentation** - Comprehensive user guides in Spanish/English
- **API Reference** - Complete endpoint documentation
- **Video Tutorials** - Step-by-step feature walkthroughs
- **Knowledge Base** - Common issues and solutions

### Enterprise Support
- **Email** - support@nebusis.com
- **Phone** - +1 (555) NEBUSIS
- **Slack** - Enterprise client workspace
- **Custom Training** - On-site implementation assistance

---

## 🛠️ Development and Customization

### Making Changes to the Application
For detailed instructions on how to edit and customize the application, see the comprehensive **Developer Guide**:

📖 **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - Complete technical guide covering:
- Adding new pages and components
- Creating API endpoints
- Database modifications
- Styling and theming
- Translation management
- Testing and deployment workflows

📋 **[USER_GUIDE.md](USER_GUIDE.md)** - Comprehensive end-user guide covering:
- Dashboard and navigation
- Workflow management (COSO framework)
- Document management and AI analysis
- Assessment report generation
- Glossary system usage
- Planning module and user profiles

### Quick Development Setup
```bash
# Clone and setup
git clone your-repo-url
cd nebusis-controlcore-v4.5-27jan2025
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database URL

# Setup database and start development
npm run db:push
npm run dev
```

### Common Editing Tasks
- **Add new pages**: Create component in `client/src/pages/`, add route in `App.tsx`
- **Modify dashboard**: Edit `client/src/pages/dashboard.tsx`
- **Add API endpoints**: Define in `server/routes.ts`, implement in `server/storage.ts`
- **Update translations**: Edit files in `client/src/i18n/translations/`
- **Change styling**: Modify Tailwind classes or `client/src/index.css`

---

## 📝 License & Copyright

**Proprietary Software**
Copyright © 2025 Nebusis Cloud Services, LLC
All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or modification is strictly prohibited.

---

## 🎯 Version History

### v4.5.0 (July 30, 2025)
- Enhanced document analysis with AI framework mapping
- Comprehensive bilingual glossary system (89+ terms)
- Fixed navigation and PDF generation issues
- Advanced workflow assessment capabilities
- Production-ready deployment package

### v4.4.0 (January 26, 2025)
- Enhanced planning module with real-time analytics
- Split-layout interface optimization
- Comprehensive backup documentation

### v4.1.0 (January 24, 2025)
- Complete bilingual transformation
- Universal framework support (COSO/INTOSAI)
- Marketing pages and branding consistency

---

**🎉 Your Nebusis® ControlCore v4.5 is ready for production deployment!**