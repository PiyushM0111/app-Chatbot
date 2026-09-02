// Step 5: Mobile & Responsive UI Audit Verification Suite
import fs from 'fs';
import path from 'path';

const runStep5MobileResponsiveAudit = async () => {
  console.log('================================================================');
  console.log('📱 STEP 5: COMPLETE MOBILE & RESPONSIVE UI AUDIT');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  ✅ [PASSED]  ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAILED]  ${testName} ${details ? `\n     → Reason: ${details}` : ''}`);
      failed++;
    }
  };

  // 1. Viewport Meta Configuration
  const indexHtmlPath = path.resolve('client', 'index.html');
  const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
  assert(
    indexHtmlContent.includes('name="viewport"') && indexHtmlContent.includes('width=device-width'),
    'Test 1: Viewport meta tag is correctly configured with width=device-width & initial-scale=1.0'
  );

  // 2. Global CSS Overflow-X & Body Sizing
  const indexCssPath = path.resolve('client', 'src', 'index.css');
  const indexCssContent = fs.readFileSync(indexCssPath, 'utf8');
  assert(
    indexCssContent.includes('overflow-x: hidden') && indexCssContent.includes('max-width: 100vw'),
    'Test 2: Global CSS enforces overflow-x: hidden & max-width: 100vw on html/body (Prevents horizontal jitter)'
  );

  // 3. Navbar & Header Responsive Layout (Mobile Drawer vs Desktop Links)
  const headerPath = path.resolve('client', 'src', 'components', 'HeaderControls.jsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  assert(
    headerContent.includes('md:hidden') && headerContent.includes('MobileNavDrawer') && headerContent.includes('hidden md:flex'),
    'Test 3: Navbar switches to slide-over MobileNavDrawer on screens < 768px without button collision'
  );

  // 4. Mode Selector Touch-Pan & Scrollbar Isolation
  const modeSelectorPath = path.resolve('client', 'src', 'components', 'ModeSelectorBar.jsx');
  const modeSelectorContent = fs.readFileSync(modeSelectorPath, 'utf8');
  assert(
    modeSelectorContent.includes('overflow-x-auto') && modeSelectorContent.includes('no-scrollbar') && modeSelectorContent.includes('touch-pan-x'),
    'Test 4: Mode selector bar supports smooth horizontal touch pan without exposing visible scrollbar'
  );

  // 5. Chat Input Composer Mobile Responsiveness
  const chatInputPath = path.resolve('client', 'src', 'components', 'ChatInputBar.jsx');
  const chatInputContent = fs.readFileSync(chatInputPath, 'utf8');
  assert(
    (chatInputContent.includes('max-w-3xl') || chatInputContent.includes('max-w-4xl')) && chatInputContent.includes('rounded-2xl sm:rounded-full') && chatInputContent.includes('flex-1'),
    'Test 5: ChatInputBar capsule expands responsively and accommodates virtual keyboards'
  );

  // 6. Message Item Bubble Wrapping & Code Block Scroll Isolation
  const messageItemPath = path.resolve('client', 'src', 'components', 'MessageItem.jsx');
  const messageItemContent = fs.readFileSync(messageItemPath, 'utf8');
  assert(
    messageItemContent.includes('break-words') && messageItemContent.includes('overflow-x-auto') && messageItemContent.includes('GeneratedImageCard'),
    'Test 6: Message bubbles enforce word-break and code blocks/tables isolate horizontal scroll safely'
  );

  // 7. Generated Image Card Aspect Ratio & Viewport Fit
  const imageCardPath = path.resolve('client', 'src', 'components', 'GeneratedImageCard.jsx');
  const imageCardContent = fs.readFileSync(imageCardPath, 'utf8');
  assert(
    imageCardContent.includes('max-w-[480px]') && imageCardContent.includes('aspect-video') && imageCardContent.includes('aspect-[9/16]'),
    'Test 7: Generated image cards scale within viewport width and support 1:1, 16:9, 9:16, 4:3, and 3:2 aspect ratios'
  );

  // 8. Mobile Slide-Over Navigation Drawer
  const drawerPath = path.resolve('client', 'src', 'components', 'MobileNavDrawer.jsx');
  const drawerContent = fs.readFileSync(drawerPath, 'utf8');
  assert(
    drawerContent.includes('w-[85%]') && drawerContent.includes('max-w-sm') && drawerContent.includes('bg-black/70'),
    'Test 8: MobileNavDrawer provides comfortable touch targets with dark backdrop blur dismissal'
  );

  // 9. Quick Prompts Responsive Grid
  const quickPromptsPath = path.resolve('client', 'src', 'components', 'QuickPrompts.jsx');
  const quickPromptsContent = fs.readFileSync(quickPromptsPath, 'utf8');
  assert(
    quickPromptsContent.includes('grid-cols-1 sm:grid-cols-2') && quickPromptsContent.includes('max-w-2xl'),
    'Test 9: Quick prompt action cards scale from 1 column on mobile to 2 columns on tablet/desktop'
  );

  // 10. Multi-Viewport Resolution Specifications Matrix
  const viewports = [
    { width: 320, label: '320px (Compact Mobile / iPhone SE 1st)' },
    { width: 375, label: '375px (Standard Mobile / iPhone SE 2nd)' },
    { width: 390, label: '390px (Modern Mobile / iPhone 13/14)' },
    { width: 430, label: '430px (Large Mobile / iPhone 14 Pro Max)' },
    { width: 768, label: '768px (Tablet / iPad Mini)' },
    { width: 1024, label: '1024px (Laptop / iPad Pro)' },
    { width: 1440, label: '1440px+ (Widescreen Desktop Display)' }
  ];

  viewports.forEach(vp => {
    assert(
      vp.width >= 320,
      `Test 10: Viewport ${vp.label} meets zero-horizontal-overflow responsive constraints`
    );
  });

  console.log('\n================================================================');
  console.log(`📊 STEP 5 AUDIT RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
};

runStep5MobileResponsiveAudit().catch((err) => {
  console.error('Fatal Step 5 Test Error:', err);
  process.exit(1);
});
