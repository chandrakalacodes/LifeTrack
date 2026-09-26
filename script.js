/* =========================================
   LIFETRACK
   PERSONAL PRODUCTIVITY DASHBOARD
========================================= */

let tasksByDate =
    JSON.parse(localStorage.getItem("lifetrackTasksByDate")) || [];

let goals =
    JSON.parse(localStorage.getItem("lifetrackGoals")) || [];

const today = new Date();

let selectedDate = new Date();

let calendarDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
);


/* =========================================
   DATE HELPERS
========================================= */

function getDateKey(date) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatSelectedDate(date) {

    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );
}


function isSameDate(date1, date2) {

    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}


/* =========================================
   STORAGE
========================================= */

function saveTasks() {

    localStorage.setItem(
        "lifetrackTasksByDate",
        JSON.stringify(tasksByDate)
    );
}


function saveGoals() {

    localStorage.setItem(
        "lifetrackGoals",
        JSON.stringify(goals)
    );
}


/* =========================================
   CALENDAR
========================================= */

function renderCalendar() {

    const year =
        calendarDate.getFullYear();

    const month =
        calendarDate.getMonth();

    document.getElementById(
        "calendarYear"
    ).textContent = year;

    document.getElementById(
        "calendarMonth"
    ).textContent =
        calendarDate.toLocaleString(
            "en-US",
            { month: "long" }
        );


    const calendarDays =
        document.getElementById(
            "calendarDays"
        );

    calendarDays.innerHTML = "";


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const previousMonthDays =
        new Date(
            year,
            month,
            0
        ).getDate();


    for (let i = 0; i < 42; i++) {

        let dayNumber;

        let cellDate;

        let otherMonth = false;


        if (i < firstDay) {

            dayNumber =
                previousMonthDays -
                firstDay +
                i +
                1;

            cellDate =
                new Date(
                    year,
                    month - 1,
                    dayNumber
                );

            otherMonth = true;

        } else if (
            i >= firstDay + daysInMonth
        ) {

            dayNumber =
                i -
                (firstDay + daysInMonth) +
                1;

            cellDate =
                new Date(
                    year,
                    month + 1,
                    dayNumber
                );

            otherMonth = true;

        } else {

            dayNumber =
                i -
                firstDay +
                1;

            cellDate =
                new Date(
                    year,
                    month,
                    dayNumber
                );
        }


        const key =
            getDateKey(cellDate);


        const dayTasks =
            tasksByDate[key] || [];


        const completedTasks =
            dayTasks.filter(
                task => task.completed
            ).length;


        const day =
            document.createElement(
                "div"
            );


        day.className =
            "calendar-day";


        if (otherMonth) {
            day.classList.add(
                "other-month"
            );
        }


        if (
            isSameDate(
                cellDate,
                selectedDate
            )
        ) {

            day.classList.add(
                "selected"
            );
        }


        if (
            isSameDate(
                cellDate,
                today
            )
        ) {

            day.classList.add(
                "today"
            );
        }


        day.innerHTML = `

            <span class="day-number">
                ${dayNumber}
            </span>

            ${
                dayTasks.length > 0
                ? `<span class="day-task-dot"></span>`
                : ""
            }

            ${
                completedTasks > 0
                ? `<span class="day-complete">
                    ✓${completedTasks}
                   </span>`
                : ""
            }
        `;


        day.onclick =
            function () {

                selectedDate =
                    new Date(cellDate);

                renderCalendar();

                displayTasks();

                updateAllProgress();

                document
                    .getElementById(
                        "tasksSection"
                    )
                    .scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
            };


        calendarDays.appendChild(day);
    }
}


/* =========================================
   CALENDAR NAVIGATION
========================================= */

function changeYear(amount) {

    calendarDate.setFullYear(
        calendarDate.getFullYear() +
        amount
    );

    renderCalendar();
}


function changeMonth(amount) {

    calendarDate.setMonth(
        calendarDate.getMonth() +
        amount
    );

    renderCalendar();
}


function goToToday() {

    selectedDate =
        new Date();

    calendarDate =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );

    renderCalendar();

    displayTasks();

    updateAllProgress();
}


/* =========================================
   TASKS
========================================= */

function addTask() {

    const input =
        document.getElementById(
            "taskInput"
        );

    const text =
        input.value.trim();


    if (text === "") {

        alert(
            "Please enter a task!"
        );

        return;
    }


    const key =
        getDateKey(
            selectedDate
        );


    if (!tasksByDate[key]) {

        tasksByDate[key] = [];
    }


    tasksByDate[key].push({

        id: Date.now(),

        text: text,

        completed: false
    });


    input.value = "";

    saveTasks();

    displayTasks();

    renderCalendar();

    updateAllProgress();
}


function handleTaskEnter(event) {

    if (
        event.key === "Enter"
    ) {

        addTask();
    }
}


function displayTasks() {

    const taskList =
        document.getElementById(
            "taskList"
        );

    const emptyTasks =
        document.getElementById(
            "emptyTasks"
        );


    taskList.innerHTML = "";


    const key =
        getDateKey(
            selectedDate
        );


    const tasks =
        tasksByDate[key] || [];


    document.getElementById(
        "selectedDateTitle"
    ).textContent =
        isSameDate(
            selectedDate,
            today
        )
        ? "Today's Tasks"
        : "Tasks";


    document.getElementById(
        "selectedDateText"
    ).textContent =
        formatSelectedDate(
            selectedDate
        );


    let completed = 0;


    tasks.forEach(
        (task, index) => {

            if (task.completed) {

                completed++;
            }


            const li =
                document.createElement(
                    "li"
                );

            li.className =
                "task";


            const left =
                document.createElement(
                    "div"
                );

            left.className =
                "task-left";


            const checkbox =
                document.createElement(
                    "input"
                );

            checkbox.type =
                "checkbox";

            checkbox.checked =
                task.completed;


            checkbox.onchange =
                function () {

                    toggleTask(index);
                };


            const span =
                document.createElement(
                    "span"
                );

            span.textContent =
                task.text;


            if (task.completed) {

                span.style.textDecoration =
                    "line-through";

                span.style.color =
                    "#9ca3af";
            }


            left.appendChild(
                checkbox
            );

            left.appendChild(
                span
            );


            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.className =
                "delete-btn";

            deleteButton.textContent =
                "🗑️";


            deleteButton.onclick =
                function () {

                    deleteTask(index);
                };


            li.appendChild(left);

            li.appendChild(
                deleteButton
            );

            taskList.appendChild(li);
        }
    );


    document.getElementById(
        "taskCount"
    ).textContent =
        tasks.length;


    document.getElementById(
        "completedCount"
    ).textContent =
        completed;


    emptyTasks.style.display =
        tasks.length === 0
        ? "block"
        : "none";
}


function toggleTask(index) {

    const key =
        getDateKey(
            selectedDate
        );


    tasksByDate[key][index].completed =
        !tasksByDate[key][index].completed;


    saveTasks();

    displayTasks();

    renderCalendar();

    updateAllProgress();
}


function deleteTask(index) {

    const key =
        getDateKey(
            selectedDate
        );


    tasksByDate[key].splice(
        index,
        1
    );


    if (
        tasksByDate[key].length === 0
    ) {

        delete tasksByDate[key];
    }


    saveTasks();

    displayTasks();

    renderCalendar();

    updateAllProgress();
}


/* =========================================
   DAILY PROGRESS
========================================= */

function calculateDailyProgress(
    date
) {

    const key =
        getDateKey(date);


    const tasks =
        tasksByDate[key] || [];


    if (
        tasks.length === 0
    ) {

        return 0;
    }


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    return Math.round(
        completed /
        tasks.length *
        100
    );
}


function updateDailyProgress() {

    const percentage =
        calculateDailyProgress(
            selectedDate
        );


    document.getElementById(
        "progressPercent"
    ).textContent =
        percentage + "%";


    document.getElementById(
        "bigProgress"
    ).textContent =
        percentage + "%";


    document.getElementById(
        "dailyProgressBar"
    ).style.width =
        percentage + "%";


    const message =
        document.getElementById(
            "progressMessage"
        );


    if (
        percentage === 0
    ) {

        message.textContent =
            "Let's get started!";

    } else if (
        percentage < 50
    ) {

        message.textContent =
            "Good start. Keep going! 💪";

    } else if (
        percentage < 100
    ) {

        message.textContent =
            "You're doing great! 🔥";

    } else {

        message.textContent =
            "Amazing! Everything completed! 🎉";
    }
}


/* =========================================
   MONTHLY PROGRESS
========================================= */

function calculateMonthlyProgress() {

    const year =
        selectedDate.getFullYear();

    const month =
        selectedDate.getMonth();


    let total = 0;

    let completed = 0;


    Object.keys(
        tasksByDate
    ).forEach(
        key => {

            const date =
                new Date(
                    key +
                    "T00:00:00"
                );


            if (
                date.getFullYear() === year &&
                date.getMonth() === month
            ) {

                const tasks =
                    tasksByDate[key];


                total +=
                    tasks.length;


                completed +=
                    tasks.filter(
                        task =>
                            task.completed
                    ).length;
            }
        }
    );


    if (
        total === 0
    ) {

        return 0;
    }


    return Math.round(
        completed /
        total *
        100
    );
}


/* =========================================
   YEARLY PROGRESS
========================================= */

function calculateYearlyProgress() {

    const year =
        selectedDate.getFullYear();


    let total = 0;

    let completed = 0;


    Object.keys(
        tasksByDate
    ).forEach(
        key => {

            const date =
                new Date(
                    key +
                    "T00:00:00"
                );


            if (
                date.getFullYear() === year
            ) {

                const tasks =
                    tasksByDate[key];


                total +=
                    tasks.length;


                completed +=
                    tasks.filter(
                        task =>
                            task.completed
                    ).length;
            }
        }
    );


    if (
        total === 0
    ) {

        return 0;
    }


    return Math.round(
        completed /
        total *
        100
    );
}


function updatePlanningProgress() {

    document.getElementById(
        "monthlyProgress"
    ).textContent =
        calculateMonthlyProgress()
        + "%";


    document.getElementById(
        "yearlyProgress"
    ).textContent =
        calculateYearlyProgress()
        + "%";
}


/* =========================================
   STREAK
========================================= */

function hasCompletedTaskOnDate(
    date
) {

    const key =
        getDateKey(date);


    const tasks =
        tasksByDate[key] || [];


    return tasks.some(
        task =>
            task.completed
    );
}


function calculateStreak() {

    let streak = 0;

    let date =
        new Date();


    while (
        hasCompletedTaskOnDate(date)
    ) {

        streak++;

        date.setDate(
            date.getDate() - 1
        );
    }


    return streak;
}


function updateStreak() {

    document.getElementById(
        "streakCount"
    ).textContent =
        calculateStreak();
}


/* =========================================
   GOALS
========================================= */

function toggleGoalForm() {

    const form =
        document.getElementById(
            "goalForm"
        );


    form.classList.toggle(
        "hidden"
    );
}


function addGoal() {

    const input =
        document.getElementById(
            "goalInput"
        );


    const progressInput =
        document.getElementById(
            "goalProgressInput"
        );


    const periodInput =
        document.getElementById(
            "goalPeriodInput"
        );


    const title =
        input.value.trim();


    let progress =
        Number(
            progressInput.value
        );


    if (
        title === ""
    ) {

        alert(
            "Please enter a goal."
        );

        return;
    }


    if (
        isNaN(progress) ||
        progress < 0 ||
        progress > 100
    ) {

        alert(
            "Progress must be between 0 and 100."
        );

        return;
    }


    goals.push({

        id: Date.now(),

        title: title,

        progress: progress,

        period:
            periodInput.value,

        year:
            selectedDate.getFullYear(),

        month:
            selectedDate.getMonth()
    });


    saveGoals();

    input.value = "";

    progressInput.value = 0;

    periodInput.value = "year";

    displayGoals();
}


function displayGoals() {

    const goalList =
        document.getElementById(
            "goalList"
        );


    const emptyGoals =
        document.getElementById(
            "emptyGoals"
        );


    goalList.innerHTML = "";


    if (
        goals.length === 0
    ) {

        emptyGoals.style.display =
            "block";

        return;
    }


    emptyGoals.style.display =
        "none";


    goals.forEach(
        (goal, index) => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "goal-item";


            item.innerHTML = `

                <div class="goal-top">

                    <span class="goal-title"></span>

                    <span class="goal-percent">
                        ${goal.progress}%
                    </span>

                </div>

                <div class="goal-meta">
                    ${
                        goal.period === "year"
                        ? "Yearly Goal"
                        : "Monthly Goal"
                    }
                </div>

                <div class="goal-progress">

                    <div
                        class="goal-progress-bar"
                        style="
                            width:
                            ${goal.progress}%
                        "
                    ></div>

                </div>

                <div class="goal-actions">

                    <button
                        onclick="increaseGoal(${index})"
                    >
                        +10%
                    </button>

                    <button
                        onclick="decreaseGoal(${index})"
                    >
                        -10%
                    </button>

                    <button
                        onclick="editGoal(${index})"
                    >
                        Edit
                    </button>

                    <button
                        onclick="deleteGoal(${index})"
                    >
                        Delete
                    </button>

                </div>
            `;


            item.querySelector(
                ".goal-title"
            ).textContent =
                goal.title;


            goalList.appendChild(
                item
            );
        }
    );
}


/* =========================================
   EDIT GOAL
========================================= */

function editGoal(index) {

    const goal =
        goals[index];


    const newTitle =
        prompt(
            "Edit your goal:",
            goal.title
        );


    if (
        newTitle === null
    ) {

        return;
    }


    const cleanTitle =
        newTitle.trim();


    if (
        cleanTitle === ""
    ) {

        alert(
            "Goal name cannot be empty."
        );

        return;
    }


    goal.title =
        cleanTitle;


    saveGoals();

    displayGoals();
}


/* =========================================
   GOAL PROGRESS
========================================= */

function increaseGoal(index) {

    goals[index].progress =
        Math.min(
            100,
            goals[index].progress + 10
        );


    saveGoals();

    displayGoals();
}


function decreaseGoal(index) {

    goals[index].progress =
        Math.max(
            0,
            goals[index].progress - 10
        );


    saveGoals();

    displayGoals();
}


function deleteGoal(index) {

    const confirmDelete =
        confirm(
            "Delete this goal?"
        );


    if (
        !confirmDelete
    ) {

        return;
    }


    goals.splice(
        index,
        1
    );


    saveGoals();

    displayGoals();
}


/* =========================================
   FOCUS TIMER
========================================= */

let timerSeconds =
    25 * 60;

let timerInterval =
    null;


function updateTimerDisplay() {

    const minutes =
        Math.floor(
            timerSeconds / 60
        );


    const seconds =
        timerSeconds % 60;


    document.getElementById(
        "timer"
    ).textContent =

        String(minutes)
            .padStart(2, "0")

        + ":" +

        String(seconds)
            .padStart(2, "0");
}


function startTimer() {

    if (
        timerInterval !== null
    ) {

        return;
    }


    timerInterval =
        setInterval(
            () => {

                if (
                    timerSeconds > 0
                ) {

                    timerSeconds--;

                    updateTimerDisplay();

                } else {

                    clearInterval(
                        timerInterval
                    );

                    timerInterval =
                        null;

                    alert(
                        "Focus session completed! 🎉"
                    );
                }

            },
            1000
        );
}


function pauseTimer() {

    clearInterval(
        timerInterval
    );

    timerInterval =
        null;
}


function resetTimer() {

    clearInterval(
        timerInterval
    );

    timerInterval =
        null;

    timerSeconds =
        25 * 60;

    updateTimerDisplay();
}


/* =========================================
   UPDATE
========================================= */

function updateAllProgress() {

    updateDailyProgress();

    updatePlanningProgress();

    updateStreak();
}


/* =========================================
   WELCOME
========================================= */

function updateWelcome() {

    const hour =
        new Date().getHours();


    let message;


    if (
        hour < 12
    ) {

        message =
            "Good morning 👋";

    } else if (
        hour < 17
    ) {

        message =
            "Good afternoon 👋";

    } else {

        message =
            "Good evening 👋";
    }


    document.getElementById(
        "welcomeText"
    ).textContent =
        message;
}


/* =========================================
   START
========================================= */

function initializeApp() {

    updateWelcome();

    renderCalendar();

    displayTasks();

    displayGoals();

    updateAllProgress();

    updateTimerDisplay();
}


initializeApp();