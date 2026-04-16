/* ══════════════════════════════════════════════════
   LASHON LEARNING PLATFORM — SHARED LOGIC
   Firebase Integration, Teacher Management, Data Submission
═══════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════
// FIREBASE CONFIGURATION
// ═══════════════════════════════════════════════════
const firebaseConfig = {
  apiKey: "AIzaSyC1VIJaFqC-HzJHGutib10-A29i1KKO4YI",
  authDomain: "lashon-project.firebaseapp.com",
  projectId: "lashon-project",
  storageBucket: "lashon-project.firebasestorage.app",
  messagingSenderId: "444024985545",
  appId: "1:444024985545:web:847f8d4dad43193c147a18",
  measurementId: "G-26KTLPJ8N1"
};

// Initialize Firebase
let db = null;
let auth = null;
let analytics = null;

// Load Firebase only when needed
function initFirebase() {
  if (typeof firebase !== 'undefined' && !db) {
    db = firebase.firestore();
    auth = firebase.auth();
    if (firebase.analytics) {
      analytics = firebase.analytics();
    }
  }
}

// ═══════════════════════════════════════════════════
// TEACHER SETTINGS MANAGEMENT
// ═══════════════════════════════════════════════════

// Save teacher details to cloud
async function saveTeacherDetails(name, email, whatsapp) {
  initFirebase();
  if (!db) {
    alert('שגיאה: Firebase לא זמין');
    return false;
  }
  
  try {
    const teacherId = generateTeacherId();
    await db.collection('teachers').doc(teacherId).set({
      name: name,
      email: email,
      whatsapp: whatsapp,
      timestamp: new Date().toISOString(),
      platform: 'Lashon Learning'
    });
    
    // Store teacher ID locally
    localStorage.setItem('teacherId', teacherId);
    localStorage.setItem('teacherName', name);
    localStorage.setItem('teacherEmail', email);
    localStorage.setItem('teacherWhatsapp', whatsapp);
    
    return true;
  } catch (error) {
    console.error('שגיאה בשמירת פרטי המורה:', error);
    return false;
  }
}

// Load teacher details from local storage
function loadTeacherDetails() {
  return {
    name: localStorage.getItem('teacherName') || '',
    email: localStorage.getItem('teacherEmail') || '',
    whatsapp: localStorage.getItem('teacherWhatsapp') || '',
    id: localStorage.getItem('teacherId') || ''
  };
}

// Generate unique teacher ID
function generateTeacherId() {
  return 'teacher_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Check if teacher details exist
function hasTeacherDetails() {
  const teacher = loadTeacherDetails();
  return teacher.name && (teacher.email || teacher.whatsapp);
}

// ═══════════════════════════════════════════════════
// SUBMISSION & DATA COLLECTION
// ═══════════════════════════════════════════════════

// Generic function to collect and submit lesson data
async function submitLessonData(lessonId, studentData, submissionType = 'worksheet') {
  initFirebase();
  if (!db) {
    // Fallback: save locally
    saveLessonDataLocally(lessonId, studentData);
    return false;
  }
  
  try {
    const teacher = loadTeacherDetails();
    
    const submission = {
      lessonId: lessonId,
      studentName: studentData.studentName || 'אנונימי',
      studentClass: studentData.studentClass || 'לא ידוע',
      studentEmail: studentData.studentEmail || '',
      data: studentData,
      submissionType: submissionType,
      timestamp: new Date().toISOString(),
      teacherId: teacher.id || 'no-teacher'
    };
    
    // Save to Firebase
    await db.collection('submissions').add(submission);
    
    // Send notification to teacher
    if (teacher.email) {
      await notifyTeacher(teacher, submission, 'email');
    } else if (teacher.whatsapp) {
      await notifyTeacher(teacher, submission, 'whatsapp');
    }
    
    return true;
  } catch (error) {
    console.error('שגיאה בשליחת הנתונים:', error);
    saveLessonDataLocally(lessonId, studentData);
    return false;
  }
}

// Notify teacher via email or WhatsApp
async function notifyTeacher(teacher, submission, method = 'email') {
  // In production, this would call a backend service
  // For now, we'll create a structured message
  
  const message = {
    to: method === 'email' ? teacher.email : teacher.whatsapp,
    student: submission.studentName,
    class: submission.studentClass,
    lesson: submission.lessonId,
    timestamp: submission.timestamp,
    method: method
  };
  
  // Log for debugging (in production, send via Cloud Function)
  console.log('Teacher notification:', message);
  
  // Optional: Store notification in Firebase
  if (db) {
    try {
      await db.collection('notifications').add({
        teacherId: teacher.id,
        ...message,
        sent: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Could not log notification:', e);
    }
  }
}

// Fallback: Save data locally if Firebase unavailable
function saveLessonDataLocally(lessonId, studentData) {
  const submissions = JSON.parse(localStorage.getItem('offlineSubmissions') || '[]');
  submissions.push({
    lessonId: lessonId,
    data: studentData,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('offlineSubmissions', JSON.stringify(submissions));
}

// ═══════════════════════════════════════════════════
// TAB NAVIGATION
// ═══════════════════════════════════════════════════

function showTab(tabId, button) {
  // Hide all tab panes
  const panes = document.querySelectorAll('.tab-pane');
  panes.forEach(pane => pane.classList.remove('active'));
  
  // Remove active class from all buttons
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  
  // Show selected tab and mark button as active
  const selectedPane = document.getElementById(tabId);
  if (selectedPane) {
    selectedPane.classList.add('active');
  }
  
  if (button) {
    button.classList.add('active');
  }
}

// ═══════════════════════════════════════════════════
// TIMER FUNCTIONALITY
// ═══════════════════════════════════════════════════

let timerInterval = null;
let timeRemaining = 45 * 60; // 45 minutes in seconds

function startTimer() {
  if (timerInterval) return; // Already running
  
  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      showTimerAlert();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timeRemaining = 45 * 60;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const display = document.getElementById('timer-display');
  if (!display) return;
  
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  display.textContent = 
    String(minutes).padStart(2, '0') + ':' + 
    String(seconds).padStart(2, '0');
  
  // Update progress
  const totalSeconds = 45 * 60;
  const progress = ((totalSeconds - timeRemaining) / totalSeconds) * 100;
  const progressFill = document.getElementById('prog-fill');
  if (progressFill) {
    progressFill.style.width = progress + '%';
  }
  
  // Update phase indicator
  updatePhaseIndicator(minutes);
}

function updatePhaseIndicator(minutes) {
  const phaseInd = document.getElementById('phase-ind');
  if (!phaseInd) return;
  
  let phase = '';
  if (minutes > 40) phase = '🔥 פתיחה';
  else if (minutes > 30) phase = '📚 רכישה';
  else if (minutes > 20) phase = '🎬 הדגמה';
  else if (minutes > 5) phase = '✏️ תרגול';
  else if (minutes > 0) phase = '🔚 סיכום';
  else phase = '⏰ סיום!';
  
  phaseInd.textContent = phase;
}

function showTimerAlert() {
  alert('⏰ הזמן לשיעור הסתיים!');
}

// ═══════════════════════════════════════════════════
// FORM SUBMISSION (Worksheet)
// ═══════════════════════════════════════════════════

function submitWS() {
  const studentName = document.getElementById('sname')?.value || '';
  const studentClass = document.getElementById('sclass')?.value || '';
  const studentDate = document.getElementById('student-date')?.value || 
                      document.getElementById('sdate')?.value || '';
  
  if (!studentName) {
    alert('אנא הקלידו את שם התלמיד/ה');
    return;
  }
  
  // Collect all input values
  const formData = collectFormData();
  
  const submission = {
    studentName: studentName,
    studentClass: studentClass,
    studentDate: studentDate,
    formData: formData,
    submittedAt: new Date().toLocaleString('he-IL')
  };
  
  // Submit to Firebase or local storage
  submitLessonData(
    getCurrentLessonId(),
    submission,
    'worksheet'
  ).then(success => {
    if (success) {
      showSuccessModal('דף העבודה נשלח בהצלחה! ✓');
    } else {
      showSuccessModal('הנתונים נשמרו ברשומה מקומית. אנא שמרו עותק.');
    }
  });
}

// Collect all form data from the page
function collectFormData() {
  const data = {};
  const inputs = document.querySelectorAll('input[type="text"], textarea, select');
  
  inputs.forEach(input => {
    if (input.id && input.id !== 'sname' && input.id !== 'sclass' && 
        input.id !== 'student-date' && input.id !== 'sdate') {
      data[input.id] = input.value;
    }
  });
  
  return data;
}

// Get lesson ID from page (based on URL or data attribute)
function getCurrentLessonId() {
  const lessonName = document.title.split('|')[0]?.trim() || 'unknown-lesson';
  return lessonName.toLowerCase().replace(/\s+/g, '-');
}

// Show success modal
function showSuccessModal(message) {
  const modal = document.getElementById('success-modal') || createSuccessModal();
  const content = modal.querySelector('.modal-content p') || 
                  modal.querySelector('div');
  
  if (content) {
    content.textContent = message;
  }
  
  modal.classList.add('open');
  setTimeout(() => {
    modal.classList.remove('open');
  }, 3000);
}

// Create success modal if it doesn't exist
function createSuccessModal() {
  const modal = document.createElement('div');
  modal.id = 'success-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <p></p>
    </div>
  `;
  modal.style.cssText = `
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    align-items: center;
    justify-content: center;
    padding: 16px;
  `;
  document.body.appendChild(modal);
  return modal;
}

// ═══════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════

// Format date to Hebrew format
function formatDateHebrew(date) {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    locale: 'he-IL'
  };
  return new Date(date).toLocaleDateString('he-IL', options);
}

// Generate unique student ID
function generateStudentId() {
  return 'student_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

// Send to WhatsApp (opens WhatsApp with pre-filled message)
function sendViaWhatsApp(phoneNumber, message) {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
}

// Send email (opens default email client)
function sendViaEmail(email, subject, body) {
  const encodedBody = encodeURIComponent(body);
  const encodedSubject = encodeURIComponent(subject);
  window.location.href = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
}

// ═══════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════

// Initialize page on load
document.addEventListener('DOMContentLoaded', function() {
  // Load teacher details if available
  const teacher = loadTeacherDetails();
  if (teacher.name) {
    console.log('✓ פרטי מורה טעונים:', teacher.name);
  }
  
  // Initialize Firebase
  initFirebase();
  
  // Set up event listeners
  const timerStart = document.querySelector('button[onclick*="startTimer"]');
  if (timerStart) {
    updateTimerDisplay();
  }
});

// ═══════════════════════════════════════════════════
// EXPORT FOR EXTERNAL USE
// ═══════════════════════════════════════════════════

// Make functions globally available
window.showTab = showTab;
window.startTimer = startTimer;
window.resetTimer = resetTimer;
window.submitWS = submitWS;
window.submitLessonData = submitLessonData;
window.saveTeacherDetails = saveTeacherDetails;
window.loadTeacherDetails = loadTeacherDetails;
window.sendViaWhatsApp = sendViaWhatsApp;
window.sendViaEmail = sendViaEmail;
