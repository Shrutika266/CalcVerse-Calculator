export interface AcademicSubject {
  id: string;
  name: string;
  credits: number;
  gradePoint: number;
}

export interface SemesterSGPA {
  id: string;
  sgpa: number;
}

export const percentFromCgpa = (cgpa: number): number => {
  return Number((cgpa * 9.5).toFixed(2));
};

export const cgpaFromPercent = (percentage: number): number => {
  return Number((percentage / 9.5).toFixed(2));
};

export const calculateSgpa = (subjects: AcademicSubject[]): number => {
  const totalCredits = subjects.reduce((sum, subject) => sum + Math.max(0, subject.credits), 0);
  if (totalCredits === 0) return 0;
  const weightedPoints = subjects.reduce(
    (sum, subject) => sum + Math.max(0, subject.credits) * Math.max(0, Math.min(subject.gradePoint, 10)),
    0
  );
  return Number((weightedPoints / totalCredits).toFixed(2));
};

export const calculateCgpaFromSgpas = (semesterSgpas: SemesterSGPA[]): number => {
  const validSgpas = semesterSgpas.map((semester) => Math.max(0, Math.min(semester.sgpa, 10)));
  if (validSgpas.length === 0) return 0;
  const total = validSgpas.reduce((sum, value) => sum + value, 0);
  return Number((total / validSgpas.length).toFixed(2));
};

export const gradePointFromScore = (marks: number, maxMarks: number): number => {
  if (maxMarks <= 0) return 0;
  const raw = (marks / maxMarks) * 10;
  return Number(Math.max(0, Math.min(raw, 10)).toFixed(2));
};

export const determineAcademicClassification = (cgpa: number, percentage?: number): string => {
  const value = cgpa > 0 ? cgpa : percentage && percentage > 0 ? percentage / 9.5 : 0;
  if (value >= 9) return 'Outstanding Performance';
  if (value >= 8) return 'Excellent Distinction';
  if (value >= 7) return 'Very Good Standing';
  if (value >= 6) return 'Good Academic Progress';
  if (value >= 5) return 'Average Performance';
  return 'Needs Improvement';
};

export const formatAcademicNumber = (value: number): string => {
  if (!Number.isFinite(value)) return '0.00';
  return value.toFixed(2);
};
