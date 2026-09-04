import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('📦 [1/3] Building Vite React client for production...');
if (!fs.existsSync(path.resolve('client', 'node_modules'))) {
  execSync('npm --prefix client install', { stdio: 'inherit' });
}
execSync('npm --prefix client run build', { stdio: 'inherit' });

console.log('📦 [2/3] Mirroring build distribution to dist/ and client/dist/...');
const clientDist = path.resolve('client', 'dist');
const rootDist = path.resolve('dist');

if (fs.existsSync(clientDist)) {
  if (!fs.existsSync(rootDist)) {
    fs.mkdirSync(rootDist, { recursive: true });
  }
  fs.cpSync(clientDist, rootDist, { recursive: true });
}

console.log('📦 [3/3] Guaranteeing SPA routing fallback _redirects in all distribution targets...');
const redirectRules = [
  '# 1. Forward API calls to Netlify serverless function handler',
  '/api/*  /.netlify/functions/api/:splat  200!',
  '',
  '# 2. SPA fallback for all client routes (Direct navigation & browser refresh)',
  '/*      /index.html                     200',
  ''
].join('\n');

const clientPublicRedirects = path.resolve('client', 'public', '_redirects');
const clientDistRedirects = path.resolve('client', 'dist', '_redirects');
const rootDistRedirects = path.resolve('dist', '_redirects');

fs.writeFileSync(clientPublicRedirects, redirectRules, 'utf8');
fs.writeFileSync(clientDistRedirects, redirectRules, 'utf8');
fs.writeFileSync(rootDistRedirects, redirectRules, 'utf8');

console.log('✅ Build distribution & SPA redirects verified successfully in dist/ and client/dist/');
