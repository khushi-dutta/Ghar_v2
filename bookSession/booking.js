document.addEventListener('DOMContentLoaded', function() {
    initBookingInterface();
});

// Global variables
let selectedSpecialty = null;
let selectedTherapist = null;
let selectedDate = null;
let selectedTime = null;
let selectedPrice = 0;
let selectedPaymentMethod = null;

// Initializing
function initBookingInterface() {
    document.querySelector('.step:first-child').classList.add('active');
    
    document.getElementById('step1').classList.remove('hidden');
    
    const specialtyButtons = document.querySelectorAll('.select-btn');
    specialtyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.option-card');
            const specialty = card.querySelector('h3').textContent;
            const price = card.querySelector('.price').textContent;
            
            selectedSpecialty = specialty;
            selectedPrice = price;
            
            const specialtyInfoElements = document.querySelectorAll('.selected-specialty');
            specialtyInfoElements.forEach(element => {
                element.textContent = `Specialty: ${specialty}`;
            });

            updateStep(1, 2);
            
            showSection('step2');
        });
    });
    
    //therapist selection
    const therapistButtons = document.querySelectorAll('.therapist-select-btn');
    therapistButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.therapist-card');
            const therapist = card.querySelector('.therapist-name').textContent;
            
            selectedTherapist = therapist;
            
            document.querySelector('.selected-therapist').textContent = `Therapist: ${therapist}`;

            const specialtyInfoElements = document.querySelectorAll('.selected-specialty');
            specialtyInfoElements.forEach(element => {
                element.textContent = `Specialty: ${selectedSpecialty}`;
            });
            
            // Update steps
            updateStep(2, 3);

            showSection('step3');
        });
    });
    
    const slots = document.querySelectorAll('.slot');
    slots.forEach(slot => {
        slot.addEventListener('click', function() {
            slots.forEach(s => s.classList.remove('selected'));

            this.classList.add('selected');
            
            selectedTime = this.textContent;
            
            document.querySelector('#scheduleSubmit').removeAttribute('disabled');
        });
    });
    
    //scheduling submit
    document.getElementById('scheduleSubmit').addEventListener('click', function() {
        if (selectedTime) {
            updateStep(3, 4);

            showSection('step4');

            updateBookingSummary();
        }
    });
    
    //payment method selection
    const paymentOptions = document.querySelectorAll('.payment-option');
    const paymentForms = document.querySelectorAll('.payment-form');
    
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            const method = this.getAttribute('data-method');
            
            paymentForms.forEach(form => form.classList.add('hidden'));
            
            document.getElementById(`${method}Form`).classList.remove('hidden');
            
            selectedPaymentMethod = method;

            document.querySelector('#paymentSubmit').removeAttribute('disabled');
        });
    });
    
    //payment submit
    document.getElementById('paymentSubmit').addEventListener('click', function(e) {
        e.preventDefault();
        
        if (validatePaymentForm()) {
            updateStep(4, 'completed');
            
            showSection('confirmation');

            updateConfirmationDetails();
        }
    });

    const backButtons = document.querySelectorAll('.back-btn');
    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = parseInt(this.getAttribute('data-current-step'));
            const previousStep = currentStep - 1;
            

            updateStep(currentStep, previousStep);

            showSection(`step${previousStep}`);
        });
    });
    
    //date picker for the calendar
    initializeCalendar();
}

function updateStep(currentStep, nextStep) {

    document.querySelector(`.step:nth-child(${currentStep})`).classList.remove('active');
    document.querySelector(`.step:nth-child(${currentStep})`).classList.add('completed');

    if (nextStep !== 'completed') {
        document.querySelector(`.step:nth-child(${nextStep})`).classList.add('active');
    }
}

function showSection(sectionId) {

    const sections = document.querySelectorAll('.booking-section');
    sections.forEach(section => section.classList.add('hidden'));
    
    document.getElementById(sectionId).classList.remove('hidden');
    

    window.scrollTo(0, 0);
}

//calendar initialize
function initializeCalendar() {
    const calendar = document.getElementById('calendar');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const calendarHTML = createCalendarHTML(currentMonth, currentYear);
    calendar.innerHTML = calendarHTML;
    
    //calendar days
    const days = calendar.querySelectorAll('.calendar-day:not(.disabled)');
    days.forEach(day => {
        day.addEventListener('click', function() {
            days.forEach(d => d.classList.remove('selected'));
            
            this.classList.add('selected');
            
            selectedDate = `${currentYear}-${currentMonth + 1}-${this.textContent.trim()}`;
            
            //time slots
            document.querySelector('.time-slots').classList.remove('hidden');
        });
    });
}

//calendar HTML
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
    
    for (let i = 0; i < firstDayOfMonth; i++) {
        html += `<div class="calendar-day disabled"></div>`;
    }
    
    const today = new Date().getDate();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    for (let day = 1; day <= daysInMonth; day++) {
        if (year === currentYear && month === currentMonth && day < today) {
            html += `<div class="calendar-day disabled">${day}</div>`;
        } else {
            html += `<div class="calendar-day">${day}</div>`;
        }
    }
    
    html += `</div>`;
    return html;
}

//booking summary
function updateBookingSummary() {
    document.getElementById('summarySpecialty').textContent = selectedSpecialty;
    document.getElementById('summaryTherapist').textContent = selectedTherapist;
    document.getElementById('summaryDate').textContent = formatDate(selectedDate);
    document.getElementById('summaryTime').textContent = selectedTime;
    document.getElementById('summaryPrice').textContent = selectedPrice;
    document.getElementById('summaryTotal').textContent = selectedPrice;
}

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

//confirmation details
function updateConfirmationDetails() {
    document.getElementById('confirmSpecialty').textContent = selectedSpecialty;
    document.getElementById('confirmTherapist').textContent = selectedTherapist;
    document.getElementById('confirmDate').textContent = formatDate(selectedDate);
    document.getElementById('confirmTime').textContent = selectedTime;
    document.getElementById('confirmMethod').textContent = selectedPaymentMethod.toUpperCase();
    document.getElementById('confirmPrice').textContent = selectedPrice;
    
    //Random booking ID
    const bookingId = `GH-${Math.floor(100000 + Math.random() * 900000)}`;
    document.getElementById('confirmBookingId').textContent = bookingId;
} 