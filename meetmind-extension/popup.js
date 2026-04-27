document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const summaryDiv = document.getElementById('summary');
  const statusDot = document.getElementById('statusDot');

  // Initialize UI based on recording state
  chrome.runtime.sendMessage({ action: 'getState' }, (response) => {
    if (response && response.isRecording) {
      setRecordingUI(true);
    }
  });

  function setRecordingUI(isRecording) {
    startBtn.disabled = isRecording;
    stopBtn.disabled = !isRecording;
    if (isRecording) {
      statusDot.classList.add('active');
      summaryDiv.innerHTML = '<div class="empty-state">Recording active... Listening for audio.</div>';
    } else {
      statusDot.classList.remove('active');
    }
  }

  startBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'startCapture' }, (response) => {
      if (response && response.error) {
        summaryDiv.innerHTML = `<div class="danger" style="color: #ef4444; padding: 10px;">${response.error}</div>`;
        return;
      }
      setRecordingUI(true);
    });
  });

  stopBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'stopCapture' }, (response) => {
      setRecordingUI(false);
      summaryDiv.innerHTML = '<div class="empty-state">Processing audio with Gemini AI... Please wait.</div>';
    });
  });

  // Listen for updates
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'summaryReady') {
      displaySummary(message.data);
    } else if (message.action === 'error') {
      summaryDiv.innerHTML = `<div style="color: #ef4444; padding: 10px; border: 1px solid #ef4444; border-radius: 8px;">Error: ${message.message}</div>`;
      setRecordingUI(false);
    }
  });

  function displaySummary(data) {
    if (!data) return;
    if (data.whatsapp_summary) {
      summaryDiv.innerHTML = `
        <div style="font-weight: 700; margin-bottom: 8px; color: #818cf8;">${data.meeting_title || 'Meeting Summary'}</div>
        <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 12px;">Sentiment: ${data.sentiment} | Type: ${data.meeting_type}</div>
        <div style="white-space: pre-wrap; line-height: 1.6;">${data.whatsapp_summary}</div>
      `;
    } else {
      summaryDiv.textContent = JSON.stringify(data, null, 2);
    }
  }

  // Load existing summary
  chrome.storage.local.get(['summary'], (result) => {
    if (result.summary) {
      displaySummary(result.summary);
    }
  });
});