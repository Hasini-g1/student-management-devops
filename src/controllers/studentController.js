const {
  readStudents,
  writeStudents,
  resetStudents
} = require('../utils/fileStorage');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Health check handler
 */
function getHealth(req, res) {
  res.status(200).json({
    status: 'UP',
    message: 'Student Management DevOps Service is running smoothly',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
}

/**
 * Get all students with optional search & filter
 */
async function getStudents(req, res) {
  try {
    const students = await readStudents();
    const { search, department, status } = req.query;

    let filtered = [...students];

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(s =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.rollNumber && s.rollNumber.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.department && s.department.toLowerCase().includes(q))
      );
    }

    if (department && department.trim() && department !== 'All') {
      filtered = filtered.filter(s =>
        s.department && s.department.toLowerCase() === department.trim().toLowerCase()
      );
    }

    if (status && status.trim() && status !== 'All') {
      filtered = filtered.filter(s =>
        s.status && s.status.toLowerCase() === status.trim().toLowerCase()
      );
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve students: ' + err.message
    });
  }
}

/**
 * Get student by ID
 */
async function getStudentById(req, res) {
  try {
    const { id } = req.params;
    const students = await readStudents();
    const student = students.find(s => s.id === id);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: `Student with ID "${id}" was not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student details: ' + err.message
    });
  }
}

/**
 * Create a new student
 */
async function createStudent(req, res) {
  try {
    const { name, rollNumber, email, department, year, gpa, status } = req.body;
    const validationErrors = [];

    // Name validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      validationErrors.push('Student name is required and must be at least 2 characters.');
    }

    // Roll number validation
    if (!rollNumber || typeof rollNumber !== 'string' || rollNumber.trim().length < 2) {
      validationErrors.push('Roll number is required.');
    }

    // Email validation
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      validationErrors.push('A valid email address is required.');
    }

    // Department validation
    if (!department || typeof department !== 'string' || department.trim().length < 2) {
      validationErrors.push('Department is required.');
    }

    // Year validation
    if (!year || typeof year !== 'string' || year.trim().length === 0) {
      validationErrors.push('Academic year is required (e.g. 1st Year, 2nd Year, 3rd Year, 4th Year).');
    }

    // GPA validation
    const parsedGpa = parseFloat(gpa);
    if (isNaN(parsedGpa) || parsedGpa < 0 || parsedGpa > 10) {
      validationErrors.push('GPA must be a valid number between 0.0 and 10.0.');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: validationErrors[0],
        errors: validationErrors
      });
    }

    const students = await readStudents();

    // Check duplicate roll number
    const existingRoll = students.find(
      s => s.rollNumber.toLowerCase() === rollNumber.trim().toLowerCase()
    );
    if (existingRoll) {
      return res.status(400).json({
        success: false,
        error: `A student with roll number "${rollNumber.trim()}" already exists.`,
        errors: [`A student with roll number "${rollNumber.trim()}" already exists.`]
      });
    }

    // Check duplicate email
    const existingEmail = students.find(
      s => s.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: `A student with email "${email.trim()}" already exists.`,
        errors: [`A student with email "${email.trim()}" already exists.`]
      });
    }

    const newStudent = {
      id: 'std_' + Date.now() + Math.random().toString(36).substring(2, 6),
      rollNumber: rollNumber.trim().toUpperCase(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      year: year.trim(),
      gpa: Math.round(parsedGpa * 100) / 100,
      status: (status && status.trim().toLowerCase() === 'inactive') ? 'Inactive' : 'Active',
      createdAt: new Date().toISOString()
    };

    students.push(newStudent);
    await writeStudents(students);

    res.status(201).json({
      success: true,
      message: 'Student record created successfully.',
      data: newStudent
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to create student: ' + err.message
    });
  }
}

/**
 * Update an existing student
 */
async function updateStudent(req, res) {
  try {
    const { id } = req.params;
    const students = await readStudents();
    const index = students.findIndex(s => s.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: `Student with ID "${id}" was not found.`
      });
    }

    const existingStudent = students[index];
    const { name, rollNumber, email, department, year, gpa, status } = req.body;
    const validationErrors = [];

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        validationErrors.push('Student name must be at least 2 characters.');
      }
    }

    if (rollNumber !== undefined) {
      if (typeof rollNumber !== 'string' || rollNumber.trim().length < 2) {
        validationErrors.push('Roll number must not be empty.');
      } else {
        const rollConflict = students.find(
          s => s.id !== id && s.rollNumber.toLowerCase() === rollNumber.trim().toLowerCase()
        );
        if (rollConflict) {
          validationErrors.push(`Roll number "${rollNumber.trim()}" is already assigned to another student.`);
        }
      }
    }

    if (email !== undefined) {
      if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
        validationErrors.push('A valid email address is required.');
      } else {
        const emailConflict = students.find(
          s => s.id !== id && s.email.toLowerCase() === email.trim().toLowerCase()
        );
        if (emailConflict) {
          validationErrors.push(`Email "${email.trim()}" is already registered to another student.`);
        }
      }
    }

    let parsedGpa = existingStudent.gpa;
    if (gpa !== undefined) {
      const g = parseFloat(gpa);
      if (isNaN(g) || g < 0 || g > 10) {
        validationErrors.push('GPA must be a valid number between 0.0 and 10.0.');
      } else {
        parsedGpa = Math.round(g * 100) / 100;
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: validationErrors[0],
        errors: validationErrors
      });
    }

    const updatedStudent = {
      ...existingStudent,
      name: name !== undefined ? name.trim() : existingStudent.name,
      rollNumber: rollNumber !== undefined ? rollNumber.trim().toUpperCase() : existingStudent.rollNumber,
      email: email !== undefined ? email.trim().toLowerCase() : existingStudent.email,
      department: department !== undefined ? department.trim() : existingStudent.department,
      year: year !== undefined ? year.trim() : existingStudent.year,
      gpa: parsedGpa,
      status: status !== undefined
        ? (status.trim().toLowerCase() === 'inactive' ? 'Inactive' : 'Active')
        : existingStudent.status,
      updatedAt: new Date().toISOString()
    };

    students[index] = updatedStudent;
    await writeStudents(students);

    res.status(200).json({
      success: true,
      message: 'Student record updated successfully.',
      data: updatedStudent
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to update student: ' + err.message
    });
  }
}

/**
 * Delete a student record
 */
async function deleteStudent(req, res) {
  try {
    const { id } = req.params;
    const students = await readStudents();
    const index = students.findIndex(s => s.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: `Student with ID "${id}" was not found.`
      });
    }

    const [deletedStudent] = students.splice(index, 1);
    await writeStudents(students);

    res.status(200).json({
      success: true,
      message: `Student "${deletedStudent.name}" removed successfully.`,
      data: deletedStudent
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete student: ' + err.message
    });
  }
}

/**
 * Reset data back to initial seeds
 */
async function resetData(req, res) {
  try {
    const seeded = await resetStudents();
    res.status(200).json({
      success: true,
      message: 'Student records reset to default demo dataset.',
      count: seeded.length,
      data: seeded
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to reset student data: ' + err.message
    });
  }
}

/**
 * Aggregate summary statistics for dashboard metrics
 */
async function getStats(req, res) {
  try {
    const students = await readStudents();
    const total = students.length;
    const active = students.filter(s => s.status === 'Active').length;
    const inactive = total - active;

    const departments = new Set(students.map(s => s.department)).size;
    const totalGpa = students.reduce((sum, s) => sum + (Number(s.gpa) || 0), 0);
    const avgGpa = total > 0 ? (totalGpa / total).toFixed(2) : '0.00';

    res.status(200).json({
      success: true,
      data: {
        totalStudents: total,
        activeStudents: active,
        inactiveStudents: inactive,
        totalDepartments: departments,
        averageGpa: parseFloat(avgGpa)
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to compute dashboard stats: ' + err.message
    });
  }
}

module.exports = {
  getHealth,
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  resetData,
  getStats
};
