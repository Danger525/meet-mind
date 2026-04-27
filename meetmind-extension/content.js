// Content script injected into meeting pages
console.log('MeetMind content script loaded');

// Listen for messages from background or popup if needed
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkMeetingPage') {
    sendResponse({ isMeeting: true });
  }
});