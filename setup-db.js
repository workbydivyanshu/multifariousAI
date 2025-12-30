#!/usr/bin/env node

/**
 * Database Setup Script for MultifariousAI
 * This script helps set up the PostgreSQL database for authentication and chat persistence
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up MultifariousAI Database...\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found. Please copy .env.example to .env.local and configure your environment variables.');
  process.exit(1);
}

// Check if DATABASE_URL is set
require('dotenv').config({ path: envPath });
if (!process.env.DATABASE_URL) {
  console.log('❌ DATABASE_URL not found in .env.local. Please set your PostgreSQL database URL.');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log(`📍 Database URL: ${process.env.DATABASE_URL.replace(/:[^:]*@/, ':***@')}\n`);

try {
  // Generate migrations
  console.log('📝 Generating database migrations...');
  execSync('npm run db:generate', { stdio: 'inherit' });

  // Push schema to database
  console.log('🗃️  Pushing schema to database...');
  execSync('npm run db:push', { stdio: 'inherit' });

  console.log('\n✅ Database setup complete!');
  console.log('🎉 You can now run "npm run dev" to start the application.');
  console.log('🔐 Make sure to configure your OAuth providers (GitHub/Google) in .env.local');

} catch (error) {
  console.error('\n❌ Database setup failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Make sure PostgreSQL is running');
  console.log('2. Check your DATABASE_URL in .env.local');
  console.log('3. Ensure you have the correct permissions for the database');
  process.exit(1);
}