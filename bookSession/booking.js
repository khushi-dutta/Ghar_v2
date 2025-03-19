document.addEventListener('DOMContentLoaded', function() {
    // Initialize the booking interface
    initBookingInterface();
});

// Global variables for tracking booking state
let selectedSpecialty = null;
let selectedTherapist = null;
let selectedDate = null;
let selectedTime = null;
let selectedPrice = 0;
let selectedPaymentMethod = null;

// Initialize the booking interface
function initBookingInterface() {
    // Set the first step as active
    document.querySelector('.step:first-child').classList.add('active');
    
    // Show the first section
    document.getElementById('step1').classList.remove('hidden');
    
    // Add event listeners for specialty selection
    const specialtyButtons = document.querySelectorAll('.select-btn');
    specialtyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.option-card');
            const specialty = card.querySelector('h3').textContent;
            const price = card.querySelector('.price').textContent;
            
            selectedSpecialty = specialty;
            selectedPrice = price;
            
            // Update the selection info in both step 2 and step 3
            const specialtyInfoElements = document.querySelectorAll('.selected-specialty');
            specialtyInfoElements.forEach(element => {
                element.textContent = `Specialty: ${specialty}`;
            });
            
            // Update steps
            updateStep(1, 2);
            
            // Show therapist selection
            showSection('step2');
        });
    });
    
    // Add event listeners for therapist selection
    const therapistButtons = document.querySelectorAll('.therapist-select-btn');
    therapistButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.therapist-card');
            const therapist = card.querySelector('.therapist-name').textContent;
            
            selectedTherapist = therapist;
            
            // Update the selection info
            document.querySelector('.selected-therapist').textContent = `Therapist: ${therapist}`;
            
            // Ensure specialty is still displayed correctly
            const specialtyInfoElements = document.querySelectorAll('.selected-specialty');
            specialtyInfoElements.forEach(element => {
                element.textContent = `Specialty: ${selectedSpecialty}`;
            });
            
            // Update steps
            updateStep(2, 3);
            
            // Show scheduling section
            showSection('step3');
        });
    });
    
    // Add event listeners for time slot selection
    const slots = document.querySelectorAll('.slot');
    slots.forEach(slot => {
        slot.addEventListener('click', function() {
            // Remove selection from all slots
            slots.forEach(s => s.classList.remove('selected'));
            
            // Add selection to clicked slot
            this.classList.add('selected');
            
            selectedTime = this.textContent;
            
            // Enable the proceed button
            document.querySelector('#scheduleSubmit').removeAttribute('disabled');
        });
    });
    
    // Add event listener for scheduling submit
    document.getElementById('scheduleSubmit').addEventListener('click', function() {
        if (selectedTime) {
            // Update steps
            updateStep(3, 4);
            
            // Show payment section
            showSection('step4');
            
            // Update summary
            updateBookingSummary();
        }
    });
    
    // Add event listeners for payment method selection
    const paymentOptions = document.querySelectorAll('.payment-option');
    const paymentForms = document.querySelectorAll('.payment-form');
    
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            const method = this.getAttribute('data-method');
            
            // Hide all payment forms
            paymentForms.forEach(form => form.classList.add('hidden'));
            
            // Show selected payment form
            document.getElementById(`${method}Form`).classList.remove('hidden');
            
            selectedPaymentMethod = method;
            
            // Enable the payment button
            document.querySelector('#paymentSubmit').removeAttribute('disabled');
        });
    });
    
    // Add event listener for payment submit
    document.getElementById('paymentSubmit').addEventListener('click', function(e) {
        e.preventDefault();
        
        if (validatePaymentForm()) {
            // Update steps
            updateStep(4, 'completed');
            
            // Show confirmation
            showSection('confirmation');
            
            // Update confirmation details
            updateConfirmationDetails();
        }
    });
    
    // Add event listeners for back buttons
    const backButtons = document.querySelectorAll('.back-btn');
    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = parseInt(this.getAttribute('data-current-step'));
            const previousStep = currentStep - 1;
            
            // Update steps
            updateStep(currentStep, previousStep);
            
            // Show previous section
            showSection(`step${previousStep}`);
        });
    });
    
    // Initialize date picker for the calendar
    initializeCalendar();
}

// Update the step indicator
function updateStep(currentStep, nextStep) {
    // Remove active class from current step
    document.querySelector(`.step:nth-child(${currentStep})`).classList.remove('active');
    document.querySelector(`.step:nth-child(${currentStep})`).classList.add('completed');
    
    // Add active class to next step
    if (nextStep !== 'completed') {
        document.querySelector(`.step:nth-child(${nextStep})`).classList.add('active');
    }
}

// Show section and hide others
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.booking-section');
    sections.forEach(section => section.classList.add('hidden'));
    
    // Show the target section
    document.getElementById(sectionId).classList.remove('hidden');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Initialize calendar
function initializeCalendar() {
    const calendar = document.getElementById('calendar');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Create calendar HTML
    const calendarHTML = createCalendarHTML(currentMonth, currentYear);
    calendar.innerHTML = calendarHTML;
    
    // Add event listeners to calendar days
    const days = calendar.querySelectorAll('.calendar-day:not(.disabled)');
    days.forEach(day => {
        day.addEventListener('click', function() {
            // Remove selection from all days
            days.forEach(d => d.classList.remove('selected'));
            
            // Add selection to clicked day
            this.classList.add('selected');
            
            selectedDate = `${currentYear}-${currentMonth + 1}-${this.textContent.trim()}`;
            
            // Show time slots
            document.querySelector('.time-slots').classList.remove('hidden');
        });
    });
}

// Create calendar HTML
function createCalendarHTML(month, year) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    let html = `
        <div class="calendar-header">
            <h3>${monthNames[month]} ${year}</h3>
        </div>
        <div class="calendar-grid">
            <div class="calendar-weekday">Sun</div>
            <div class="calendar-weekday">Mon</div>
            <div class="calendar-weekday">Tue</div>
            <div class="calendar-weekday">Wed</div>
            <div class="calendar-weekday">Thu</div>
            <div class="calendar-weekday">Fri</div>
            <div class="calendar-weekday">Sat</div>
    `;
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        html += `<div class="calendar-day disabled"></div>`;
    }
    
    // Add cells for each day of the month
    const today = new Date().getDate();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    for (let day = 1; day <= daysInMonth; day++) {
        // Disable past days
        if (year === currentYear && month === currentMonth && day < today) {
            html += `<div class="calendar-day disabled">${day}</div>`;
        } else {
            html += `<div class="calendar-day">${day}</div>`;
        }
    }
    
    html += `</div>`;
    return html;
}

// Update booking summary
function updateBookingSummary() {
    document.getElementById('summarySpecialty').textContent = selectedSpecialty;
    document.getElementById('summaryTherapist').textContent = selectedTherapist;
    document.getElementById('summaryDate').textContent = formatDate(selectedDate);
    document.getElementById('summaryTime').textContent = selectedTime;
    document.getElementById('summaryPrice').textContent = selectedPrice;
    document.getElementById('summaryTotal').textContent = selectedPrice;
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '';
    
    const [year, month, day] = dateString.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${day} ${months[parseInt(month) - 1]} ${year}`;
}

// Validate payment form
function validatePaymentForm() {
    let isValid = true;
    const requiredFields = document.querySelectorAll(`#${selectedPaymentMethod}Form .required`);
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('invalid');
            isValid = false;
        } else {
            field.classList.remove('invalid');
        }
    });
    
    return isValid;
}

// Update confirmation details
function updateConfirmationDetails() {
    document.getElementById('confirmSpecialty').textContent = selectedSpecialty;
    document.getElementById('confirmTherapist').textContent = selectedTherapist;
    document.getElementById('confirmDate').textContent = formatDate(selectedDate);
    document.getElementById('confirmTime').textContent = selectedTime;
    document.getElementById('confirmMethod').textContent = selectedPaymentMethod.toUpperCase();
    document.getElementById('confirmPrice').textContent = selectedPrice;
    
    // Generate a random booking ID
    const bookingId = `GH-${Math.floor(100000 + Math.random() * 900000)}`;
    document.getElementById('confirmBookingId').textContent = bookingId;
} 