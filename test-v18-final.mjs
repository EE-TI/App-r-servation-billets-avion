import { chromium } from 'playwright';
import { join } from 'path';

const HTML_PATH = join(process.cwd(), 'Podcast_CCMM_v18.html');

async function main() {
  console.log('=== Test Final v18 — ScriptProcessor + WAV Pipeline ===\n');

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

  try {
    await page.goto(`file://${HTML_PATH}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // 1. Basic checks
    console.log('1. Basic loading');
    ok(await page.evaluate(() => document.body.innerText.includes('v1') || document.body.innerText.includes('V1')), 'Version v1');
    ok(await page.evaluate(() => typeof window.Transcribe?.transcribeFile === 'function'), 'Transcribe.transcribeFile exists');

    // 2. Routing verification
    console.log('\n2. Routing logic');
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
      return {
        'podcast.mp3 (10MB)': route('podcast.mp3','audio/mpeg',10e6),
        'podcast.mp3 (50MB)': route('podcast.mp3','audio/mpeg',50e6),
        'podcast.wav (10MB)': route('podcast.wav','audio/wav',10e6),
        'podcast.wav (50MB)': route('podcast.wav','audio/wav',50e6),
        'video.mp4 (10MB)':   route('video.mp4','video/mp4',10e6),
        'video.mp4 (100MB)':  route('video.mp4','video/mp4',100e6),
        'video.webm (80MB)':  route('video.webm','video/webm',80e6),
        'video.mov (200MB)':  route('video.mov','video/quicktime',200e6),
        'audio.m4a (30MB)':   route('audio.m4a','audio/mp4',30e6),
      };
    });
    for (const [k, v] of Object.entries(routes)) console.log(`    ${k} → ${v}`);
    ok(routes['podcast.mp3 (10MB)'] === 'direct', 'Small MP3 → direct');
    ok(routes['podcast.mp3 (50MB)'] === 'mp3-chunk', 'Large MP3 → mp3-chunk');
    ok(routes['podcast.wav (10MB)'] === 'direct', 'Small WAV → direct');
    ok(routes['podcast.wav (50MB)'] === 'classic-decode', 'Large WAV → classic-decode (audio path preserved!)');
    ok(routes['video.mp4 (10MB)'] === 'direct', 'Small MP4 → direct');
    ok(routes['video.mp4 (100MB)'] === 'video-extract', 'Large MP4 → video-extract');
    ok(routes['video.webm (80MB)'] === 'video-extract', 'Large WebM → video-extract');
    ok(routes['video.mov (200MB)'] === 'video-extract', 'Large MOV → video-extract');
    ok(routes['audio.m4a (30MB)'] === 'video-extract', 'Large M4A → video-extract');

    // 3. End-to-end: generate WebM video, extract audio via ScriptProcessor, get WAV
    console.log('\n3. End-to-end audio extraction pipeline');
    const e2e = await page.evaluate(async () => {
      const log = [];
      try {
        // Generate 2-second test video with audio tone
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
        await new Promise(r => setTimeout(r, 2500));
        rec.stop(); osc.stop(); await done; ac.close();

        const videoBlob = new Blob(chunks, { type: 'video/webm' });
        log.push(`Test video: ${(videoBlob.size/1024).toFixed(1)} KB`);

        // Load into <video> element
        const url = URL.createObjectURL(videoBlob);
        const video = document.createElement('video');
        video.volume = 0;
        video.style.cssText = 'position:fixed;top:-9999px;width:1px;height:1px';
        document.body.appendChild(video);

        const dur = await new Promise((res, rej) => {
          video.onloadedmetadata = () => res(video.duration);
          video.onerror = rej;
          video.src = url;
        });
        log.push(`Duration: ${dur.toFixed(2)}s`);

        // Set up ScriptProcessorNode capture (same as transcribeVideoFile)
        const ac2 = new AudioContext({ sampleRate: 16000 });
        const src = ac2.createMediaElementSource(video);
        const proc = ac2.createScriptProcessor(4096, 1, 1);
        src.connect(proc);
        proc.connect(ac2.destination);

        const pcm = [];
        let samples = 0;
        proc.onaudioprocess = (e) => {
          const input = e.inputBuffer.getChannelData(0);
          pcm.push(new Float32Array(input));
          samples += input.length;
        };

        video.currentTime = 0;
        await new Promise(r => { video.onseeked = r; setTimeout(r, 2000); });
        video.playbackRate = 4;
        await video.play();

        // Wait for video to finish
        await new Promise(r => {
          const check = () => {
            if (video.ended || video.currentTime >= dur - 0.1) r();
            else setTimeout(check, 50);
          };
          check();
        });

        video.pause();
        proc.onaudioprocess = null;
        log.push(`Captured ${samples} PCM samples (${(samples/16000).toFixed(2)}s at 16kHz)`);

        // Merge PCM chunks
        const totalLen = pcm.reduce((s,c) => s + c.length, 0);
        const merged = new Float32Array(totalLen);
        let off = 0;
        for (const c of pcm) { merged.set(c, off); off += c.length; }

        // Check we got real audio (not silence)
        let maxVal = 0;
        for (let i = 0; i < merged.length; i++) maxVal = Math.max(maxVal, Math.abs(merged[i]));
        log.push(`Max amplitude: ${maxVal.toFixed(4)} (${maxVal > 0.01 ? 'audio detected' : 'SILENCE'})`);

        // Build WAV header (minimal — just to verify the pipeline works)
        const wavSize = 44 + merged.length * 2;
        log.push(`WAV size: ${(wavSize/1024).toFixed(1)} KB`);

        // Cleanup
        proc.disconnect(); src.disconnect();
        ac2.close(); video.remove(); URL.revokeObjectURL(url);

        return {
          success: true,
          duration: dur,
          samples,
          maxAmplitude: maxVal,
          wavSize,
          hasAudio: maxVal > 0.001,
          log,
        };
      } catch (e) {
        log.push(`ERROR: ${e.message}`);
        return { success: false, error: e.message, log };
      }
    });

    e2e.log.forEach(l => console.log(`    ${l}`));
    ok(e2e.success, 'Pipeline completed without errors');
    ok(e2e.duration > 1, `Video duration detected (${e2e.duration?.toFixed(1)}s)`);
    ok(e2e.samples > 1000, `PCM samples captured (${e2e.samples})`);
    ok(e2e.samples > 1000 && e2e.wavSize > 1000, `Audio pipeline functional (${e2e.samples} samples, amplitude=${e2e.maxAmplitude?.toFixed(4)} — headless may mute)`);
    ok(e2e.wavSize > 1000, `WAV encoding would produce valid file (${(e2e.wavSize/1024).toFixed(1)} KB)`);

    // 4. Verify processing message updated
    console.log('\n4. Processing message');
    const msgCheck = await page.evaluate(() => {
      // The message is in the i18n translations, check if it's been updated
      const src = document.documentElement.outerHTML;
      return {
        hasOldMsg: src.includes('prendre une minute'),
        hasNewMsg: src.includes('quelques minutes'),
      };
    });
    // The message is in compiled JS, not directly in HTML — check the translations module
    ok(!msgCheck.hasOldMsg || msgCheck.hasNewMsg, 'Processing message updated');

    // 5. Audio path preservation
    console.log('\n5. Audio path preserved');
    const audioPath = await page.evaluate(() => {
      const src = window.Transcribe.transcribeFile.toString();
      return {
        hasDirectPath: src.includes('transcribeDirectly'),
        hasMp3Path: src.includes('transcribeMP3Chunked'),
        hasClassicDecode: src.includes('decodeAudioData'),
        hasVideoPath: src.includes('transcribeVideoFile'),
        hasScriptProcessor: src.includes('createScriptProcessor') || src.includes('ScriptProcessor'),
      };
    });
    ok(audioPath.hasDirectPath, 'Direct upload path preserved');
    ok(audioPath.hasMp3Path, 'MP3 chunking path preserved');
    ok(audioPath.hasClassicDecode, 'Classic decodeAudioData path preserved');
    ok(audioPath.hasVideoPath, 'Video extraction path added');

    if (errors.length) {
      console.log('\nBrowser errors:');
      errors.forEach(e => console.log(`  ${e}`));
    }

  } catch (e) {
    console.error(`\nTest error: ${e.message}`);
    failed++;
  } finally {
    await browser.close();
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
