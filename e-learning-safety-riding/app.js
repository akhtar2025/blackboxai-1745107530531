/**
 * app.js
 * Handles login, quiz submission, user data storage, and statistics for E-Learning Safety Riding
 */

// Utility functions for localStorage keys
const USER_KEY = 'eLearningUser';
const QUIZ_RESULTS_KEY = 'eLearningQuizResults';

// Save user data on login
document.getElementById('loginForm')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const npk = e.target.npk.value.trim();
  const name = e.target.name.value.trim();
  const department = e.target.department.value;

  if (!npk || !name || !department) {
    alert('Please fill all fields');
    return;
  }

  const user = { npk, name, department };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Redirect to modules page after login
  window.location.href = 'modules.html';
});

// Check if user is logged in, if not redirect to login page
function checkLogin() {
  const user = localStorage.getItem(USER_KEY);
  if (!user) {
    window.location.href = 'index.html';
  }
}

// Get user data
function getUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

// Handle quiz submission
document.getElementById('quizForm')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const answers = {};
  for (let [key, value] of formData.entries()) {
    answers[key] = value;
  }

  // Define correct answers for each module by page
  const correctAnswers = {
    'module1.html': { q1: 'a', q2: 'a', q3: 'a' },
    'module2.html': { q1: 'a', q2: 'b', q3: 'a' },
    'module3.html': { q1: 'a', q2: 'a', q3: 'a' },
    'module4.html': { q1: 'a', q2: 'a', q3: 'a' },
    'module5.html': { q1: 'a', q2: 'a', q3: 'a' }
  };

  const currentPage = window.location.pathname.split('/').pop();
  const correct = correctAnswers[currentPage] || {};

  let score = 0;
  let total = Object.keys(correct).length;

  for (let q in correct) {
    if (answers[q] === correct[q]) {
      score++;
    }
  }

  // Save quiz result
  const user = getUser();
  if (!user) {
    alert('User not logged in');
    window.location.href = 'index.html';
    return;
  }

  let quizResults = JSON.parse(localStorage.getItem(QUIZ_RESULTS_KEY)) || {};
  if (!quizResults[user.npk]) {
    quizResults[user.npk] = {};
  }
  quizResults[user.npk][currentPage] = {
    score,
    total,
    timestamp: new Date().toISOString(),
    department: user.department
  };

  localStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(quizResults));

  alert(`Quiz submitted! Your score: ${score} / ${total}`);

  // Redirect back to modules page
  window.location.href = 'modules.html';
});

// Function to calculate statistics for stats.html
function calculateStatistics() {
  const quizResults = JSON.parse(localStorage.getItem(QUIZ_RESULTS_KEY)) || {};
  const stats = {
    participationByDepartment: {},
    performanceByModule: {},
    averageScore: 0,
    moduleCompletion: {}
  };

  let totalScores = 0;
  let totalQuizzes = 0;

  for (const userNpk in quizResults) {
    const userResults = quizResults[userNpk];
    for (const module in userResults) {
      const result = userResults[module];
      // Participation by department
      if (!stats.participationByDepartment[result.department]) {
        stats.participationByDepartment[result.department] = new Set();
      }
      stats.participationByDepartment[result.department].add(userNpk);

      // Performance by module
      if (!stats.performanceByModule[module]) {
        stats.performanceByModule[module] = { totalScore: 0, count: 0 };
      }
      stats.performanceByModule[module].totalScore += result.score;
      stats.performanceByModule[module].count++;

      // Module completion
      if (!stats.moduleCompletion[module]) {
        stats.moduleCompletion[module] = new Set();
      }
      stats.moduleCompletion[module].add(userNpk);

      totalScores += result.score;
      totalQuizzes++;
    }
  }

  // Convert sets to counts
  for (const dept in stats.participationByDepartment) {
    stats.participationByDepartment[dept] = stats.participationByDepartment[dept].size;
  }
  for (const module in stats.moduleCompletion) {
    stats.moduleCompletion[module] = stats.moduleCompletion[module].size;
  }

  stats.averageScore = totalQuizzes ? (totalScores / totalQuizzes).toFixed(2) : 0;

  return stats;
}

// Function to display statistics on stats.html
function displayStatistics() {
  checkLogin();
  const stats = calculateStatistics();

  // Participation by department
  const participationDiv = document.getElementById('participationByDepartment');
  if (participationDiv) {
    participationDiv.innerHTML = '';
    for (const dept in stats.participationByDepartment) {
      const p = document.createElement('p');
      p.textContent = `${dept}: ${stats.participationByDepartment[dept]} peserta`;
      participationDiv.appendChild(p);
    }
  }

  // Performance by module
  const performanceDiv = document.getElementById('performanceByModule');
  if (performanceDiv) {
    performanceDiv.innerHTML = '';
    for (const module in stats.performanceByModule) {
      const avg = (stats.performanceByModule[module].totalScore / stats.performanceByModule[module].count).toFixed(2);
      const p = document.createElement('p');
      p.textContent = `${module}: Rata-rata skor ${avg}`;
      performanceDiv.appendChild(p);
    }
  }

  // Average score
  const averageScoreDiv = document.getElementById('averageScore');
  if (averageScoreDiv) {
    averageScoreDiv.textContent = `Rata-rata skor quiz keseluruhan: ${stats.averageScore}`;
  }

  // Module completion
  const completionDiv = document.getElementById('moduleCompletion');
  if (completionDiv) {
    completionDiv.innerHTML = '';
    for (const module in stats.moduleCompletion) {
      const p = document.createElement('p');
      p.textContent = `${module}: ${stats.moduleCompletion[module]} peserta menyelesaikan modul`;
      completionDiv.appendChild(p);
    }
  }
}

// If on stats.html, display statistics
if (window.location.pathname.endsWith('stats.html')) {
  window.addEventListener('DOMContentLoaded', displayStatistics);
}

// If on modules.html or module pages, check login
if (
  window.location.pathname.endsWith('modules.html') ||
  window.location.pathname.match(/module\d+\.html$/)
) {
  checkLogin();
}
