const fs = require('fs');
const path = require('path');

const DEFAULT_DATA_DIR = path.resolve(__dirname, '../../data');
const DEFAULT_DATA_PATH = path.join(DEFAULT_DATA_DIR, 'students.json');
const DEFAULT_SEED_PATH = path.join(DEFAULT_DATA_DIR, 'students.default.json');

function getDataFilePath() {
  return process.env.DATA_FILE_PATH || DEFAULT_DATA_PATH;
}

/**
 * Ensures that the data directory and students file exist.
 * If students.json does not exist, copies from students.default.json or initializes empty array.
 */
async function ensureDataFile() {
  const filePath = getDataFilePath();
  const dirPath = path.dirname(filePath);

  if (!fs.existsSync(dirPath)) {
    await fs.promises.mkdir(dirPath, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    if (fs.existsSync(DEFAULT_SEED_PATH)) {
      const defaultData = await fs.promises.readFile(DEFAULT_SEED_PATH, 'utf8');
      await fs.promises.writeFile(filePath, defaultData, 'utf8');
    } else {
      await fs.promises.writeFile(filePath, JSON.stringify([], null, 2), 'utf8');
    }
  }
}

/**
 * Reads all students from the JSON file.
 * Returns array of students.
 */
async function readStudents() {
  await ensureDataFile();
  const filePath = getDataFilePath();
  try {
    const raw = await fs.promises.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (err) {
    console.error('Error reading students file:', err.message);
    return [];
  }
}

/**
 * Writes the given array of students to the JSON file.
 */
async function writeStudents(students) {
  await ensureDataFile();
  const filePath = getDataFilePath();
  const data = JSON.stringify(students, null, 2);
  await fs.promises.writeFile(filePath, data, 'utf8');
  return students;
}

/**
 * Resets the student storage back to seed data.
 */
async function resetStudents() {
  await ensureDataFile();
  const filePath = getDataFilePath();
  let defaultData = '[]';
  if (fs.existsSync(DEFAULT_SEED_PATH)) {
    defaultData = await fs.promises.readFile(DEFAULT_SEED_PATH, 'utf8');
  }
  await fs.promises.writeFile(filePath, defaultData, 'utf8');
  return JSON.parse(defaultData);
}

module.exports = {
  getDataFilePath,
  ensureDataFile,
  readStudents,
  writeStudents,
  resetStudents
};
