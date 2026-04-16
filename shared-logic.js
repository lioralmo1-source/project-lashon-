// מניעת שגיאות Firebase - יצירת אובייקט דמה (Simulation)
window.firebase = {
  initializeApp: () => ({}),
  firestore: () => ({
    collection: () => ({
      doc: () => ({ set: () => Promise.resolve() }),
      add: () => Promise.resolve()
    })
  }),
  auth: () => ({}),
  analytics: () => ({})
};

// פונקציית מעבר דפים
window.showTab = function(tabId, btn) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');
  if (btn) btn.classList.add('active');
};

// שמירת פרטי המורה בזיכרון המקומי בלבד
window.saveTeacherDetails = async function(name, email, whatsapp) {
  localStorage.setItem('teacherName', name);
  localStorage.setItem('teacherEmail', email);
  localStorage.setItem('teacherWhatsapp', whatsapp);
  localStorage.setItem('teacherId', 'local_' + Date.now());
  return true;
};

// פונקציות עזר וטיימר
window.initFirebase = () => { console.log("Firebase simulation active"); };
window.loadTeacherDetails = () => ({
  name: localStorage.getItem('teacherName') || '',
  email: localStorage.getItem('teacherEmail') || ''
});

let timeRemaining = 45 * 60;
window.startTimer = function() {
  setInterval(() => {
    if (timeRemaining <= 0) return;
    timeRemaining--;
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    const display = document.getElementById('timer-display');
    if (display) display.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, 1000);
};
