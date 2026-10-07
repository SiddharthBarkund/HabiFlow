    // --- RIGHT CLICK DISABLE (Added Here) ---
    document.addEventListener('contextmenu', function(event) {
        event.preventDefault();
    });

    // --- QUOTES ARRAY ---
    const quotes = [
        "Your life changes the moment you decide to change yourself.",
        "Small steps every day create big results over time.",
        "Don’t wait for motivation. Build discipline.",
        "You are one decision away from a completely different life.",
        "Growth begins when excuses end.",
        "Rebuild yourself quietly. Let success make the noise.",
        "Every day is a new chance to become better.",
        "Pain is temporary, quitting lasts forever.",
        "Your future needs you. Don’t give up.",
        "Consistency beats talent when talent quits.",
        "Stop doubting yourself. You are capable of more.",
        "Become addicted to self-improvement.",
        "Change your habits, change your life.",
        "You didn’t come this far to stop now.",
        "Discipline today gives freedom tomorrow.",
        "One good habit can rewrite your entire story.",
        "Rebuilding yourself is hard, staying broken is harder.",
        "Focus on progress, not perfection.",
        "You owe your future self a better version of you.",
        "Don’t quit. You’re closer than you think.",
        "Life rewards those who don’t give up.",
        "Your mindset decides your direction.",
        "Every strong person was once weak but didn’t quit.",
        "Become someone your past self would be proud of.",
        "Wake up with purpose, sleep with satisfaction.",
        "Hard days build strong minds.",
        "Success is built in silence, not excuses.",
        "Fall seven times, stand up eight.",
        "The best investment is working on yourself.",
        "Keep going. Your story isn’t finished yet.",
        "You are rebuilding — trust the process.",
        "Today’s effort is tomorrow’s confidence.",
        "Change begins with a single habit.",
        "Be patient with yourself, but never stop.",
        "Your comfort zone is stealing your future.",
        "Discipline is choosing what you want most over what you want now.",
        "No one can stop you except you.",
        "Every day you don’t quit, you win.",
        "Turn pain into power.",
        "Your habits shape your destiny.",
        "Don’t wait for the perfect moment. Create it.",
        "A focused mind can change a life.",
        "You grow when you choose effort over excuses.",
        "Becoming better is a daily choice.",
        "You are rebuilding — and that takes courage.",
        "Consistency today builds confidence tomorrow.",
        "Your struggle is proof that you are trying.",
        "Progress, not excuses. Always.",
        "Keep showing up, even on hard days.",
        "Never give up on the life you want to build."
    ];

    // --- CHECK SESSION ON LOAD ---
    document.addEventListener("DOMContentLoaded", checkSession);

    async function checkSession() {
        try {
            const res = await fetch('/api/check_session');
            const data = await res.json();

            if (data.is_logged_in) {
                // If logged in, skip login screen directly
                document.getElementById('authSection').style.display = 'none';
                document.getElementById('mainAppSection').style.display = 'block';
                
                // Populate Profile Data
                document.getElementById('setFullName').value = data.first_name;
                document.getElementById('setUsername').value = data.username;
                document.getElementById('setEmail').value = data.email;

                // Load App
                initAppWithDB(data.first_name);
            } else {
                // If not logged in, show login screen
                document.getElementById('authSection').style.display = 'flex';
                document.getElementById('mainAppSection').style.display = 'none';
            }
        } catch (error) {
            console.error("Session check failed", error);
        }
    }

    // --- AUTHENTICATION LOGIC ---

    function switchTab(tab) {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('signupForm').style.display = 'none';
        document.getElementById('forgotForm').style.display = 'none';
        
        if(tab === 'login') document.getElementById('loginForm').style.display = 'block';
        if(tab === 'signup') document.getElementById('signupForm').style.display = 'block';
        if(tab === 'forgot') {
            document.getElementById('forgotForm').style.display = 'block';
            document.getElementById('forgotStep1').style.display = 'block';
            document.getElementById('forgotStep2').style.display = 'none';
        }
    }

    async function registerUser() {
        const first = document.getElementById('regFirstName').value;
        const last = document.getElementById('regLastName').value;
        const user = document.getElementById('regUsername').value;
        const pass = document.getElementById('regPassword').value;
        const q1 = document.getElementById('regQ1').value;
        const a1 = document.getElementById('regA1').value;
        const q2 = document.getElementById('regQ2').value;
        const a2 = document.getElementById('regA2').value;

        if(!user || !pass || !a1 || !a2) { alert('Please fill all fields'); return; }

        const res = await fetch('/api/signup', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ first_name: first, last_name: last, username: user, password: pass, q1, a1, q2, a2 })
        });
        const data = await res.json();
        alert(data.message);
        if(data.success) switchTab('login');
    }

    async function loginUser() {
        const user = document.getElementById('loginUsername').value;
        const pass = document.getElementById('loginPassword').value;

        const res = await fetch('/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username: user, password: pass })
        });
        const data = await res.json();
        
        if(data.success) {
            document.getElementById('authSection').style.display = 'none';
            document.getElementById('mainAppSection').style.display = 'block';
            
            // Set settings data
            document.getElementById('setFullName').value = data.first_name; 
            document.getElementById('setUsername').value = user;

            initAppWithDB(data.first_name); 
        } else {
            alert(data.message);
        }
    }

    async function fetchSecurityQuestions() {
        const user = document.getElementById('forgotUsername').value;
        if(!user) return alert('Enter username');

        const res = await fetch('/api/get_security_questions', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username: user })
        });
        const data = await res.json();
        
        if(data.success) {
            document.getElementById('labelQ1').innerText = data.q1;
            document.getElementById('labelQ2').innerText = data.q2;
            document.getElementById('forgotStep1').style.display = 'none';
            document.getElementById('forgotStep2').style.display = 'block';
        } else {
            alert(data.message);
        }
    }

    async function resetPassword() {
        const user = document.getElementById('forgotUsername').value;
        const a1 = document.getElementById('forgotA1').value;
        const a2 = document.getElementById('forgotA2').value;
        const newPass = document.getElementById('newPass').value;

        const res = await fetch('/api/reset_password', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username: user, a1, a2, new_password: newPass })
        });
        const data = await res.json();
        alert(data.message);
        if(data.success) switchTab('login');
    }

    // --- NEW LOGOUT & SETTINGS LOGIC ---
    
    function toggleUserMenu() {
        const dd = document.getElementById("userDropdown");
        dd.classList.toggle("show");
    }

    window.onclick = function(event) {
        if (!event.target.matches('.user-menu-btn')) {
            const dropdowns = document.getElementsByClassName("user-dropdown");
            for (let i = 0; i < dropdowns.length; i++) {
                const openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
        if (event.target.classList.contains('modal')) {
            event.target.style.display = "none";
        }
    }

    function confirmLogout() {
        if(confirm("Are you sure you want to logout?")) {
            logoutUser();
        }
    }

    async function logoutUser() {
        await fetch('/api/logout');
        location.reload();
    }

    function openSettings() {
        document.getElementById('settingsModal').style.display = 'flex';
        document.getElementById("userDropdown").classList.remove("show");
    }

    function openModal(id) {
        document.getElementById(id).style.display = 'flex';
    }

    function toggleTheme() {
        const body = document.body;
        body.classList.toggle('light-mode');
        const isLight = body.classList.contains('light-mode');
        
        const btnText = document.getElementById('themeText');
        const btnIcon = document.getElementById('themeIcon');
        
        if(isLight) {
            btnText.innerText = "Switch to Dark Mode";
            btnIcon.innerText = "☀️";
        } else {
            btnText.innerText = "Switch to Light Mode";
            btnIcon.innerText = "🌙";
        }
    }

    // --- UPDATED SAVE PROFILE FUNCTION ---
    async function saveProfile() {
        const newName = document.getElementById('setFullName').value;
        const email = document.getElementById('setEmail').value;
        
        // Backend call to save profile
        const res = await fetch('/api/update_profile', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ full_name: newName, email: email })
        });
        
        const data = await res.json();
        
        if(data.success) {
            document.getElementById('greetingDisplay').innerText = `Welcome Back, ${newName}!`;
            alert(data.message);
        } else {
            alert("Error updating profile.");
        }
    }

    // --- NEW UPDATE FUNCTIONS ---

    async function updatePassword() {
        const currentPass = document.getElementById('cpCurrent').value;
        const newPass = document.getElementById('cpNew').value;
        const confirmPass = document.getElementById('cpConfirm').value;

        if(!currentPass || !newPass || !confirmPass) {
            alert("Please fill all fields.");
            return;
        }
        if(newPass !== confirmPass) {
            alert("New passwords do not match!");
            return;
        }

        // NOTE: This requires backend implementation of /api/change_password
        const res = await fetch('/api/change_password', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ current_password: currentPass, new_password: newPass })
        });
        const data = await res.json();
        alert(data.message);
        if(data.success) {
            closeModal('changePasswordModal');
            // Clear fields
            document.getElementById('cpCurrent').value = '';
            document.getElementById('cpNew').value = '';
            document.getElementById('cpConfirm').value = '';
        }
    }

    async function updateSecurityQuestions() {
        const password = document.getElementById('csqPass').value;
        const q1 = document.getElementById('csqQ1').value;
        const a1 = document.getElementById('csqA1').value;
        const q2 = document.getElementById('csqQ2').value;
        const a2 = document.getElementById('csqA2').value;

        if(!password || !a1 || !a2) {
            alert("Please fill all fields and verify password.");
            return;
        }

        // NOTE: This requires backend implementation of /api/update_security_questions
        const res = await fetch('/api/update_security_questions', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ password: password, q1, a1, q2, a2 })
        });
        const data = await res.json();
        alert(data.message);
        if(data.success) {
            closeModal('changeSecurityModal');
            document.getElementById('csqPass').value = '';
            document.getElementById('csqA1').value = '';
            document.getElementById('csqA2').value = '';
        }
    }


    // --- MAIN APP LOGIC ---

    // --- REPORT GENERATION LOGIC ---
    function generateReportHTML() {
        const monthKey = getMonthKey(currentDate);
        const habits = allData[monthKey] || [];
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        
        document.getElementById('reportDateRange').innerText = `Report for: ${currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`;

        const categories = {
            'Excellent': { habits: [], color: 'var(--accent-green)', range: '80-100%' },
            'Good': { habits: [], color: 'var(--accent-blue)', range: '60-79%' },
            'Average': { habits: [], color: 'var(--accent-yellow)', range: '30-59%' },
            'Bad': { habits: [], color: 'var(--accent-red)', range: '0-29%' }
        };

        const todayDate = new Date().getDate();
        let weekStart = Math.floor((todayDate - 1) / 7) * 7 + 1;
        let weekEnd = Math.min(weekStart + 6, daysInMonth);
        let weekDaysCount = (weekEnd - weekStart) + 1;

        habits.forEach(h => {
            let monthlyDone = 0;
            if(h.history) {
                 Object.keys(h.history).forEach(k => { if(h.history[k]) monthlyDone++; });
            }
            let monthlyPerc = Math.round((monthlyDone / daysInMonth) * 100);

            let weeklyDone = 0;
            for(let i=weekStart; i<=weekEnd; i++) {
                if(h.history && h.history[`d${i}`]) weeklyDone++;
            }
            let weeklyPerc = Math.round((weeklyDone / weekDaysCount) * 100);

            let threeMonthDone = 0;
            let threeMonthTotalDays = 0;

            for (let m = 0; m < 3; m++) {
                let d = new Date(currentDate.getFullYear(), currentDate.getMonth() - m, 1);
                let mKey = getMonthKey(d);
                let mDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
                
                if (allData[mKey]) {
                    let hFound = allData[mKey].find(item => item.name === h.name);
                    if (hFound) {
                        threeMonthTotalDays += mDays;
                        if (hFound.history) {
                            Object.values(hFound.history).forEach(val => { if(val) threeMonthDone++; });
                        }
                    }
                }
            }
            
            let threeMonthPerc = threeMonthTotalDays > 0 
                ? Math.round((threeMonthDone / threeMonthTotalDays) * 100) 
                : 0;

            const habitObj = { name: h.name, mPerc: monthlyPerc, wPerc: weeklyPerc, tPerc: threeMonthPerc };

            if(monthlyPerc >= 80) categories['Excellent'].habits.push(habitObj);
            else if(monthlyPerc >= 60) categories['Good'].habits.push(habitObj);
            else if(monthlyPerc >= 30) categories['Average'].habits.push(habitObj);
            else categories['Bad'].habits.push(habitObj);
        });

        const tbody = document.getElementById('reportTableBody');
        tbody.innerHTML = '';

        ['Excellent', 'Good', 'Average', 'Bad'].forEach(cat => {
            const data = categories[cat];
            if (data.habits.length === 0) return;

            let avgWeekly = 0, avgMonthly = 0, avg3Month = 0;
            data.habits.forEach(h => {
                avgWeekly += h.wPerc;
                avgMonthly += h.mPerc;
                avg3Month += h.tPerc;
            });
            avgWeekly = Math.round(avgWeekly / data.habits.length);
            avgMonthly = Math.round(avgMonthly / data.habits.length);
            avg3Month = Math.round(avg3Month / data.habits.length);

            let habitListHTML = data.habits.map(h => `<span class="habit-list-item">${h.name}</span>`).join('');

            const makeBar = (perc, color) => `
                <div class="pdf-progress-container">
                    <div class="pdf-progress-label">${perc}%</div>
                    <div class="pdf-progress-track" style="border-color:${color}">
                        <div class="pdf-progress-fill" style="width:${perc}%; background:${color}"></div>
                    </div>
                </div>
            `;

            const row = `
                <tr class="cat-row cat-${cat.toLowerCase()}">
                    <td style="font-weight:bold; font-size:1.1rem; color:${data.color}; border-right:2px solid var(--border);">${cat}</td>
                    <td style="border-right:1px solid var(--border);">${habitListHTML}</td>
                    <td>${makeBar(avgWeekly, data.color)}</td>
                    <td>${makeBar(avgMonthly, data.color)}</td>
                    <td>${makeBar(avg3Month, data.color)}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    async function downloadPDF() {
        generateReportHTML();
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = 210;
        const reportEl = document.getElementById('detailedReportContainer');
        reportEl.style.position = 'static'; 
        reportEl.style.left = '0';
        reportEl.style.width = '1200px'; 

        const canvas = await html2canvas(reportEl, { 
            scale: 1.5,
            useCORS: true, 
            backgroundColor: '#161b22',
            windowWidth: 1200 
        });
        
        reportEl.style.position = 'absolute';
        reportEl.style.left = '-9999px';
        reportEl.style.width = '100%';

        const imgData = canvas.toDataURL('image/png');
        const imgHeight = canvas.height * pdfWidth / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
        pdf.save('Habit_Performance_Report.pdf');
    }

    let currentDate = new Date(); 
    let currentWeekIndex = 0;
    let allData = {}; // Initialize empty, will load from DB
    const weekdaysShort = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const weekdaysFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    function getMonthKey(date) { return `${date.getFullYear()}-${date.getMonth()}`; }

    // --- REPLACED LOCALSTORAGE INIT WITH DB INIT ---
    async function initAppWithDB(firstName) { 
        document.getElementById('greetingDisplay').innerText = `Welcome Back, ${firstName}!`;
        document.getElementById('habitInput').addEventListener('keypress', (e) => { if(e.key === 'Enter') addHabit(); });
        
        // Load Data from Server
        const res = await fetch('/api/get_data');
        allData = await res.json();
        
        jumpToCurrentWeek(); 
        render(); 
        updateDailyQuote(); // Load the quote
    }

    // --- DAILY QUOTE LOGIC ---
    function updateDailyQuote() {
        const today = new Date();
        const start = new Date(today.getFullYear(), 0, 0);
        const diff = today - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        
        // Use modulo to cycle through quotes (Day 51 will use quote[1])
        const quoteIndex = dayOfYear % quotes.length;
        document.getElementById('dailyQuoteText').innerText = `"${quotes[quoteIndex]}"`;
    }

    function jumpToCurrentWeek() {
        const today = new Date();
        if (currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()) {
            const dayOfMonth = today.getDate();
            currentWeekIndex = Math.floor((dayOfMonth - 1) / 7);
        } else {
            currentWeekIndex = 0; 
        }
    }

    function handleButtonClick(btn, actionFunc) {
        btn.classList.add('shake-active');
        setTimeout(() => { btn.classList.remove('shake-active'); }, 300);
        actionFunc();
    }

    function render() {
        const monthKey = getMonthKey(currentDate);
        document.getElementById('monthLabel').innerText = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        const prevBtn = document.getElementById('prevBtn');
        // --- 2026 Logic ---
        if (currentDate.getFullYear() < 2026 || (currentDate.getFullYear() === 2026 && currentDate.getMonth() === 0)) {
             prevBtn.disabled = true;
        } else {
             prevBtn.disabled = false;
        }
        
        if (!allData[monthKey]) allData[monthKey] = [];
        
        renderTable();
        renderDailyOverview(); 
        renderWeekCards();
        renderLineGraph(); 
        renderMonthlyGraph(); 
        updateStats();
        updateDailyProgress(); 
    }

    function renderDailyOverview() {
        const monthKey = getMonthKey(currentDate);
        const habits = allData[monthKey] || [];
        const today = currentDate.getDate();
        const dayOfWeek = weekdaysFull[currentDate.getDay()];
        const fullDateString = `${dayOfWeek}, ${today} ${currentDate.toLocaleString('default', { month: 'long' })}`;
        
        const totalHabits = habits.length;
        const doneCount = habits.filter(h => h.history && h.history[`d${today}`]).length;
        const perc = totalHabits > 0 ? Math.round((doneCount / totalHabits) * 100) : 0;
        
        let message = "Let's get started!";
        if(perc === 100) message = "All done for today! 🎉";
        else if(perc >= 50) message = "Halfway there, keep going! 🚀";
        else if(perc > 0) message = "Good start! 💪";

        const container = document.getElementById('dailyOverviewSection');
        container.innerHTML = `
            <div class="daily-info">
                <h2>Today's Overview</h2>
                <div class="daily-date">${fullDateString}</div>
                <div class="daily-message">${message}</div>
            </div>
            <div class="daily-progress-container">
                <div class="dp-labels">
                    <span>Progress</span>
                    <span>${doneCount}/${totalHabits} (${perc}%)</span>
                </div>
                <div class="dp-track">
                    <div class="dp-fill" style="width: ${perc}%;"></div>
                </div>
            </div>
        `;
    }

    function renderLineGraph() {
        const monthKey = getMonthKey(currentDate);
        const habits = allData[monthKey] || [];
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const container = document.getElementById('lineGraphContainer');
        const totalHabits = habits.length;

        const points = [];
        for(let i=1; i<=daysInMonth; i++) {
            const done = habits.filter(h => h.history && h.history[`d${i}`]).length;
            const perc = totalHabits > 0 ? Math.round((done / totalHabits) * 100) : 0;
            points.push({ day: i, perc: perc });
        }

        const width = 1000;
        const height = 250;
        let pathD = "";
        const stepX = width / (daysInMonth - 1);
        const coordinates = points.map((p, index) => {
            const x = index * stepX;
            const y = height - (p.perc * height / 100);
            return {x, y, perc: p.perc};
        });

        if(coordinates.length > 0) {
            pathD = `M ${coordinates[0].x} ${coordinates[0].y}`;
            coordinates.forEach((p, i) => {
                if(i > 0) pathD += ` L ${p.x} ${p.y}`;
            });
        }

        const areaD = pathD + ` L ${width} ${height} L 0 ${height} Z`;
        let dotsHtml = "";
        coordinates.forEach(p => {
             dotsHtml += `<circle cx="${p.x}" cy="${p.y}" class="chart-dot"><title>Day: ${p.day}, ${p.perc}%</title></circle>`;
        });

        let gridHtml = "";
        [0, 25, 50, 75, 100].forEach(val => {
            const yPos = height - (val * height / 100);
            gridHtml += `<line x1="0" y1="${yPos}" x2="${width}" y2="${yPos}" class="grid-line" />`;
        });

        let labelsHtml = "";
        [0, 25, 50, 75, 100].forEach(val => {
            const topPos = 250 - (val * 2.5); 
            const styleTop = `top: ${topPos - 6}px;`; 
            labelsHtml += `<div class="y-axis-label" style="${styleTop}">${val}%</div>`;
        });

        container.innerHTML = `
            <div class="lg-header"> MONTHLY PROGRESS BY GRAPH</div>
            <div class="graph-svg-container">
                <svg viewBox="0 -10 ${width} ${height + 20}" preserveAspectRatio="none" style="width:100%; height:100%; overflow:visible;">
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:var(--accent-green); stop-opacity:0.5" />
                            <stop offset="100%" style="stop-color:var(--accent-green); stop-opacity:0" />
                        </linearGradient>
                    </defs>
                    ${gridHtml}
                    <path d="${areaD}" class="chart-area" />
                    <path d="${pathD}" class="chart-line" />
                    ${dotsHtml}
                </svg>
                ${labelsHtml}
            </div>
        `;
    }

    function renderMonthlyGraph() {
        const monthKey = getMonthKey(currentDate);
        const habits = allData[monthKey] || [];
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const container = document.getElementById('monthlyGraphContainer');
        const totalHabits = habits.length;

        const weeks = [];
        let tempWeek = [];
        for (let i = 1; i <= daysInMonth; i++) {
            tempWeek.push(i);
            if (tempWeek.length === 7 || i === daysInMonth) {
                weeks.push(tempWeek);
                tempWeek = [];
            }
        }

        let barsHtml = '';
        weeks.forEach((weekDays, idx) => {
            let weekDone = 0;
            let weekPossible = totalHabits * weekDays.length;
            weekDays.forEach(day => {
                weekDone += habits.filter(h => h.history && h.history[`d${day}`]).length;
            });
            const perc = weekPossible > 0 ? Math.round((weekDone / weekPossible) * 100) : 0;
            barsHtml += `
                <div class="mg-col">
                    <span class="mg-stats">${perc}%</span>
                    <div class="mg-track">
                        <div class="mg-fill" style="height: ${perc}%;"></div>
                    </div>
                    <span class="mg-label">Week ${idx + 1}</span>
                </div>
            `;
        });

        container.innerHTML = `
            <div class="wg-header">
                <span class="wg-title">MONTHLY OVERVIEW</span>
                <span>${currentDate.toLocaleString('default', { month: 'long' })}</span>
            </div>
            <div class="mg-bars">${barsHtml}</div>
        `;
    }

    function updateDailyProgress() {
        const monthKey = getMonthKey(currentDate);
        const habits = allData[monthKey] || [];
        const today = currentDate.getDate();
        const totalHabits = habits.length;
        const completedToday = habits.filter(h => h.history && h.history[`d${today}`]).length;
        const completedPerc = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;
        
        const circleLength = 100;
        const strokeOffset = circleLength - (circleLength * completedPerc) / 100;
        const wheel = document.getElementById("summaryWheel");
        if(wheel) {
            wheel.style.strokeDasharray = `${circleLength}, ${circleLength}`;
            wheel.style.strokeDashoffset = strokeOffset;
        }
        
        document.getElementById("summaryPercText").innerText = completedPerc.toFixed(0) + "%";
        document.getElementById("todayCompletedCount").innerText = completedToday;
        const doneTextDisplay = document.getElementById("completedPercTextDisplay");
        if(doneTextDisplay) doneTextDisplay.innerText = completedPerc.toFixed(0) + "%";
        document.getElementById("leftPercText").innerText = (100 - completedPerc).toFixed(0) + "%";
    }

    function toggle(hIdx, day) {
        const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const today = new Date();
        targetDate.setHours(0,0,0,0);
        today.setHours(0,0,0,0);

        // --- STRICT RESTRICTION: Only Today ---
        // Jar targetDate aajchi nasel, tar alert dya ani return kara.
        if (targetDate.getTime() !== today.getTime()) {
            alert("Tumhi fakt aaju chya divshi changes karu shakta! (Only Today) 🔒"); 
            return; 
        }

        const monthKey = getMonthKey(currentDate);
        const dayKey = `d${day}`;
        if (!allData[monthKey][hIdx].history) allData[monthKey][hIdx].history = {};
        allData[monthKey][hIdx].history[dayKey] = !allData[monthKey][hIdx].history[dayKey];
        save();
        updateDailyProgress(); 
    }

    function renameHabit(i) {
        const monthKey = getMonthKey(currentDate);
        const currentName = allData[monthKey][i].name;
        const newName = prompt("Rename habit:", currentName);
        if (newName && newName.trim() !== "") {
            allData[monthKey][i].name = newName.trim();
            save();
        }
    }
    
    function deleteHabit(i) {
        const monthKey = getMonthKey(currentDate);
        if(confirm("Delete this habit?")) { 
            allData[monthKey].splice(i, 1); 
            save(); 
        }
    }

    function openHabitDetail(name) {
        document.getElementById('fullHabitText').innerText = name;
        document.getElementById('habitDetailModal').style.display = 'flex';
    }

    function renderTable() {
        const monthKey = getMonthKey(currentDate);
        const habits = allData[monthKey];
        const days = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const head = document.getElementById('tableHead');
        const body = document.getElementById('tableBody');
        
        const realTodayDate = new Date();
        realTodayDate.setHours(0,0,0,0); 
        const realToday = realTodayDate.getDate();
        const realMonth = realTodayDate.getMonth();
        const realYear = realTodayDate.getFullYear();
        
        // Start limit 2026
        const startDateLimit = new Date(2026, 0, 1); 
        startDateLimit.setHours(0,0,0,0);

        let weekRowHtml = `<tr><th rowspan="2" class="habit-col-header">My Habits</th>`;
        let daysLeft = days;
        let weekNum = 1;
        while(daysLeft > 0) {
            let span = daysLeft >= 7 ? 7 : daysLeft;
            weekRowHtml += `<th colspan="${span}" class="week-header">Week ${weekNum}</th>`;
            daysLeft -= span;
            weekNum++;
        }
        weekRowHtml += `</tr><tr>`;
        for(let i=1; i<=days; i++) {
            const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
            const isTodayHeader = (currentDate.getFullYear() === realYear && currentDate.getMonth() === realMonth && i === realToday);
            const colorStyle = isTodayHeader ? 'color: var(--accent-blue);' : '';
            weekRowHtml += `<th style="${colorStyle}"><div>${weekdaysShort[d.getDay()]}</div>${i}</th>`;
        }
        weekRowHtml += `</tr>`;
        head.innerHTML = weekRowHtml;

        body.innerHTML = '';
        habits.forEach((h, hIdx) => {
            let row = `<tr>
                <td>
                    <div class="habit-container">
                        <div class="left-action-zone">
                            <span class="menu-dots" onclick="openHabitDetail('${h.name.replace(/'/g, "\\'")}')">⋮</span>
                            <div class="action-btns">
                                <span class="edit-icon" onclick="renameHabit(${hIdx})" title="Rename">✎</span>
                                <span class="del-icon" onclick="deleteHabit(${hIdx})" title="Delete">✕</span>
                            </div>
                        </div>
                        <div class="habit-name-text" onclick="openHabitDetail('${h.name.replace(/'/g, "\\'")}')">${h.name}</div>
                    </div>
                </td>`;
            
            for(let i=1; i<=days; i++) {
                const dayKey = `d${i}`;
                const checked = h.history && h.history[dayKey] ? 'checked' : '';
                const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
                cellDate.setHours(0,0,0,0);
                
                let statusClass = '';
                if (!checked) {
                    if (cellDate.getTime() === realTodayDate.getTime()) statusClass = 'missed-today';
                    else if (cellDate.getTime() < realTodayDate.getTime() && cellDate.getTime() >= startDateLimit.getTime()) statusClass = 'missed-past';
                }

                // --- DISABLE LOGIC ---
                // Jar cellDate aajchi nsel, tar disable kara.
                const isDisabled = (cellDate.getTime() !== realTodayDate.getTime()) ? 'disabled' : '';

                row += `<td><input type="checkbox" class="check-box ${statusClass}" onclick="toggle(${hIdx}, ${i})" ${checked} ${isDisabled}></td>`;
            }
            body.innerHTML += row + '</tr>';
        });
    }

    function renderWeekCards() {
        const monthKey = getMonthKey(currentDate);
        const habits = allData[monthKey] || [];
        const totalHabitsCount = habits.length;
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const container = document.getElementById('weekwiseContainer');
        const weeks = [];
        let tempWeek = [];
        for (let i = 1; i <= daysInMonth; i++) {
            tempWeek.push(i);
            if (tempWeek.length === 7 || i === daysInMonth) {
                weeks.push(tempWeek);
                tempWeek = [];
            }
        }
        if (currentWeekIndex >= weeks.length) currentWeekIndex = weeks.length - 1;
        const currentWeekDays = weeks[currentWeekIndex];
        
        let html = `
            <div class="week-cards-header">
                <div class="week-cards-title">Week Performance</div>
                <div class="week-nav-pills">
        `;
        weeks.forEach((_, idx) => {
            const activeClass = idx === currentWeekIndex ? 'active' : '';
            html += `<button class="week-pill ${activeClass}" onclick="setWeek(${idx})">Week ${idx + 1}</button>`;
        });
        html += ` </div></div>`;

        let totalWeekDone = 0;
        let totalWeekPossible = totalHabitsCount * currentWeekDays.length;
        let barsHtml = '';
        currentWeekDays.forEach(dayNum => {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
            const stats = getDayStats(monthKey, dayNum);
            totalWeekDone += stats.done;
            barsHtml += `
                <div class="wg-col">
                    <div class="wg-stats-top">
                        <span class="wg-count">${stats.done}/${totalHabitsCount}</span>
                        <span class="wg-perc">${stats.perc}%</span>
                    </div>
                    <div class="wg-track">
                        <div class="wg-fill" style="height: ${stats.perc}%;"></div>
                    </div>
                    <span class="wg-day-lbl">${weekdaysShort[date.getDay()]} ${dayNum}</span>
                </div>
            `;
        });

        const weekPerc = totalWeekPossible > 0 ? Math.round((totalWeekDone / totalWeekPossible) * 100) : 0;
        html += `<div class="daily-grid">`;
        currentWeekDays.forEach(dayNum => {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
            const stats = getDayStats(monthKey, dayNum);
            html += `
                <div class="day-card">
                    <div class="day-label">${weekdaysFull[date.getDay()]} ${dayNum}</div>
                    <div class="day-perc">${stats.perc}%</div>
                    <div class="day-stat-line" style="color: var(--accent-green)">Done: ${stats.done}</div>
                    <div class="day-stat-line" style="color: var(--accent-red)">Not Done: ${totalHabitsCount - stats.done}</div>
                </div>
            `;
        });
        html += `</div>`;
        html += `
            <div class="week-graph-container">
                <div class="wg-header">
                    <span class="wg-title">WEEK ${currentWeekIndex + 1}</span>
                    <span>${currentWeekDays[0]}S - ${currentWeekDays[currentWeekDays.length - 1]}S</span>
                </div>
                <div class="wg-body"><div class="wg-bars">${barsHtml}</div></div>
                <div class="wg-footer">
                    <div class="wg-stat-big">${totalWeekDone}/${totalWeekPossible}</div>
                    <div class="wg-stat-perc">${weekPerc}%</div>
                </div>
            </div>
        `;
        container.innerHTML = html;
    }

    function setWeek(idx) { currentWeekIndex = idx; renderWeekCards(); }
    function getDayStats(mKey, day) {
        const habits = allData[mKey] || [];
        let done = habits.filter(h => h.history && h.history[`d${day}`]).length;
        let perc = habits.length > 0 ? Math.round((done / habits.length) * 100) : 0;
        return { done, perc };
    }

    function updateStats() {
        const monthKey = getMonthKey(currentDate);
        const habits = allData[monthKey] || [];
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        document.getElementById('totalHabits').innerText = habits.length;
        let monthlyTotalDone = 0;
        habits.forEach(h => { if(h.history) Object.values(h.history).forEach(val => { if(val) monthlyTotalDone++; }); });
        document.getElementById('monthlyCompletedCount').innerText = monthlyTotalDone;
        const totalPossible = habits.length * daysInMonth;
        const progressPerc = totalPossible > 0 ? Math.round((monthlyTotalDone / totalPossible) * 100) : 0;
        document.getElementById('progressBar').style.width = progressPerc + '%';
        document.getElementById('progressPerc').innerText = progressPerc + '%';
    }

    function addHabit() {
        const monthKey = getMonthKey(currentDate);
        const val = document.getElementById('habitInput').value;
        if(!val) return;
        allData[monthKey].push({ name: val, history: {} });
        document.getElementById('habitInput').value = '';
        save();
    }

    function changeMonth(dir) { currentDate.setMonth(currentDate.getMonth() + dir); jumpToCurrentWeek(); render(); }
    
    async function save() { 
        await fetch('/api/save_data', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(allData)
        });
        render(); 
    }

    function calculateStreaks() {
        const monthKey = getMonthKey(currentDate);
        const habits = allData[monthKey] || [];
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        let longest = 0, bestDayPerc = 0, runningStreak = 0;
        for (let i = 1; i <= daysInMonth; i++) {
            const dayKey = `d${i}`;
            const doneCount = habits.filter(h => h.history && h.history[dayKey]).length;
            const perc = habits.length > 0 ? Math.round((doneCount / habits.length) * 100) : 0;
            if (perc > bestDayPerc) bestDayPerc = perc;
            if (doneCount > 0) {
                runningStreak++;
                if (runningStreak > longest) longest = runningStreak;
            } else runningStreak = 0;
        }
        let currentStreak = 0;
        for (let i = daysInMonth; i >= 1; i--) {
            const doneCount = habits.filter(h => h.history && h.history[`d${i}`]).length;
            if (doneCount > 0) currentStreak++;
            else if (i < new Date().getDate()) break;
        }
        return { longest, currentStreak, bestDayPerc };
    }

    function openStatsModal() {
        const streaks = calculateStreaks();
        const monthKey = getMonthKey(currentDate);
        document.getElementById('trackedCount').innerText = allData[monthKey].length;
        document.getElementById('rateVal').innerText = document.getElementById('progressPerc').innerText;
        document.getElementById('totalVal').innerText = document.getElementById('monthlyCompletedCount').innerText;
        document.getElementById('currStreak').innerText = `${streaks.currentStreak} days`;
        document.getElementById('longStreak').innerText = `${streaks.longest} days`;
        document.getElementById('bestDay').innerText = `${streaks.bestDayPerc}%`;
        const grid = document.getElementById('yearlyGrid');
        grid.innerHTML = '';
        ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].forEach((m, idx) => {
            const habitsM = allData[`${currentDate.getFullYear()}-${idx}`] || [];
            let doneM = 0;
            habitsM.forEach(h => { if(h.history) Object.values(h.history).forEach(v => { if(v) doneM++; }); });
            const percM = (habitsM.length * 30) > 0 ? Math.round((doneM/(habitsM.length * 30))*100) : 0;
            grid.innerHTML += `<div class="month-overview-card ${idx === currentDate.getMonth() ? 'active-month' : ''}"><span>${m}</span><strong>${percM}%</strong></div>`;
        });
        document.getElementById('statsModal').style.display = 'flex';
    }

    function openCopyModal() {
        const prevKey = getMonthKey(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        const prevHabits = allData[prevKey] || [];
        const list = document.getElementById('modalList');
        list.innerHTML = prevHabits.length ? '' : '<p style="color:#8b949e;text-align:center;">No habits in previous month.</p>';
        prevHabits.forEach(h => { list.innerHTML += `<div><input type="checkbox" class="copy-check" value="${h.name}" checked> <label style="color:#fff;">${h.name}</label></div>`; });
        document.getElementById('copyModal').style.display = 'flex';
    }

    function openDeleteModal() {
        const monthKey = getMonthKey(currentDate);
        const habits = allData[monthKey] || [];
        const list = document.getElementById('deleteList');
        list.innerHTML = habits.length ? '' : '<p style="padding:10px; text-align:center; color:#8b949e">No habits to delete.</p>';
        habits.forEach((h, idx) => {
            list.innerHTML += `<div class="modal-list-item"><input type="checkbox" class="modal-check del-check" value="${idx}"><label style="cursor:pointer; flex-grow:1;" onclick="this.previousElementSibling.click()">${h.name}</label></div>`;
        });
        document.getElementById('deleteModal').style.display = 'flex';
    }

    function executeBulkDelete() {
        const checkboxes = document.querySelectorAll('.del-check:checked');
        if(checkboxes.length === 0) return alert("Please select at least one habit to delete.");
        if(confirm(`Are you sure you want to delete ${checkboxes.length} habits?`)) {
            const monthKey = getMonthKey(currentDate);
            Array.from(checkboxes).map(cb => parseInt(cb.value)).sort((a, b) => b - a).forEach(idx => allData[monthKey].splice(idx, 1));
            save(); closeModal('deleteModal');
        }
    }

    function confirmCopy() {
        document.querySelectorAll('.copy-check:checked').forEach(cb => { allData[getMonthKey(currentDate)].push({ name: cb.value, history: {} }); });
        save(); closeModal('copyModal');
    }

    function closeModal(id) { document.getElementById(id).style.display = 'none'; }

    // --- EMOJI PICKER LOGIC (NEW) ---

    // 1. Define Categories based on your request
    const emojiCategories = {
        "Motivation & Success": ["🔥", "💯", "🚀", "🧠", "🏆", "👑", "⚡", "💥", "✨", "🛤️"],
        "Study & Focus": ["📖", "📘", "📕", "📚", "✍️", "🧑‍🎓", "🧠", "🖊️"],
        "Health & Gym": ["🏋️", "💪", "🤸", "🏃", "🧘", "🚴", "🏃‍♂️", "🏆"],
        "Water & Hydration": ["💧", "🚰", "🥤", "🫗"],
        "Time Management": ["⏰", "🎯", "📅", "✅", "🔁", "🧩"],
        "Growth & Nature": ["🌱", "🌿", "🌳", "🔄", "📈", "🛠️"],
        "Mood & Relax": ["😊", "😌", "😄", "🙌", "😎", "🧘‍♀️"]
    };

    let recentEmojis = JSON.parse(localStorage.getItem('recentEmojis')) || ["🔥", "✅", "💪", "📚"];

    function toggleEmojiPicker() {
        const picker = document.getElementById('emojiPicker');
        const isVisible = picker.classList.contains('show');
        
        if (!isVisible) {
            renderEmojiPicker(); // Build the picker content only when opening
            picker.classList.add('show');
        } else {
            picker.classList.remove('show');
        }
    }

    // Function to render the emoji list (Recently Used + Categories)
    function renderEmojiPicker() {
        const container = document.getElementById('emojiPicker');
        container.innerHTML = ''; // Clear previous content

        // 1. Render Recently Used Section
        if (recentEmojis.length > 0) {
            const recentTitle = document.createElement('div');
            recentTitle.className = 'emoji-category-title';
            recentTitle.innerText = 'Recently Used 🕒';
            container.appendChild(recentTitle);

            const recentGrid = document.createElement('div');
            recentGrid.className = 'emoji-grid';
            recentEmojis.forEach(emoji => {
                const span = document.createElement('span');
                span.className = 'emoji-item';
                span.innerText = emoji;
                span.onclick = () => insertEmoji(emoji);
                recentGrid.appendChild(span);
            });
            container.appendChild(recentGrid);
        }

        // 2. Render All Categories
        for (const [category, emojis] of Object.entries(emojiCategories)) {
            const catTitle = document.createElement('div');
            catTitle.className = 'emoji-category-title';
            catTitle.innerText = category;
            container.appendChild(catTitle);

            const grid = document.createElement('div');
            grid.className = 'emoji-grid';
            emojis.forEach(emoji => {
                const span = document.createElement('span');
                span.className = 'emoji-item';
                span.innerText = emoji;
                span.onclick = () => insertEmoji(emoji);
                grid.appendChild(span);
            });
            container.appendChild(grid);
        }
    }

    // Function to handle emoji click
    function insertEmoji(emoji) {
        const input = document.getElementById('habitInput');
        
        // Append emoji to current input value
        input.value += emoji + " "; 
        input.focus(); // Keep focus on input

        // Update Recently Used
        updateRecentEmojis(emoji);
        
        // Re-render to show updated "Recently Used" immediately if keeping open
        renderEmojiPicker();
    }

    function updateRecentEmojis(emoji) {
        // Remove existing if present (to move it to front)
        recentEmojis = recentEmojis.filter(e => e !== emoji);
        
        // Add to front
        recentEmojis.unshift(emoji);
        
        // Keep only top 16
        if (recentEmojis.length > 16) {
            recentEmojis.pop();
        }

        // Save to LocalStorage
        localStorage.setItem('recentEmojis', JSON.stringify(recentEmojis));
    }

    // Close Emoji Picker when clicking outside
    document.addEventListener('click', function(event) {
        const picker = document.getElementById('emojiPicker');
        const btn = document.querySelector('.emoji-trigger-btn');
        const isClickInside = picker.contains(event.target) || btn.contains(event.target);

        if (!isClickInside && picker.classList.contains('show')) {
            picker.classList.remove('show');
        }
    });
