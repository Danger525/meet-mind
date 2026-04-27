let mediaRecorder;
let stream;
let chunks = [];
let recordingInterval;

console.log('[Offscreen] Document loaded and ready');

// Notify background that we're ready
chrome.runtime.sendMessage({ action: 'offscreenReady' });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Only handle messages targeted at offscreen
  if (message.target !== 'offscreen') return;

  console.log('[Offscreen] Received message:', message.action);

  if (message.action === 'startCapture') {
    startCapture(message.streamId);
  } else if (message.action === 'stopCapture') {
    stopCapture();
  }
});

async function startCapture(streamId) {
  console.log('[Offscreen] startCapture called with streamId:', streamId);

  if (stream) {
    console.warn('[Offscreen] Existing stream found, cleaning up');
    stopCapture();
  }

  try {
    // 1. Capture tab audio (this always works with tabCapture permission)
    console.log('[Offscreen] Capturing tab audio...');
    const tabStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId
        }
      }
    });
    console.log('[Offscreen] Tab audio obtained');

    // 2. Set up AudioContext for mixing and playback
    const audioCtx = new AudioContext();
    const destination = audioCtx.createMediaStreamDestination();
    const tabSource = audioCtx.createMediaStreamSource(tabStream);
    
    // Connect tab audio to both the mix and speakers
    tabSource.connect(destination);
    tabSource.connect(audioCtx.destination);

    // 3. Try to capture microphone (optional - may fail without permission)
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const micSource = audioCtx.createMediaStreamSource(micStream);
      micSource.connect(destination);
      console.log('[Offscreen] Mic audio added to mix');
    } catch (micErr) {
      console.warn('[Offscreen] Mic unavailable (permission denied), recording tab audio only:', micErr.message);
    }

    // Use the mixed (or tab-only) stream for recording
    stream = destination.stream;
    console.log('[Offscreen] Recording stream ready, tracks:', stream.getAudioTracks().length);

    // Start recording
    startRecording();

  } catch (error) {
    console.error('[Offscreen] Tab capture FAILED:', error);
    chrome.runtime.sendMessage({ action: 'error', message: error.message });
  }
}

function startRecording() {
  if (!stream || !stream.active) {
    console.error('[Offscreen] Cannot start recording, stream is not active');
    return;
  }

  mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
  chunks = [];

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
      console.log('[Offscreen] Chunk received, size:', event.data.size);
    }
  };

  mediaRecorder.onstop = async () => {
    console.log('[Offscreen] MediaRecorder stopped, final chunks:', chunks.length);
    if (chunks.length > 0) {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      console.log('[Offscreen] Sending final recording to backend, size:', blob.size);
      await sendToBackend(blob);
    }
    chunks = [];
  };

  mediaRecorder.onerror = (event) => {
    console.error('[Offscreen] MediaRecorder error:', event.error);
  };

  mediaRecorder.start();
  console.log('[Offscreen] MediaRecorder started, state:', mediaRecorder.state);
}

function stopCapture() {
  console.log('[Offscreen] stopCapture called');

  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
  }
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
}

async function sendToBackend(blob) {
  const formData = new FormData();
  formData.append('audio', blob, 'recording.webm');

  try {
    console.log('[Offscreen] Fetching http://localhost:3000/transcribe ...');
    const response = await fetch('http://localhost:3000/transcribe', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[Offscreen] Backend response:', JSON.stringify(result).substring(0, 200));

    chrome.runtime.sendMessage({ action: 'summaryReady', data: result });
  } catch (error) {
    console.error('[Offscreen] Error sending to backend:', error);
    chrome.runtime.sendMessage({ action: 'error', message: error.message });
  }
}

window.addEventListener('beforeunload', () => {
  stopCapture();
});
