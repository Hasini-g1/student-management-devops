/**
 * Student Management Portal - Frontend Application Logic
 * Integrates with Express REST API endpoints
 */

// Application State
const state = {
  students: [],
  selectedStudent: null,
  filters: {
    search: '',
    department: 'All',
    status: 'All'
  }
};

// DOM Elements
const elements = {
  healthBadge: document.getElementById('healthBadge'),
  healthStatusText: document.getElementById('healthStatusText'),
  studentsTableBody: document.getElementById('studentsTableBody'),
  recordCountText: document.getElementById('recordCountText'),
  searchInput: document.getElementById('searchInput'),
  searchClear: document.getElementById('searchClear'),
  departmentFilter: document.getElementById('departmentFilter'),
  statusFilter: document.getElementById('statusFilter'),
  btnResetDemo: document.getElementById('btnResetDemo'),
  btnOpenAddModal: document.getElementById('btnOpenAddModal'),
  btnDevOpsModal: document.getElementById('btnDevOpsModal'),
  btnCloseDevOpsModal: document.getElementById('btnCloseDevOpsModal'),
  btnDevOpsModalClose: document.getElementById('btnDevOpsModalClose'),
  devopsModal: document.getElementById('devopsModal'),

  // KPI Stats
  statTotalStudents: document.getElementById('statTotalStudents'),
  statActiveStudents: document.getElementById('statActiveStudents'),
  statDepartments: document.getElementById('statDepartments'),
  statAvgGpa: document.getElementById('statAvgGpa'),

  // Student Form Modal
  studentModal: document.getElementById('studentModal'),
  studentModalTitle: document.getElementById('studentModalTitle'),
  studentForm: document.getElementById('studentForm'),
  studentId: document.getElementById('studentId'),
  formRollNumber: document.getElementById('formRollNumber'),
  formName: document.getElementById('formName'),
  formEmail: document.getElementById('formEmail'),
  formDepartment: document.getElementById('formDepartment'),
  formYear: document.getElementById('formYear'),
  formGpa: document.getElementById('formGpa'),
  formStatus: document.getElementById('formStatus'),
  formAlert: document.getElementById('formAlert'),
  btnModalClose: document.getElementById('btnModalClose'),
  btnCancelModal: document.getElementById('btnCancelModal'),

  // Delete Modal
  deleteModal: document.getElementById('deleteModal'),
  deleteStudentPreview: document.getElementById('deleteStudentPreview'),
  btnDeleteModalClose: document.getElementById('btnDeleteModalClose'),
  btnCancelDelete: document.getElementById('btnCancelDelete'),
  btnConfirmDelete: document.getElementById('btnConfirmDelete'),

  // Toast Container
  toastContainer: document.getElementById('toastContainer')
};

/**
 * Show a toast notification
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  
  elements.toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Check backend health (/health)
 */
async function checkHealth() {
  const start = performance.now();
  try {
    const res = await fetch('/health');
    const latency = Math.round(performance.now() - start);
    if (res.ok) {
      const data = await res.json();
      elements.healthBadge.className = 'health-badge up';
      elements.healthStatusText.textContent = `API: UP (${latency}ms)`;
    } else {
      elements.healthBadge.className = 'health-badge down';
      elements.healthStatusText.textContent = 'API: Error';
    }
  } catch (err) {
    elements.healthBadge.className = 'health-badge down';
    elements.healthStatusText.textContent = 'API: Offline';
  }
}

/**
 * Fetch dashboard KPI metrics (/api/stats)
 */
async function fetchStats() {
  try {
    const res = await fetch('/api/stats');
    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        const stats = json.data;
        elements.statTotalStudents.textContent = stats.totalStudents;
        elements.statActiveStudents.textContent = stats.activeStudents;
        elements.statDepartments.textContent = stats.totalDepartments;
        elements.statAvgGpa.textContent = stats.averageGpa.toFixed(2);
      }
    }
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

/**
 * Fetch students list (/api/students)
 */
async function fetchStudents() {
  try {
    const params = new URLSearchParams();
    if (state.filters.search) params.append('search', state.filters.search);
    if (state.filters.department !== 'All') params.append('department', state.filters.department);
    if (state.filters.status !== 'All') params.append('status', state.filters.status);

    const url = `/api/students?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    
    const json = await res.json();
    state.students = json.data || [];
    renderStudentsTable();
    fetchStats();
  } catch (err) {
    console.error('Error fetching students:', err);
    elements.studentsTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          ❌ Failed to load student records from backend.<br>
          <small>${err.message}</small>
        </td>
      </tr>
    `;
    showToast('Failed to load students: ' + err.message, 'error');
  }
}

/**
 * Helper to get initials for avatar
 */
function getInitials(name) {
  if (!name) return 'ST';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Helper to get GPA color pill class
 */
function getGpaClass(gpa) {
  const g = parseFloat(gpa);
  if (g >= 9.0) return 'gpa-high';
  if (g >= 8.0) return 'gpa-good';
  if (g >= 7.0) return 'gpa-avg';
  return 'gpa-low';
}

/**
 * Render the table of students
 */
function renderStudentsTable() {
  const students = state.students;
  elements.recordCountText.textContent = `Showing ${students.length} record${students.length === 1 ? '' : 's'}`;

  if (students.length === 0) {
    elements.studentsTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          🔍 No student records found matching your filters.<br>
          <small>Try clearing your search query or add a new student.</small>
        </td>
      </tr>
    `;
    return;
  }

  elements.studentsTableBody.innerHTML = students.map(student => {
    const initials = getInitials(student.name);
    const gpaClass = getGpaClass(student.gpa);
    const isInactive = student.status && student.status.toLowerCase() === 'inactive';

    return `
      <tr data-id="${student.id}">
        <td>
          <div class="student-profile">
            <div class="student-avatar">${initials}</div>
            <div class="student-name-box">
              <span class="student-name">${escapeHtml(student.name)}</span>
              <span class="student-email">${escapeHtml(student.email)}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="roll-badge">${escapeHtml(student.rollNumber)}</span>
        </td>
        <td>
          <span class="dept-badge">${escapeHtml(student.department)}</span>
        </td>
        <td>${escapeHtml(student.year || 'N/A')}</td>
        <td>
          <span class="gpa-pill ${gpaClass}">${Number(student.gpa).toFixed(2)}</span>
        </td>
        <td>
          <span class="status-badge ${isInactive ? 'inactive' : 'active'}">
            ● ${isInactive ? 'Inactive' : 'Active'}
          </span>
        </td>
        <td class="text-right">
          <div class="table-actions">
            <button class="action-btn edit" onclick="window.handleEditStudent('${student.id}')" title="Edit Student">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="action-btn delete" onclick="window.handleOpenDeleteModal('${student.id}')" title="Delete Student">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Simple HTML sanitizer
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return str || '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Open Modal for Adding New Student
 */
function openAddModal() {
  elements.studentModalTitle.textContent = 'Add New Student Record';
  elements.studentId.value = '';
  elements.studentForm.reset();
  elements.formStatus.value = 'Active';
  elements.formYear.value = '3rd Year';
  elements.formAlert.style.display = 'none';
  elements.studentModal.classList.add('open');
  elements.formRollNumber.focus();
}

/**
 * Open Modal for Editing Student
 */
window.handleEditStudent = function (id) {
  const student = state.students.find(s => s.id === id);
  if (!student) {
    showToast('Student not found in memory.', 'error');
    return;
  }

  elements.studentModalTitle.textContent = 'Edit Student Record';
  elements.studentId.value = student.id;
  elements.formRollNumber.value = student.rollNumber;
  elements.formName.value = student.name;
  elements.formEmail.value = student.email;
  elements.formDepartment.value = student.department;
  elements.formYear.value = student.year || '3rd Year';
  elements.formGpa.value = student.gpa;
  elements.formStatus.value = student.status || 'Active';
  elements.formAlert.style.display = 'none';

  elements.studentModal.classList.add('open');
  elements.formName.focus();
};

/**
 * Close Student Form Modal
 */
function closeStudentModal() {
  elements.studentModal.classList.remove('open');
  elements.studentForm.reset();
  elements.formAlert.style.display = 'none';
}

/**
 * Handle Add/Edit Form Submission
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  elements.formAlert.style.display = 'none';

  const id = elements.studentId.value;
  const isEditing = Boolean(id);

  const payload = {
    rollNumber: elements.formRollNumber.value.trim(),
    name: elements.formName.value.trim(),
    email: elements.formEmail.value.trim(),
    department: elements.formDepartment.value,
    year: elements.formYear.value,
    gpa: parseFloat(elements.formGpa.value),
    status: elements.formStatus.value
  };

  try {
    const url = isEditing ? `/api/students/${id}` : '/api/students';
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      elements.formAlert.textContent = data.error || 'Validation error occurred.';
      elements.formAlert.style.display = 'block';
      return;
    }

    closeStudentModal();
    showToast(isEditing ? 'Student updated successfully!' : 'Student added successfully!', 'success');
    await fetchStudents();
  } catch (err) {
    elements.formAlert.textContent = 'Failed to save student: ' + err.message;
    elements.formAlert.style.display = 'block';
  }
}

/**
 * Open Delete Confirmation Modal
 */
window.handleOpenDeleteModal = function (id) {
  const student = state.students.find(s => s.id === id);
  if (!student) return;

  state.selectedStudent = student;
  elements.deleteStudentPreview.innerHTML = `
    <strong>${escapeHtml(student.name)}</strong> (${escapeHtml(student.rollNumber)})<br>
    <span style="color: #64748b;">${escapeHtml(student.department)} • GPA: ${Number(student.gpa).toFixed(2)}</span>
  `;
  elements.deleteModal.classList.add('open');
};

/**
 * Close Delete Modal
 */
function closeDeleteModal() {
  elements.deleteModal.classList.remove('open');
  state.selectedStudent = null;
}

/**
 * Confirm and execute student deletion
 */
async function executeDelete() {
  if (!state.selectedStudent) return;

  try {
    const res = await fetch(`/api/students/${state.selectedStudent.id}`, {
      method: 'DELETE'
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete');

    closeDeleteModal();
    showToast(`Deleted student: ${data.data.name}`, 'success');
    await fetchStudents();
  } catch (err) {
    showToast('Delete error: ' + err.message, 'error');
  }
}

/**
 * Reset Demo Data
 */
async function handleResetDemo() {
  if (!confirm('Reset student records to the original college demo dataset?')) return;

  try {
    const res = await fetch('/api/reset', { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      showToast('Demo data reset successfully!', 'success');
      await fetchStudents();
    } else {
      showToast('Failed to reset demo: ' + data.error, 'error');
    }
  } catch (err) {
    showToast('Reset failed: ' + err.message, 'error');
  }
}

/**
 * Event Listeners Initialization
 */
function setupEventListeners() {
  // Search input with debounce
  let searchTimeout;
  elements.searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const val = e.target.value;
    elements.searchClear.classList.toggle('show', val.length > 0);
    searchTimeout = setTimeout(() => {
      state.filters.search = val;
      fetchStudents();
    }, 250);
  });

  elements.searchClear.addEventListener('click', () => {
    elements.searchInput.value = '';
    elements.searchClear.classList.remove('show');
    state.filters.search = '';
    fetchStudents();
  });

  // Department and status filter dropdowns
  elements.departmentFilter.addEventListener('change', (e) => {
    state.filters.department = e.target.value;
    fetchStudents();
  });

  elements.statusFilter.addEventListener('change', (e) => {
    state.filters.status = e.target.value;
    fetchStudents();
  });

  // Reset demo button
  elements.btnResetDemo.addEventListener('click', handleResetDemo);

  // Student form modal triggers
  elements.btnOpenAddModal.addEventListener('click', openAddModal);
  elements.btnModalClose.addEventListener('click', closeStudentModal);
  elements.btnCancelModal.addEventListener('click', closeStudentModal);
  elements.studentForm.addEventListener('submit', handleFormSubmit);

  // Delete modal triggers
  elements.btnDeleteModalClose.addEventListener('click', closeDeleteModal);
  elements.btnCancelDelete.addEventListener('click', closeDeleteModal);
  elements.btnConfirmDelete.addEventListener('click', executeDelete);

  // DevOps Architecture modal
  elements.btnDevOpsModal.addEventListener('click', () => {
    elements.devopsModal.classList.add('open');
  });
  elements.btnCloseDevOpsModal.addEventListener('click', () => {
    elements.devopsModal.classList.remove('open');
  });
  elements.btnDevOpsModalClose.addEventListener('click', () => {
    elements.devopsModal.classList.remove('open');
  });

  // Click on health badge triggers manual check
  elements.healthBadge.addEventListener('click', () => {
    checkHealth();
    showToast('Checked /health endpoint', 'info');
  });

  // Close modals when clicking backdrop
  window.addEventListener('click', (e) => {
    if (e.target === elements.studentModal) closeStudentModal();
    if (e.target === elements.deleteModal) closeDeleteModal();
    if (e.target === elements.devopsModal) elements.devopsModal.classList.remove('open');
  });

  // ESC key closes modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeStudentModal();
      closeDeleteModal();
      elements.devopsModal.classList.remove('open');
    }
  });
}

// Initial Bootstrapping
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  checkHealth();
  fetchStudents();
  // Health check polling every 15 seconds
  setInterval(checkHealth, 15000);
});
