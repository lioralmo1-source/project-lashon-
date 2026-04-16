const firebase = {
    apps: [],
    initializeApp: () => ({}),
    firestore: () => ({
        collection: () => ({ add: () => Promise.resolve() })
    })
};

// פונקציית מעבר דפים פשוטה
function showTab(tabId, btn) {
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
}

// טיימר בסיסי
let timer;
function startTimer() {
    let time = 45 * 60;
    const display = document.getElementById('timer-display');
    if(timer) clearInterval(timer);
    timer = setInterval(() => {
        let mins = Math.floor(time / 60);
        let secs = time % 60;
        display.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        if (--time < 0) clearInterval(timer);
    }, 1000);
}
