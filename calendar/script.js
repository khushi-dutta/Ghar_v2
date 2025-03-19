// DOM Elements
const calendarEl = document.getElementById('calendar');
const currentMonthEl = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const moodBtns = document.querySelectorAll('.mood-btn');
const moodNoteEl = document.getElementById('moodNote');
const saveMoodBtn = document.getElementById('saveMood');
const moodGraphEl = document.getElementById('moodGraph');
const noteViewerEl = document.getElementById('noteViewer');
const noteDateEl = document.getElementById('noteDate');
const noteMoodEl = document.getElementById('noteMood');
const noteTextEl = document.getElementById('noteText');
const closeNoteBtn = document.getElementById('closeNote');
const avgMoodEl = document.getElementById('avgMood');
const totalEntriesEl = document.getElementById('totalEntries');
const greatDaysEl = document.getElementById('greatDays');
const sadDaysEl = document.getElementById('sadDays');
const clearDataBtn = document.getElementById('clearData');
const partyAnimationEl = document.getElementById('partyAnimation');
const viewHistoryBtn = document.getElementById('viewHistory');
const bookContainerEl = document.getElementById('bookContainer');
const bookCoverEl = document.querySelector('.book-cover');
const bookPageEl = document.getElementById('bookPage');
const pageDateEl = document.getElementById('pageDate');
const pageMoodEl = document.getElementById('pageMood');
const pageNoteEl = document.getElementById('pageNote');
const pageNumberEl = document.getElementById('pageNumber');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const closeBookBtn = document.getElementById('closeBook');

// State
let currentDate = new Date();
let selectedDate = new Date();
let selectedMood = null;
let moodData = JSON.parse(localStorage.getItem('moodData')) || {};
let moodChart = null;
let bookEntries = [];
let currentPage = 0;

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    updateMoodInput();
    renderMoodGraph();
    updateStats();
});

// Event Listeners
prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        moodBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedMood = parseInt(btn.dataset.mood);
    });
});

saveMoodBtn.addEventListener('click', saveMood);

closeNoteBtn.addEventListener('click', () => {
    noteViewerEl.classList.remove('visible');
});

clearDataBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all your mood data? This cannot be undone.')) {
        moodData = {};
        localStorage.removeItem('moodData');
        renderCalendar();
        updateMoodInput();
        renderMoodGraph();
        updateStats();
        showToast('All mood data has been cleared');
    }
});

viewHistoryBtn.addEventListener('click', openMoodBook);

closeBookBtn.addEventListener('click', closeBook);

prevPageBtn.addEventListener('click', () => {
    navigateBook(-1);
});

nextPageBtn.addEventListener('click', () => {
    navigateBook(1);
});

// Book Functions
function openMoodBook() {
    // Get all entries and sort by date (oldest first for chronological order)
    bookEntries = Object.entries(moodData).map(([date, data]) => ({
        date,
        ...data
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (bookEntries.length === 0) {
        showToast('No mood entries to display');
        return;
    }
    
    currentPage = 0;
    
    // Show the book container with just the cover
    bookContainerEl.classList.add('open');
    
    // Make sure page container is hidden initially
    const bookPageContainer = document.querySelector('.book-page-container');
    bookPageContainer.classList.remove('visible');
    
    // Show the cover for 2 seconds before opening the book
    showToast('Opening your mood journal...');
    
    // Prepare the page content behind the scenes
    displayBookPage();
    
    // After 2 seconds, open the book
    setTimeout(() => {
        bookCoverEl.style.transform = 'rotateY(-180deg)';
        
        // After the cover is fully rotated, show the page content
        setTimeout(() => {
            bookPageContainer.classList.add('visible');
        }, 500);
    }, 2000);
}

function closeBook() {
    // Hide the page content first
    const bookPageContainer = document.querySelector('.book-page-container');
    bookPageContainer.classList.remove('visible');
    
    // Animate closing the book
    setTimeout(() => {
        bookCoverEl.style.transform = 'rotateY(0deg)';
    }, 200);
    
    // Hide the container after animation
    setTimeout(() => {
        bookContainerEl.classList.remove('open');
    }, 1200);
}

function navigateBook(direction) {
    // Calculate the new page index
    const newPage = currentPage + direction;
    
    // Check if it's within bounds
    if (newPage < 0 || newPage >= bookEntries.length) {
        return;
    }
    
    // Update current page first to prepare content for animation
    currentPage = newPage;
    
    // Create page turn animation
    const pageTurnAnimation = document.createElement('div');
    pageTurnAnimation.className = 'page-turn-animation';
    pageTurnAnimation.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: white;
        transform-origin: ${direction > 0 ? 'left' : 'right'} center;
        z-index: 10;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        border-radius: 0 5px 5px 0;
    `;
    
    // Add a paper texture to the turning page
    const paperTexture = document.createElement('div');
    paperTexture.className = 'paper-texture';
    pageTurnAnimation.appendChild(paperTexture);
    
    // Add the animation to the book
    bookPageEl.appendChild(pageTurnAnimation);
    
    // Start animation
    requestAnimationFrame(() => {
        pageTurnAnimation.style.transition = 'transform 0.5s ease-in-out';
        pageTurnAnimation.style.transform = `rotateY(${direction > 0 ? '-180deg' : '180deg'})`;
        
        // Update content behind the animation
        displayBookPage();
    });
    
    // Remove the animation when it's done
    setTimeout(() => {
        bookPageEl.removeChild(pageTurnAnimation);
    }, 500);
}

function displayBookPage() {
    if (bookEntries.length === 0) return;
    
    const entry = bookEntries[currentPage];
    const date = new Date(entry.date);
    
    // Update page content
    pageDateEl.textContent = formatDateLong(date);
    
    const moodEmojis = ['', '😢 Awful', '😔 Sad', '😐 Okay', '😊 Good', '😁 Great'];
    pageMoodEl.textContent = `Mood: ${moodEmojis[entry.mood]}`;
    
    pageNoteEl.textContent = entry.note || "No notes added for this day.";
    
    // Update page navigation
    prevPageBtn.disabled = currentPage === 0;
    nextPageBtn.disabled = currentPage === bookEntries.length - 1;
    
    // Update page number
    pageNumberEl.textContent = `Page ${currentPage + 1} of ${bookEntries.length}`;
}

// Functions
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update header
    currentMonthEl.textContent = `${getMonthName(month)} ${year}`;
    
    // Clear calendar
    calendarEl.innerHTML = '';
    
    // Get first day of the month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Previous month's days
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
        const dayEl = createDayElement(prevMonthDays - i, true);
        calendarEl.appendChild(dayEl);
    }
    
    // Current month's days
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        const dateStr = formatDate(date);
        
        const dayEl = createDayElement(i, false);
        
        // Check if there's mood data for this day
        if (moodData[dateStr]) {
            dayEl.classList.add('has-mood');
            dayEl.classList.add(`mood-${moodData[dateStr].mood}`);
        }
        
        // Check if it's today
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayEl.classList.add('today');
        }
        
        // Check if it's the selected date
        if (i === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()) {
            dayEl.classList.add('selected');
        }
        
        // Check if it's a future date
        const isFutureDate = date > today;
        if (isFutureDate) {
            dayEl.style.cursor = 'not-allowed';
            dayEl.style.opacity = '0.5';
        }
        
        dayEl.addEventListener('click', () => {
            // Don't allow selecting future dates
            if (isFutureDate) {
                showToast("You cannot record mood for future dates!");
                return;
            }
            
            selectedDate = new Date(year, month, i);
            renderCalendar();
            updateMoodInput();
            
            // If there's mood data for this date, show it in the note viewer
            if (moodData[dateStr]) {
                showNote(dateStr);
            } else {
                noteViewerEl.classList.remove('visible');
            }
        });
        
        calendarEl.appendChild(dayEl);
    }
    
    // Next month's days
    const totalCells = 42; // 6 rows, 7 columns
    const remainingCells = totalCells - (firstDay + daysInMonth);
    for (let i = 1; i <= remainingCells; i++) {
        const dayEl = createDayElement(i, true);
        calendarEl.appendChild(dayEl);
    }
}

function createDayElement(day, inactive) {
    const dayEl = document.createElement('div');
    dayEl.classList.add('calendar-day');
    if (inactive) {
        dayEl.classList.add('inactive');
    }
    dayEl.textContent = day;
    return dayEl;
}

function updateMoodInput() {
    const dateStr = formatDate(selectedDate);
    
    // Reset selection
    moodBtns.forEach(btn => btn.classList.remove('selected'));
    moodNoteEl.value = '';
    selectedMood = null;
    
    // If there's mood data for the selected date, load it
    if (moodData[dateStr]) {
        const { mood, note } = moodData[dateStr];
        moodBtns[5 - mood].classList.add('selected');
        selectedMood = mood;
        moodNoteEl.value = note || '';
    }
    
    // Update title
    const moodInputTitle = document.querySelector('.mood-input h3');
    moodInputTitle.textContent = `How are you feeling on ${formatDateLong(selectedDate)}?`;
    
    // Disable input for future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isFutureDate = selectedDate > today;
    
    moodBtns.forEach(btn => {
        btn.disabled = isFutureDate;
        if (isFutureDate) {
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        } else {
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    });
    
    moodNoteEl.disabled = isFutureDate;
    saveMoodBtn.disabled = isFutureDate;
    
    if (isFutureDate) {
        moodInputTitle.textContent = `You cannot record mood for future dates!`;
        moodNoteEl.placeholder = "Future date entries are disabled";
    } else {
        moodNoteEl.placeholder = "Add a note about your day (optional)";
    }
}

function saveMood() {
    if (selectedMood === null) {
        showToast('Please select a mood');
        return;
    }
    
    const dateStr = formatDate(selectedDate);
    moodData[dateStr] = {
        mood: selectedMood,
        note: moodNoteEl.value,
        timestamp: new Date().getTime()
    };
    
    // Save to localStorage
    localStorage.setItem('moodData', JSON.stringify(moodData));
    
    // Update UI
    renderCalendar();
    updateStats();
    renderMoodGraph();
    
    // Show success message
    showToast("Mood saved successfully!");
    
    // If mood is Great, show party animation
    if (selectedMood === 5) {
        showPartyAnimation();
    }
}

function showNote(dateStr) {
    const data = moodData[dateStr];
    if (!data) return;
    
    const date = new Date(dateStr);
    noteDateEl.textContent = formatDateLong(date);
    
    const moodEmojis = ['', '😢 Awful', '😔 Sad', '😐 Okay', '😊 Good', '😁 Great'];
    noteMoodEl.textContent = `Mood: ${moodEmojis[data.mood]}`;
    
    noteTextEl.textContent = data.note || "No note added for this day.";
    
    noteViewerEl.classList.add('visible');
}

function updateStats() {
    // Calculate total entries
    const entries = Object.values(moodData);
    const totalEntries = entries.length;
    totalEntriesEl.textContent = totalEntries;
    
    if (totalEntries === 0) {
        avgMoodEl.textContent = "-";
        greatDaysEl.textContent = "0";
        sadDaysEl.textContent = "0";
        return;
    }
    
    // Calculate average mood
    const sum = entries.reduce((total, entry) => total + entry.mood, 0);
    const avg = sum / totalEntries;
    avgMoodEl.textContent = avg.toFixed(1);
    
    // Calculate great days (mood 4 or 5)
    const greatDays = entries.filter(entry => entry.mood >= 4).length;
    greatDaysEl.textContent = greatDays;
    
    // Calculate sad days (mood 1 or 2)
    const sadDays = entries.filter(entry => entry.mood <= 2).length;
    sadDaysEl.textContent = sadDays;
}

function renderMoodGraph() {
    // Destroy existing chart if it exists
    if (moodChart) {
        moodChart.destroy();
    }
    
    // Get the last 30 days of mood data
    const today = new Date();
    const dates = [];
    const moods = [];
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = formatDate(date);
        
        dates.push(formatDateShort(date));
        
        if (moodData[dateStr]) {
            moods.push(moodData[dateStr].mood);
        } else {
            moods.push(null);
        }
    }
    
    // Calculate average line data
    const avgMoods = moods.filter(mood => mood !== null);
    let avgValue = 3; // Default to middle if no data
    if (avgMoods.length > 0) {
        avgValue = avgMoods.reduce((sum, mood) => sum + mood, 0) / avgMoods.length;
    }
    const avgLine = Array(dates.length).fill(avgValue);
    
    // Create chart
    const ctx = moodGraphEl.getContext('2d');
    moodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Mood',
                    data: moods,
                    backgroundColor: 'rgba(32, 201, 151, 0.2)',
                    borderColor: 'rgba(32, 201, 151, 1)',
                    borderWidth: 2,
                    tension: 0.4, // Add curve between points
                    fill: true,
                    pointBackgroundColor: 'rgba(32, 201, 151, 1)',
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Average',
                    data: avgLine,
                    borderColor: 'rgba(12, 166, 120, 0.7)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    min: 0.5,
                    max: 5.5,
                    stepSize: 1,
                    ticks: {
                        callback: function(value) {
                            const labels = ['', 'Awful', 'Sad', 'Okay', 'Good', 'Great'];
                            return labels[Math.round(value)];
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.label === 'Average') {
                                return `Average: ${avgValue.toFixed(1)}`;
                            }
                            const labels = ['', 'Awful', 'Sad', 'Okay', 'Good', 'Great'];
                            const value = context.parsed.y;
                            return value ? labels[Math.round(value)] : 'No data';
                        }
                    }
                }
            }
        }
    });
}

// Helper Functions
function getMonthName(month) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month];
}

function formatDate(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

function formatDateLong(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatDateShort(date) {
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function showToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.style.zIndex = '10000';
    
    // Add to body
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 500);
    }, 3000);
}

function showPartyAnimation() {
    // Create confetti
    for (let i = 0; i < 100; i++) {
        createConfetti();
    }
    
    // Party popper image
    partyAnimationEl.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; opacity: 0.6;">
      <text x="50%" y="50%" font-size="100" text-anchor="middle" dominant-baseline="middle" fill="#FFD700">🎉 GREAT DAY! 🎉</text>
    </svg>`;
    
    partyAnimationEl.classList.add('active');
    
    setTimeout(() => {
        partyAnimationEl.classList.remove('active');
        // Remove all confetti
        document.querySelectorAll('.confetti').forEach(el => el.remove());
    }, 3000);
}

function createConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = getRandomColor();
    confetti.style.width = Math.random() * 10 + 5 + 'px';
    confetti.style.height = Math.random() * 10 + 5 + 'px';
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.style.animationDuration = (Math.random() * 2) + 2 + 's';
    document.body.appendChild(confetti);
    
    // Remove confetti after animation ends
    setTimeout(() => {
        confetti.remove();
    }, 4000);
}

function getRandomColor() {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    return colors[Math.floor(Math.random() * colors.length)];
} 