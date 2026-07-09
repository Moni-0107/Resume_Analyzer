import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';

export const parsePDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF resume file.');
  }
};
