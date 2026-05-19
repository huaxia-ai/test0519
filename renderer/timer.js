// DOM 元素
const timeEl = document.getElementById('time');
const phaseEl = document.getElementById('phase-label');
const progressBar = document.getElementById('progress-bar');
const progressBg = document.getElementById('progress-bg');
const btnStart = document.getElementById('btn-start');
const btnReset = document.getElementById('btn-reset');
const btnSkip = document.getElementById('btn-skip');
const btnPin = document.getElementById('btn-pin');
const btnClose = document.getElementById('btn-close');
const countEl = document.getElementById('count');

// 时间配置（秒）
const FOCUS_TIME = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

const PHASES = {
  FOCUS: { name: '专注', color: '#e74c3c' },
  SHORT_BREAK: { name: '短休息', color: '#27ae60' },
  LONG_BREAK: { name: '长休息', color: '#2980b9' }
};

const CIRCUMFERENCE = 2 * Math.PI * 90; // ~565.49

let timerInterval = null;
let currentPhase = 'FOCUS';
let timeLeft = FOCUS_TIME;
let totalTime = FOCUS_TIME;
let isRunning = false;
let pomodoroCount = 0;
let isPinned = true;

// 初始化进度条
progressBar.style.strokeDasharray = CIRCUMFERENCE;
progressBar.style.strokeDashoffset = '0';
progressBar.style.stroke = PHASES[currentPhase].color;
progressBg.style.stroke = '#333';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateDisplay() {
  timeEl.textContent = formatTime(timeLeft);

  const progress = 1 - (timeLeft / totalTime);
  const offset = CIRCUMFERENCE * (1 - progress);
  progressBar.style.strokeDashoffset = offset;

  const phase = PHASES[currentPhase];
  progressBar.style.stroke = phase.color;
  phaseEl.textContent = phase.name;
}

function switchPhase() {
  if (currentPhase === 'FOCUS') {
    pomodoroCount++;
    countEl.textContent = pomodoroCount;

    if (pomodoroCount % 4 === 0) {
      currentPhase = 'LONG_BREAK';
      timeLeft = LONG_BREAK;
      totalTime = LONG_BREAK;
    } else {
      currentPhase = 'SHORT_BREAK';
      timeLeft = SHORT_BREAK;
      totalTime = SHORT_BREAK;
    }
  } else {
    currentPhase = 'FOCUS';
    timeLeft = FOCUS_TIME;
    totalTime = FOCUS_TIME;
  }

  clearInterval(timerInterval);
  isRunning = false;
  btnStart.textContent = '开始';
  btnStart.classList.remove('paused');
  updateDisplay();
  notifyPhaseStart();
}

function notifyPhaseStart() {
  const phase = PHASES[currentPhase];
  const title = phase.name === '专注' ? '🔔 时间到！开始专注' : '🔔 休息时间到！';
  const body = phase.name === '专注'
    ? '25 分钟专注时间开始'
    : `休息 ${Math.floor(totalTime / 60)} 分钟开始`;
  window.electronAPI?.showNotification({ title, body });

  // 短暂闪烁提示
  document.getElementById('app').style.transform = 'scale(1.03)';
  setTimeout(() => {
    document.getElementById('app').style.transform = 'scale(1)';
  }, 150);
}

function tick() {
  if (timeLeft <= 0) {
    switchPhase();
    return;
  }
  timeLeft--;
  updateDisplay();
}

function startTimer() {
  if (isRunning) {
    // 暂停
    clearInterval(timerInterval);
    isRunning = false;
    btnStart.textContent = '开始';
    btnStart.classList.remove('paused');
  } else {
    // 开始
    timerInterval = setInterval(tick, 1000);
    isRunning = true;
    btnStart.textContent = '暂停';
    btnStart.classList.add('paused');
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  timeLeft = totalTime;
  btnStart.textContent = '开始';
  btnStart.classList.remove('paused');
  updateDisplay();
}

function skipPhase() {
  clearInterval(timerInterval);
  isRunning = false;
  btnStart.textContent = '开始';
  btnStart.classList.remove('paused');
  timeLeft = 0;
  tick(); // 触发切换
}

// 事件绑定
btnStart.addEventListener('click', startTimer);
btnReset.addEventListener('click', resetTimer);
btnSkip.addEventListener('click', skipPhase);

btnPin.addEventListener('click', () => {
  isPinned = !isPinned;
  btnPin.classList.toggle('active', isPinned);
  window.electronAPI?.setAlwaysOnTop(isPinned);
});

btnClose.addEventListener('click', () => {
  window.close();
});

// 初始显示
updateDisplay();
