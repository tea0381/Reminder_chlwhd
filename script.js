const scheduleList =
    document.getElementById("schedule-list");

let schedules =
    JSON.parse(localStorage.getItem("schedules")) || [];

let activeAlarm = null;
let editingId = null;

function saveSchedules() {
    localStorage.setItem(
        "schedules",
        JSON.stringify(schedules)
    );
}

function renderSchedules() {

    scheduleList.innerHTML = "";

    if (schedules.length === 0) {

        scheduleList.innerHTML = `
            <div class="empty-message">
                등록된 일정이 없습니다
            </div>
        `;

        return;
    }

    schedules.sort((a, b) =>
        a.time.localeCompare(b.time)
    );

    const now =
        new Date().toTimeString().slice(0, 5);

    schedules.forEach(schedule => {

        let stateClass = "waiting";
        let stateText = "예정";

        if (schedule.completed) {

            stateClass = "completed";
            stateText = "완료";
        }
        else if (schedule.acknowledged) {

            stateClass = "current";
            stateText = "대기중";
        }
        else {

            stateClass = "waiting";
            stateText = "예정";
        }

        const card =
            document.createElement("div");

        card.className =
            `schedule-card ${stateClass}`;

        card.innerHTML = `
            <div class="schedule-left">

                <span 
                    class="schedule-time"
                    onclick= "forceAlarm(${schedule.id})"
                >
                    ${schedule.time}
                </span>

                <span class="schedule-name">
                    ${schedule.name}
                </span>

            </div>

            ${
                schedule.completed
                ?
                `<span class="status">완료</span>`
                :
                `
                <button
                    class="complete-card-btn"
                    onclick="completeSchedule(${schedule.id})"
                    ${!schedule.acknowledged ? "disabled" : ""}
                >
                    확인하기
                </button>
                `
            }
        `;

        card.addEventListener("click", (e) => {

            if (
                e.target.classList.contains("schedule-time")
                ||
                e.target.classList.contains("complete-card-btn")
            ) {
                return;
            }

            openEditModal(schedule);
        });

        scheduleList.appendChild(card);
    });
}

function openModal() {
    document
        .getElementById("modal-overlay")
        .classList.remove("hidden");
}

function closeModal() {
    document
        .getElementById("modal-overlay")
        .classList.add("hidden");
}

document
    .getElementById("add-btn")
    .addEventListener("click", ()=>{

        editingId = null;

        document
        .getElementById("schedule-name")
        .value = "";

        document
        .getElementById("schedule-time")
        .value = "";

        document
        .getElementById("delete-btn")
        .classList.add("hidden");

        openModal();
    });

document
    .getElementById("cancel-btn")
    .addEventListener("click", closeModal);

document
    .getElementById("save-btn")
    .addEventListener("click", () => {

        const name =
            document
                .getElementById("schedule-name")
                .value
                .trim();

        const time =
            document
                .getElementById("schedule-time")
                .value;

        if (!name || !time) return;

        if (editingId) {

            const schedule =
                schedules.find(
                    item => item.id === editingId
                );

            schedule.name = name;
            schedule.time = time;
        }
        else {

            schedules.push({
                id: Date.now(),
                name: name,
                time: time,
                completed: false,
                alarmed: false,
                acknowledged: false
            });
        }

        saveSchedules();
        renderSchedules();
        closeModal();

        document
            .getElementById("schedule-name")
            .value = "";

        document
            .getElementById("schedule-time")
            .value = "";
    });

function showAlarm(schedule) {

    activeAlarm = schedule;

    document
        .getElementById("alarm-title")
        .textContent =
        schedule.name;

    document
        .getElementById("alarm-time")
        .textContent =
        schedule.time;

    document
        .getElementById("alarm-screen")
        .classList.remove("hidden");

    speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(
            `${schedule.name} 시간입니다.`
        );

    speech.lang = "ko-KR";
    speech.rate = 0.9;

    speechSynthesis.speak(speech);
}

function checkAlarm() {

    const now =
        new Date().toTimeString().slice(0, 5);

    schedules.forEach(schedule => {

        if (
            schedule.time === now &&
            !schedule.alarmed &&
            !schedule.completed
        ) {

            schedule.alarmed = true;

            saveSchedules();

            showAlarm(schedule);
        }
    });
}

document
    .getElementById("complete-btn")
    .addEventListener("click", () => {

        activeAlarm.completed = true;

        saveSchedules();
        renderSchedules();

        document
            .getElementById("alarm-screen")
            .classList.add("hidden");
    });

document
    .getElementById("confirm-btn")
    .addEventListener("click", () => {

        activeAlarm.acknowledged = true;

        saveSchedules();
        renderSchedules();

        document
            .getElementById("alarm-screen")
            .classList.add("hidden");
    });

renderSchedules();

setInterval(checkAlarm, 1000);

function completeSchedule(id) {

    const schedule =
        schedules.find(
            item => item.id === id
        );

    if (!schedule) return;

    schedule.completed = true;

    saveSchedules();
    renderSchedules();
}

function forceAlarm(id) {

    const schedule =
        schedules.find(
            item => item.id === id
        );

    if (!schedule) return;

    showAlarm(schedule);
}

function openEditModal(schedule) {

    editingId = schedule.id;

    document
        .getElementById("schedule-name")
        .value =
        schedule.name;

    document
        .getElementById("schedule-time")
        .value =
        schedule.time;

    document
        .getElementById("delete-btn")
        .classList.remove("hidden");

    openModal();
}

document
    .getElementById("delete-btn")
    .addEventListener("click", () => {

        if (editingId === null) return;

        schedules =
            schedules.filter(
                item => item.id !== editingId
            );

        saveSchedules();
        renderSchedules();
        closeModal();
    });