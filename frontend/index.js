const API_BASE = '/api';
const RISK_THRESHOLD = 75;

const elements = {
    studentCount: document.querySelector('#student-count'),
    courseCount: document.querySelector('#course-count'),
    attendanceCount: document.querySelector('#attendance-count'),
    riskCount: document.querySelector('#risk-count'),
    courseSelect: document.querySelector('#attendance-course'),
    markCourseSelect: document.querySelector('#mark-course'),
    studentSelect: document.querySelector('#attendance-student'),
    attendanceDate: document.querySelector('#attendance-date'),
    roster: document.querySelector('#roster'),
    courseSummary: document.querySelector('#course-summary'),
    studentForm: document.querySelector('#student-form'),
    courseForm: document.querySelector('#course-form'),
    enrollmentForm: document.querySelector('#enrollment-form'),
    attendanceForm: document.querySelector('#attendance-form'),
    enrollmentStudent: document.querySelector('#enrollment-student'),
    enrollmentCourse: document.querySelector('#enrollment-course'),
    notice: document.querySelector('#notice'),
};

const state = {
    students: [],
    courses: [],
    attendance: [],
};

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...options.headers,
        },
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || `Request failed (${response.status})`);
    }

    return data;
}

function showNotice(message, type = 'success') {
    elements.notice.textContent = message;
    elements.notice.className = `notice is-visible ${type}`;
    window.clearTimeout(showNotice.timeout);
    showNotice.timeout = window.setTimeout(() => {
        elements.notice.className = 'notice';
    }, 4500);
}

function option(value, label) {
    const item = document.createElement('option');
    item.value = value;
    item.textContent = label;
    return item;
}

function setOptions(select, items, labelFor, placeholder) {
    select.replaceChildren(option('', placeholder));
    for (const item of items) {
        select.append(option(item._id, labelFor(item)));
    }
}

function formatPercent(value) {
    return `${Math.round(value)}%`;
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    })[character]);
}

function getStudentStats(studentId) {
    const records = state.attendance.filter((record) => {
        const recordStudentId = record.studentId?._id || record.studentId;
        return recordStudentId === studentId;
    });
    const present = records.filter((record) => record.status === 'Present').length;
    return {
        present,
        total: records.length,
        percentage: records.length ? (present / records.length) * 100 : null,
    };
}

function getEnrolledStudents(courseId) {
    return state.students.filter((student) => (
        (student.courses || []).some((id) => (id._id || id) === courseId)
    ));
}

function updateMarkStudentOptions() {
    const courseId = elements.markCourseSelect.value;
    const enrolledStudents = getEnrolledStudents(courseId);
    setOptions(
        elements.studentSelect,
        enrolledStudents,
        (student) => `${student.name} · ${student.rollNumber}`,
        enrolledStudents.length ? 'Select a student' : 'No enrolled students'
    );
}

function renderRoster() {
    const courseId = elements.courseSelect.value;
    const course = state.courses.find((item) => item._id === courseId);
    const enrolledStudents = course ? getEnrolledStudents(courseId) : [];

    elements.roster.replaceChildren();
    elements.courseSummary.textContent = course
        ? `${course.name} · ${state.attendance.length} attendance ${state.attendance.length === 1 ? 'record' : 'records'}`
        : 'Choose a course to view its attendance.';

    if (!course) {
        elements.roster.innerHTML = '<tr><td class="empty-state" colspan="4">Select a course to see its roster.</td></tr>';
        return;
    }

    if (!enrolledStudents.length) {
        elements.roster.innerHTML = '<tr><td class="empty-state" colspan="4">No students are enrolled in this course yet.</td></tr>';
        return;
    }

    for (const student of enrolledStudents) {
        const stats = getStudentStats(student._id);
        const risk = stats.percentage === null ? 'No data' : stats.percentage < RISK_THRESHOLD ? 'At risk' : 'On track';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${escapeHTML(student.name)}</strong><span>${escapeHTML(student.rollNumber)}</span></td>
            <td>${stats.total ? `${stats.present} / ${stats.total}` : '—'}</td>
            <td>${stats.percentage === null ? '—' : formatPercent(stats.percentage)}</td>
            <td><span class="risk-badge ${risk === 'At risk' ? 'risk' : risk === 'On track' ? 'safe' : 'neutral'}">${risk}</span></td>
        `;
        elements.roster.append(row);
    }
}

function renderDashboard() {
    elements.studentCount.textContent = state.students.length;
    elements.courseCount.textContent = state.courses.length;
    elements.attendanceCount.textContent = state.attendance.length;

    const atRisk = getEnrolledStudents(elements.courseSelect.value).filter((student) => {
        const stats = getStudentStats(student._id);
        return stats.percentage !== null && stats.percentage < RISK_THRESHOLD;
    }).length;
    elements.riskCount.textContent = atRisk;
    renderRoster();
}

async function loadAttendance(courseId) {
    if (!courseId) {
        state.attendance = [];
        return;
    }

    try {
        const data = await request(`/attendance/course/${encodeURIComponent(courseId)}`);
        state.attendance = data.attendance || [];
    } catch (error) {
        if (error.message === 'No attendance records found for this course') {
            state.attendance = [];
            return;
        }
        throw error;
    }
}

async function refreshData() {
    const [studentData, courseData] = await Promise.all([
        request('/students'),
        request('/courses'),
    ]);

    state.students = studentData.students || [];
    state.courses = courseData.courses || [];
    setOptions(elements.courseSelect, state.courses, (course) => `${course.code} · ${course.name}`, 'Select a course');
    setOptions(elements.markCourseSelect, state.courses, (course) => `${course.code} · ${course.name}`, 'Select a course');
    setOptions(elements.enrollmentStudent, state.students, (student) => `${student.name} · ${student.rollNumber}`, 'Select a student');
    setOptions(elements.enrollmentCourse, state.courses, (course) => `${course.code} · ${course.name}`, 'Select a course');

    if (state.courses.length) {
        elements.courseSelect.value = state.courses[0]._id;
        elements.markCourseSelect.value = state.courses[0]._id;
    }
    updateMarkStudentOptions();
    await loadAttendance(elements.courseSelect.value);
    renderDashboard();
}

async function selectCourse(courseId) {
    elements.courseSelect.value = courseId;
    elements.markCourseSelect.value = courseId;
    updateMarkStudentOptions();
    await loadAttendance(courseId);
    renderDashboard();
}

elements.courseSelect.addEventListener('change', () => {
    selectCourse(elements.courseSelect.value).catch((error) => showNotice(error.message, 'error'));
});

elements.markCourseSelect.addEventListener('change', () => {
    selectCourse(elements.markCourseSelect.value).catch((error) => showNotice(error.message, 'error'));
});

elements.studentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(elements.studentForm).entries());

    try {
        const data = await request('/students/addnew', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        elements.studentForm.reset();
        await refreshData();
        showNotice(data.message || 'Student added.');
    } catch (error) {
        showNotice(error.message, 'error');
    }
});

elements.courseForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(elements.courseForm).entries());
    payload.TotalClasses = Number(payload.TotalClasses);

    try {
        const data = await request('/courses', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        elements.courseForm.reset();
        await refreshData();
        showNotice(data.message || 'Course created.');
    } catch (error) {
        showNotice(error.message, 'error');
    }
});

elements.enrollmentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(elements.enrollmentForm).entries());

    try {
        const data = await request('/students/enroll', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        elements.enrollmentForm.reset();
        await refreshData();
        showNotice(data.message || 'Student enrolled.');
    } catch (error) {
        showNotice(error.message, 'error');
    }
});

elements.attendanceForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(elements.attendanceForm).entries());
    payload.date = new Date(`${payload.date}T12:00:00`).toISOString();

    try {
        const data = await request('/attendance/mark', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        await loadAttendance(payload.courseId);
        renderDashboard();
        showNotice(data.message || 'Attendance saved.');
    } catch (error) {
        showNotice(error.message, 'error');
    }
});

function localDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

elements.attendanceDate.value = localDateString(new Date());

if (window.location.protocol === 'file:') {
    showNotice('You opened this page directly. Run npm run dev and visit http://localhost:3000 to load and manage attendance data.', 'error');
} else {
    refreshData().catch((error) => {
        showNotice(`Could not load dashboard: ${error.message}`, 'error');
    });
}
