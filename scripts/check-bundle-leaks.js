#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Список запрещенных строк в клиентском бандле
const FORBIDDEN_PATTERNS = [
  /sk-[a-zA-Z0-9]{20,}/, // Stripe secret keys
  /whsec_[a-zA-Z0-9]{20,}/, // Stripe webhook secrets
  /rk_[a-zA-Z0-9]{20,}/, // Upstash Redis keys
  /Bearer\s+[a-zA-Z0-9]{20,}/, // Bearer tokens
  /OPENAI_API_KEY/, // OpenAI API key references
  /STRIPE_SECRET_KEY/, // Stripe secret key references
  /UPSTASH_REDIS_REST_TOKEN/, // Upstash token references
  /FIREBASE_SERVICE_ACCOUNT_KEY/, // Firebase service account references
  /process\.env\.[^NEXT_PUBLIC_]/ // Non-public env vars
];

function checkFile(filePath, content) {
  const issues = [];
  
  FORBIDDEN_PATTERNS.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        issues.push({
          file: filePath,
          pattern: pattern.toString(),
          match: match.substring(0, 20) + '...', // Truncate for security
          line: content.substring(0, content.indexOf(match)).split('\n').length
        });
      });
    }
  });
  
  return issues;
}

function scanDirectory(dir) {
  const issues = [];
  
  function scanRecursive(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, .next, and API routes
        if (item === 'node_modules' || item === '.next' || item === '.git' || item === 'api') {
          continue;
        }
        scanRecursive(fullPath);
      } else if (item.endsWith('.js') || item.endsWith('.ts') || item.endsWith('.jsx') || item.endsWith('.tsx')) {
        // Skip API routes and server-side files
        if (fullPath.includes('/api/') || item === 'route.ts' || fullPath.includes('/route.ts')) {
          continue;
        }
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const fileIssues = checkFile(fullPath, content);
          issues.push(...fileIssues);
        } catch (error) {
          console.warn(`Warning: Could not read ${fullPath}: ${error.message}`);
        }
      }
    }
  }
  
  scanRecursive(dir);
  return issues;
}

function main() {
  console.log('🔍 Checking for secret leaks in client bundle...');
  
  const buildDir = path.join(__dirname, '..', '.next', 'static');
  const appDir = path.join(__dirname, '..', 'app');
  
  let issues = [];
  
  // Check build output
  if (fs.existsSync(buildDir)) {
    console.log('📦 Scanning build output...');
    issues.push(...scanDirectory(buildDir));
  }
  
  // Check app directory for client components
  if (fs.existsSync(appDir)) {
    console.log('📱 Scanning client components...');
    issues.push(...scanDirectory(appDir));
  }
  
  if (issues.length > 0) {
    console.error('❌ SECURITY VIOLATION: Secret leaks detected!');
    console.error('');
    
    issues.forEach((issue, index) => {
      console.error(`${index + 1}. File: ${issue.file}`);
      console.error(`   Pattern: ${issue.pattern}`);
      console.error(`   Match: ${issue.match}`);
      console.error(`   Line: ${issue.line}`);
      console.error('');
    });
    
    console.error('🚨 These secrets must be removed from client-side code!');
    console.error('   Move secret usage to API routes or server components only.');
    process.exit(1);
  } else {
    console.log('✅ No secret leaks detected in client bundle.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkFile, scanDirectory };
