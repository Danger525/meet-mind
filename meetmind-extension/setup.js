document.getElementById('grantBtn').addEventListener('click', async () => {
    const status = document.getElementById('status');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        status.textContent = '✅ Permission Granted! You can close this tab now.';
        status.className = 'success';
        
        // Auto-close after 2 seconds
        setTimeout(() => {
            window.close();
        }, 2000);
    } catch (err) {
        status.textContent = '❌ Error: ' + err.message;
        status.style.color = '#ef4444';
    }
});
