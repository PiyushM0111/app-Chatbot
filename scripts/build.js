import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('📦 [1/2] Building Vite React client for production...');
execSync('npm --prefix client install && npm --prefix client run build', { stdio: 'inherit' });

console.log('📦 [2/2] Mirroring build distribution to dist/ and client/dist/...');
const clientDist = path.resolve('client', 'dist');
const rootDist = path.resolve('dist');

if (fs.existsSync(clientDist)) {
  if (!fs.existsSync(rootDist)) {
    fs.mkdirSync(rootDist, { recursive: true });
  }
  fs.cpSync(clientDist, rootDist, { recursive: true });
  console.log('✅ Build distribution mirrored successfully to both client/dist/ and dist/');
}
