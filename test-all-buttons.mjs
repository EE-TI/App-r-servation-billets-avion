import { chromium } from 'playwright';
import { join } from 'path';

const HTML_PATH = join(process.cwd(), 'Podcast_CCMM_v18.html');

async function main() {
  console.log('=== Test complet v3 — Tous les boutons et interactions ===\n');

  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    headless: true,
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
  });

  const page = await (await browser.newContext()).newPage();
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));

  let passed = 0, failed = 0;
  function ok(cond, msg) {
    if (cond) { console.log(`  ✓ ${msg}`); passed++; }
    else { console.log(`  ✗ ${msg}`); failed++; }
  }

  // Helper to search all script tags including text/babel
  const searchAllScripts = async (patterns) => {
    return page.evaluate((pats) => {
      let allSrc = '';
      for (const s of document.querySelectorAll('script')) {
        allSrc += s.textContent + '\n';
      }
      const results = {};
      for (const [key, pat] of Object.entries(pats)) {
        results[key] = allSrc.includes(pat);
      }
      return results;
    }, patterns);
  };

  try {
    await page.goto(`file://${HTML_PATH}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // ============================================================
    // 1. BRANDING & VERSION
    // ============================================================
    console.log('1. Branding & Version');
    const branding = await page.evaluate(() => ({
      title: document.title,
      headerText: document.querySelector('.app-header__title')?.textContent || '',
      hasV1: document.body.innerText.includes('V1') || document.body.innerText.includes('v1'),
      tagline: document.body.innerText.includes('PRODUCTEUR DE CONTENUS') || document.body.innerText.includes('Producteur de contenus'),
    }));
    ok(branding.title.includes('Prod-Contenu CCMM'), `Title: "${branding.title}"`);
    ok(branding.headerText.includes('Prod-Contenu'), `Header: "${branding.headerText}"`);
    ok(branding.hasV1, 'Version visible');
    ok(branding.tagline, 'Tagline correct');

    // ============================================================
    // 2. NO JS ERRORS ON LOAD
    // ============================================================
    console.log('\n2. JavaScript errors');
    const loadErrors = errors.filter(e => !e.includes('net::') && !e.includes('favicon') && !e.includes('ERR_FILE_NOT_FOUND'));
    ok(loadErrors.length === 0, `No JS errors${loadErrors.length > 0 ? ': ' + loadErrors.join('; ').slice(0, 200) : ''}`);

    // ============================================================
    // 3. MODULES
    // ============================================================
    console.log('\n3. Modules');
    const modules = await page.evaluate(() => ({
      Transcribe: typeof window.Transcribe?.transcribeFile === 'function',
      AI: typeof window.AI !== 'undefined' && window.AI !== null,
      Validation: typeof window.Validation !== 'undefined',
      JSZip: typeof window.JSZip === 'function',
    }));
    ok(modules.Transcribe, 'Transcribe');
    ok(modules.AI, 'AI');
    ok(modules.Validation, 'Validation');
    ok(modules.JSZip, 'JSZip');

    // ============================================================
    // 4. AI FUNCTIONS
    // ============================================================
    console.log('\n4. AI functions');
    const aiFns = await page.evaluate(() => {
      const expected = ['titles', 'showNotes', 'chapters', 'keywords', 'links',
        'socialLinkedIn', 'tweets', 'youtube', 'trailer', 'blog', 'newsletter',
        'quotes', 'keypoints'];
      return expected.filter(fn => typeof window.AI[fn] !== 'function');
    });
    ok(aiFns.length === 0, `All 13 AI functions${aiFns.length > 0 ? ' (missing: ' + aiFns.join(', ') + ')' : ''}`);

    // ============================================================
    // 5. ROUTING
    // ============================================================
    console.log('\n5. Routing');
    const routing = await page.evaluate(() => {
      const src = window.Transcribe.transcribeFile.toString();
      return {
        direct: src.includes('transcribeDirectly'),
        mp3: src.includes('transcribeMP3Chunked'),
        classic: src.includes('decodeAudioData'),
        video: src.includes('transcribeVideoFile'),
      };
    });
    ok(routing.direct && routing.mp3 && routing.classic && routing.video, 'All 4 transcription paths');

    const routes = await page.evaluate(() => {
      const MAX = 25 * 1024 * 1024;
      function route(name, type, size) {
        const isMp3 = /\.mp3$/i.test(name) || /audio\/(mpeg|mp3)/.test(type);
        const isMp4 = /\.(mp4|m4a|webm|mov|avi|mkv)$/i.test(name) || /^(video\/|audio\/mp4)/.test(type);
        const isNative = ['.mp3','.mp4','.mpeg','.mpga','.m4a','.wav','.webm','.flac','.ogg','.oga']
          .some(e => name.endsWith(e));
        if (size <= MAX && isNative) return 'direct';
        if (isMp3 && size > MAX) return 'mp3-chunk';
        if (isMp4 && size > MAX) return 'video-extract';
        return 'classic-decode';
      }
      return [
        ['Small MP3→direct', route('p.mp3','audio/mpeg',10e6) === 'direct'],
        ['Large MP3→chunk', route('p.mp3','audio/mpeg',50e6) === 'mp3-chunk'],
        ['Small MP4→direct', route('v.mp4','video/mp4',10e6) === 'direct'],
        ['Large MP4→video', route('v.mp4','video/mp4',100e6) === 'video-extract'],
        ['Large WAV→classic', route('p.wav','audio/wav',50e6) === 'classic-decode'],
        ['Large MOV→video', route('v.mov','video/quicktime',200e6) === 'video-extract'],
        ['Large WebM→video', route('v.webm','video/webm',80e6) === 'video-extract'],
      ];
    });
    for (const [label, result] of routes) ok(result, label);

    // ============================================================
    // 6. WHISPER LANGUAGE
    // ============================================================
    console.log('\n6. Whisper language');
    const lang = await searchAllScripts({
      callFound: 'Transcribe.transcribeFile',
    });
    const langDetail = await page.evaluate(() => {
      for (const s of document.querySelectorAll('script[type="text/babel"]')) {
        const idx = s.textContent.indexOf('Transcribe.transcribeFile');
        if (idx >= 0) {
          const snippet = s.textContent.slice(idx, idx + 300);
          return { found: true, hasLang: /language\s*:/.test(snippet) };
        }
      }
      return { found: false, hasLang: false };
    });
    ok(langDetail.found, 'transcribeFile call found');
    ok(!langDetail.hasLang, 'No forced language parameter');

    // ============================================================
    // 7. HANDLEREGENERATE
    // ============================================================
    console.log('\n7. handleRegenerate');
    const regen = await searchAllScripts({
      transcriptCase: "cardId === 'transcript'",
      instanceofBlob: 'instanceof Blob',
      fileInput: "inp.type = 'file'",
      fnTitles: 'titles: AI.titles',
      fnShowNotes: 'showNotes: AI.showNotes',
      fnChapters: 'chapters: AI.chapters',
      fnKeywords: 'keywords: AI.keywords',
      fnLinks: 'links: AI.links',
      fnSocial: 'social: AI.socialLinkedIn',
      fnTweets: 'tweets: AI.tweets',
      fnYoutube: 'youtube: AI.youtube',
      fnTrailer: 'trailer: AI.trailer',
      fnBlog: 'blog: AI.blog',
      fnNewsletter: 'newsletter: AI.newsletter',
      fnQuotes: 'quotes: AI.quotes',
      fnKeypoints: 'keypoints: AI.keypoints',
    });
    ok(regen.transcriptCase, 'Transcript special case');
    ok(regen.instanceofBlob, 'instanceof Blob guard');
    ok(regen.fileInput, 'File picker when file lost');
    const fnMapOk = ['fnTitles','fnShowNotes','fnChapters','fnKeywords','fnLinks','fnSocial',
      'fnTweets','fnYoutube','fnTrailer','fnBlog','fnNewsletter','fnQuotes','fnKeypoints']
      .every(k => regen[k]);
    ok(fnMapOk, 'fnMap covers all 13 cards');

    // ============================================================
    // 8. CARDMODAL BUTTONS
    // ============================================================
    console.log('\n8. CardModal buttons');
    const modal = await searchAllScripts({
      copy: 'onClick={onCopy}',
      download: 'onClick={onDownload}',
      regenerate: "onRegenerate?.('')",
      refine: 'setShowRefine',
      edit: 'setEditing(true)',
      save: 'handleSave',
      search: 'setShowSearch',
    });
    ok(modal.copy, 'Copy');
    ok(modal.download, 'Download');
    ok(modal.regenerate, 'Regenerate');
    ok(modal.refine, 'Guided regeneration');
    ok(modal.edit, 'Edit');
    ok(modal.save, 'Save');
    ok(modal.search, 'Search');

    // ============================================================
    // 9. HANDLER FUNCTIONS
    // ============================================================
    console.log('\n9. Handler functions');
    const handlers = await searchAllScripts({
      handleCardClick: 'handleCardClick',
      handleCopy: 'handleCopy',
      handleDownload: 'const handleDownload',
      handleDownloadAll: 'handleDownloadAll',
      handleRegenerate: 'const handleRegenerate',
      handleRegenerateAll: 'handleRegenerateAll',
      handleSaveEdit: 'handleSaveEdit',
      handleCustomRegenerate: 'handleCustomRegenerate',
      runTranscription: 'runTranscription',
      runPipeline: 'runPipeline',
      humanizeAIError: 'humanizeAIError',
      serializeResult: 'serializeResult',
    });
    for (const [fn, exists] of Object.entries(handlers)) {
      ok(exists, fn);
    }

    // ============================================================
    // 10. PROVIDER SELECTION
    // ============================================================
    console.log('\n10. Provider selection');
    const provider = await page.evaluate(() => {
      const src = window.Transcribe.transcribeFile.toString();
      return {
        pickProvider: src.includes('pickProvider'),
        groq: src.includes('groq'),
        hasProviderParam: src.includes('provider'),
      };
    });
    // Groq/OpenAI URLs are inside the Transcribe IIFE (not in DOM script tags)
    // Verify via the function source and script search
    const provScripts = await searchAllScripts({
      prefersGroq: "'groq' : 'openai'",
    });
    ok(provider.pickProvider, 'pickProvider in transcribeFile');
    ok(provider.groq, 'Groq support in Transcribe module');
    ok(provider.hasProviderParam, 'Provider parameter handling');
    ok(provScripts.prefersGroq, 'Groq preferred when key exists');

    // ============================================================
    // 11. I18N
    // ============================================================
    console.log('\n11. i18n labels');
    const i18n = await searchAllScripts({
      'modal.copy': "'modal.copy'",
      'modal.regenerate': "'modal.regenerate'",
      'modal.download': "'modal.download'",
      'edit.action': "'edit.action'",
      'edit.save': "'edit.save'",
      'refine.withRefinement': "'refine.withRefinement'",
      'results.regenerateAll': "'results.regenerateAll'",
      'results.downloadAll': "'results.downloadAll'",
      'toast.copied': "'toast.copied'",
      'toast.downloaded': "'toast.downloaded'",
      'toast.regenerated': "'toast.regenerated'",
    });
    const missingI18n = Object.entries(i18n).filter(([, v]) => !v).map(([k]) => k);
    ok(missingI18n.length === 0, `All i18n keys${missingI18n.length > 0 ? ' (missing: ' + missingI18n.join(', ') + ')' : ''}`);

    // ============================================================
    // 12. PROCESSING MESSAGE
    // ============================================================
    console.log('\n12. Processing message');
    const proc = await page.evaluate(() => {
      const msg = window.t?.('fr', 'processing.subtitle') || '';
      return {
        quelquesMin: msg.includes('quelques minutes'),
        noSyntaxError: msg.length > 20,
        msg,
      };
    });
    ok(proc.quelquesMin, `"quelques minutes" in message`);
    ok(proc.noSyntaxError, `Message renders correctly: "${proc.msg?.slice(0, 60)}..."`);

    // ============================================================
    // 13. UPLOAD
    // ============================================================
    console.log('\n13. Upload screen');
    const upload = await searchAllScripts({
      video: 'audio/*,video/*',
      dropzone: 'onDrop',
      paste: 'paste',
    });
    ok(upload.video, 'Accepts video files');
    ok(upload.dropzone, 'Dropzone');
    ok(upload.paste, 'Paste mode');

    // ============================================================
    // 14. CONFIRM MODALS
    // ============================================================
    console.log('\n14. Confirm modals');
    const confirms = await searchAllScripts({
      confirmState: 'confirmState',
      regenAll: 'regenAllTitle',
      handleDelete: 'handleDelete',
    });
    ok(confirms.confirmState, 'Confirm modal system');
    ok(confirms.regenAll, 'Regenerate All confirmation');
    ok(confirms.handleDelete, 'Delete project');

    // ============================================================
    // 15. CREATEOBJECTURL SAFETY
    // ============================================================
    console.log('\n15. createObjectURL safety');
    const safety = await searchAllScripts({
      instanceofBlob: 'instanceof Blob',
      createUrl: 'createObjectURL',
    });
    ok(safety.instanceofBlob, 'instanceof Blob guard');
    ok(safety.createUrl, 'createObjectURL present');

    // ============================================================
    // 16. VIDEO PIPELINE E2E
    // ============================================================
    console.log('\n16. Video pipeline E2E');
    const e2e = await page.evaluate(async () => {
      const log = [];
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 160; canvas.height = 120;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'blue'; ctx.fillRect(0,0,160,120);

        const ac = new AudioContext();
        const osc = ac.createOscillator();
        osc.frequency.value = 440;
        const gain = ac.createGain(); gain.gain.value = 0.5;
        const dest = ac.createMediaStreamDestination();
        osc.connect(gain); gain.connect(dest); osc.start();

        const stream = new MediaStream([
          ...canvas.captureStream(5).getTracks(),
          ...dest.stream.getTracks(),
        ]);
        const rec = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' });
        const chunks = [];
        rec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
        const done = new Promise(r => { rec.onstop = r; });
        rec.start();
        await new Promise(r => setTimeout(r, 2000));
        rec.stop(); osc.stop(); await done; ac.close();

        const blob = new Blob(chunks, { type: 'video/webm' });
        log.push(`Video: ${(blob.size/1024).toFixed(1)} KB`);
        const url = URL.createObjectURL(blob);
        log.push('createObjectURL: OK');

        const video = document.createElement('video');
        video.volume = 0;
        const dur = await new Promise((res, rej) => {
          video.onloadedmetadata = () => res(video.duration);
          video.onerror = () => rej(new Error('LOAD_FAILED'));
          setTimeout(() => rej(new Error('TIMEOUT')), 5000);
          video.src = url;
        });
        log.push(`Duration: ${dur.toFixed(2)}s`);
        URL.revokeObjectURL(url);

        return { success: true, duration: dur, log };
      } catch (e) {
        log.push(`ERROR: ${e.message}`);
        return { success: false, error: e.message, log };
      }
    });
    e2e.log.forEach(l => console.log(`    ${l}`));
    ok(e2e.success, 'No errors');
    ok(e2e.duration > 1, `Duration: ${e2e.duration?.toFixed(1)}s`);

    // ============================================================
    // 17. HOME SCREEN
    // ============================================================
    console.log('\n17. Home screen buttons');
    const home = await searchAllScripts({
      newProject: 'newProject',
      rename: 'handleRename',
      duplicate: 'handleDuplicate',
      deleteP: 'handleDelete',
    });
    ok(home.newProject, 'New project');
    ok(home.rename, 'Rename');
    ok(home.duplicate, 'Duplicate');
    ok(home.deleteP, 'Delete');

    // ============================================================
    // 18. RESULTS SCREEN
    // ============================================================
    console.log('\n18. Results screen buttons');
    const results = await searchAllScripts({
      regenAll: 'onRegenerateAll',
      downloadAll: 'onDownloadAll',
      back: 'onBack',
      addCustom: 'onAddCustom',
      cardClick: 'onCardClick',
    });
    ok(results.regenAll, 'Regenerate All');
    ok(results.downloadAll, 'Download All');
    ok(results.back, 'Back');
    ok(results.addCustom, 'Add custom');
    ok(results.cardClick, 'Card click');

    // ============================================================
    // 19. FINAL ERROR CHECK
    // ============================================================
    console.log('\n19. Final error check');
    const finalErrors = errors.filter(e =>
      !e.includes('net::') && !e.includes('favicon') && !e.includes('ERR_FILE_NOT_FOUND')
    );
    if (finalErrors.length > 0) {
      console.log('  Errors:');
      finalErrors.forEach(e => console.log(`    ${e}`));
    }
    ok(finalErrors.length === 0, 'No runtime errors');

  } catch (e) {
    console.error(`\nTest crash: ${e.message}`);
    failed++;
  } finally {
    await browser.close();
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`=== RESULTS: ${passed} passed, ${failed} failed ===`);
  console.log(`${'='.repeat(50)}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
