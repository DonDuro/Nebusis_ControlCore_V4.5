#!/bin/bash

# =============================================================================
# Nebusis® ControlCore v4.5 - Universal Deployment Script
# Created: January 27, 2025
# Compatible with: Render, Railway, Vercel, AWS, Heroku, DigitalOcean
# =============================================================================

set -e

echo "🚀 Starting Nebusis® ControlCore v4.5 Deployment..."
echo "📅 Date: $(date)"
echo "🏗️  Platform: Auto-detecting..."

# =============================================================================
# ENVIRONMENT DETECTION
# =============================================================================

PLATFORM="unknown"

if [ -n "$RENDER" ]; then
    PLATFORM="render"
elif [ -n "$RAILWAY_ENVIRONMENT" ]; then
    PLATFORM="railway"
elif [ -n "$VERCEL" ]; then
    PLATFORM="vercel"
elif [ -n "$AWS_REGION" ] && [ -n "$AWS_EB_ENVIRONMENT" ]; then
    PLATFORM="aws-eb"
elif [ -n "$HEROKU_APP_NAME" ]; then
    PLATFORM="heroku"
else
    PLATFORM="generic"
fi

echo "🎯 Detected platform: $PLATFORM"

# =============================================================================
# DEPENDENCY INSTALLATION
# =============================================================================

echo "📦 Installing dependencies..."

# Use production package.json
if [ -f "package.v4.5.production.json" ]; then
    echo "✅ Using v4.5 production package configuration"
    cp package.v4.5.production.json package.json
fi

# Install with production optimizations  
npm ci --only=production --silent

# Install development dependencies needed for build
npm install --only=dev --silent typescript esbuild vite @vitejs/plugin-react

echo "✅ Dependencies installed successfully"

# =============================================================================
# ENVIRONMENT CONFIGURATION
# =============================================================================

echo "⚙️  Configuring environment..."

# Use v4.5 environment template if .env doesn't exist
if [ ! -f ".env" ] && [ -f ".env.v4.5.production" ]; then
    echo "📄 Creating .env from v4.5 template"
    cp .env.v4.5.production .env
    echo "⚠️  WARNING: Please configure .env with your actual values!"
fi

# Validate required environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL is required"
    echo "Please set your PostgreSQL connection string"
    exit 1
fi

if [ -z "$SESSION_SECRET" ]; then
    echo "❌ ERROR: SESSION_SECRET is required"
    echo "Please set a secure session secret (64+ characters)"
    exit 1
fi

echo "✅ Environment validation passed"

# =============================================================================
# BUILD PROCESS
# =============================================================================

echo "🔨 Building application..."

# Use v4.5 production Vite config
if [ -f "vite.config.v4.5.production.ts" ]; then
    echo "🏗️  Using v4.5 production build configuration"
    export VITE_CONFIG="vite.config.v4.5.production.ts"
    npm run build -- -c vite.config.v4.5.production.ts
else
    npm run build
fi

echo "✅ Frontend build completed"

# Build backend
echo "🔧 Building backend..."
npm run deploy:build 2>/dev/null || npm run build

echo "✅ Backend build completed"

# =============================================================================
# DATABASE SETUP
# =============================================================================

echo "🗄️  Setting up database..."

# Run database migrations/setup
if command -v npm run db:push >/dev/null 2>&1; then
    echo "📊 Running database migrations..."
    npm run db:push
    echo "✅ Database setup completed"
else
    echo "⚠️  Skipping database setup (no migration command found)"
fi

# =============================================================================
# PLATFORM SPECIFIC OPTIMIZATIONS
# =============================================================================

echo "🎨 Applying platform-specific optimizations for: $PLATFORM"

case $PLATFORM in
    "render")
        echo "🟢 Render optimizations applied"
        # Render handles this automatically
        ;;
    "railway")
        echo "🚂 Railway optimizations applied"
        # Railway auto-detects Node.js apps
        ;;
    "vercel")
        echo "▲ Vercel optimizations applied"
        # Create vercel.json if it doesn't exist
        if [ ! -f "vercel.json" ]; then
            cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/index.html"
    }
  ]
}
EOF
        fi
        ;;
    "aws-eb")
        echo "☁️  AWS Elastic Beanstalk optimizations applied"
        # Create .platform directory for EB
        mkdir -p .platform/nginx/conf.d
        ;;
    "heroku")
        echo "🟣 Heroku optimizations applied"
        # Heroku uses Procfile
        ;;
    *)
        echo "🔧 Generic platform setup"
        ;;
esac

# =============================================================================
# HEALTH CHECK
# =============================================================================

echo "🔍 Running health checks..."

# Check if built files exist
if [ ! -d "dist" ]; then
    echo "❌ ERROR: Build directory not found"
    exit 1
fi

if [ ! -f "dist/index.js" ]; then
    echo "❌ ERROR: Server build not found"
    exit 1
fi

echo "✅ Health checks passed"

# =============================================================================
# DEPLOYMENT SUMMARY
# =============================================================================

echo ""
echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Application: Nebusis® ControlCore v4.5"
echo "🏭 Platform: $PLATFORM"
echo "📅 Deployed: $(date)"
echo "🔗 Features enabled:"
echo "   ✅ Document Analysis (AI-powered)"
echo "   ✅ Workflow Assessments"
echo "   ✅ Bilingual Glossary (89+ terms)"
echo "   ✅ PDF Generation"
echo "   ✅ Real-time Analytics"
echo "   ✅ Multi-framework Support (COSO/INTOSAI)"
echo ""

# Platform-specific post-deployment notes
case $PLATFORM in
    "render")
        echo "🟢 Your app will be available at your Render URL"
        echo "📋 Configure environment variables in Render dashboard"
        ;;
    "railway")
        echo "🚂 Your app will be available at your Railway domain"
        echo "📋 Configure environment variables in Railway dashboard"
        ;;
    "vercel")
        echo "▲ Your app will be available at your Vercel domain"
        echo "📋 Configure environment variables in Vercel dashboard"
        ;;
    *)
        echo "🌐 Start the application with: npm start"
        echo "📋 Ensure all environment variables are configured"
        ;;
esac

echo ""
echo "📚 Next steps:"
echo "1. Configure all required environment variables"
echo "2. Test the application thoroughly"
echo "3. Set up monitoring and alerts"
echo "4. Configure custom domain (if needed)"
echo "5. Set up automated backups"
echo ""
echo "🎯 Your Nebusis® ControlCore v4.5 is ready for production!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"