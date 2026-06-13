import { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Plus, Trash2, ArrowRightCircle, Award } from 'lucide-react';
import { addHistoryItem } from '../utils/history';
import {
  AcademicSubject,
  SemesterSGPA,
  calculateCgpaFromSgpas,
  calculateSgpa,
  cgpaFromPercent,
  determineAcademicClassification,
  formatAcademicNumber,
  gradePointFromScore,
  percentFromCgpa,
} from '../utils/academicUtils';

interface AcademicCalculatorProps {
  darkMode?: boolean;
}

const defaultSubjects: AcademicSubject[] = [
  { id: 'sub-1', name: 'Subject 1', credits: 3, gradePoint: 8 },
  { id: 'sub-2', name: 'Subject 2', credits: 4, gradePoint: 7.5 },
  { id: 'sub-3', name: 'Subject 3', credits: 3, gradePoint: 8.5 },
];

const defaultSemesters: SemesterSGPA[] = [
  { id: 'sem-1', sgpa: 8.1 },
  { id: 'sem-2', sgpa: 8.4 },
];

export default function AcademicCalculator({ darkMode = true }: AcademicCalculatorProps) {
  const [cgpaInput, setCgpaInput] = useState('8.0');
  const [percentageInput, setPercentageInput] = useState('76.0');
  const [subjects, setSubjects] = useState<AcademicSubject[]>(defaultSubjects);
  const [semesterSgpas, setSemesterSgpas] = useState<SemesterSGPA[]>(defaultSemesters);
  const [marksObtained, setMarksObtained] = useState('82');
  const [maxMarks, setMaxMarks] = useState('100');
  const [result, setResult] = useState<{
    cgpa: number;
    percentage: number;
    sgpa: number;
    sgpi: number;
    semesterCgpa: number;
    gradePoint: number;
    classification: string;
  } | null>(null);
  const [error, setError] = useState('');

  const cardStyle = darkMode
    ? 'bg-[#0b132b] border border-blue-900/30 text-white'
    : 'bg-white border border-slate-200 text-slate-900';
  const inputStyle = darkMode
    ? 'w-full px-4 py-3 rounded-2xl border border-blue-900/30 bg-[#121c3d] text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 outline-none'
    : 'w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none';

  const addSubjectRow = () => {
    setSubjects((prev) => [
      ...prev,
      {
        id: `sub-${Date.now()}`,
        name: `Subject ${prev.length + 1}`,
        credits: 3,
        gradePoint: 7,
      },
    ]);
  };

  const removeSubject = (id: string) => {
    setSubjects((prev) => prev.filter((subject) => subject.id !== id));
  };

  const addSemesterRow = () => {
    setSemesterSgpas((prev) => [
      ...prev,
      {
        id: `sem-${Date.now()}`,
        sgpa: 8,
      },
    ]);
  };

  const removeSemesterRow = (id: string) => {
    setSemesterSgpas((prev) => prev.filter((semester) => semester.id !== id));
  };

  const calculate = () => {
    setError('');
    try {
      const cgpaValue = parseFloat(cgpaInput);
      const percentageValue = parseFloat(percentageInput);
      const finalCgpa = cgpaValue > 0 ? cgpaValue : cgpaFromPercent(percentageValue);
      const finalPercentage = percentageValue > 0 ? percentageValue : percentFromCgpa(cgpaValue);

      const sgpa = calculateSgpa(subjects);
      const sgpi = Number((sgpa * 10).toFixed(2));
      const semesterCgpa = calculateCgpaFromSgpas(semesterSgpas);
      const gradePoint = gradePointFromScore(Number(marksObtained), Number(maxMarks));
      const classification = determineAcademicClassification(semesterCgpa || finalCgpa, finalPercentage);

      const summary = {
        cgpa: Number(finalCgpa.toFixed(2)),
        percentage: Number(finalPercentage.toFixed(2)),
        sgpa,
        sgpi,
        semesterCgpa,
        gradePoint,
        classification,
      };
      setResult(summary);

      addHistoryItem(
        'Academic Calculator',
        `CGPA: ${formatAcademicNumber(summary.cgpa)}, Percentage: ${formatAcademicNumber(summary.percentage)}, SGPA: ${formatAcademicNumber(summary.sgpa)}, SGPI: ${formatAcademicNumber(summary.sgpi)}, Semester CGPA: ${formatAcademicNumber(summary.semesterCgpa)}`
      );
    } catch (e) {
      setError('Please enter valid academic values before calculating.');
    }
  };

  return (
    <div id="academic-calculator" className={`w-full max-w-5xl mx-auto rounded-3xl p-6 md:p-8 shadow-2xl ${cardStyle}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold">Academic Calculator</h2>
            <p className="text-sm text-slate-300 max-w-xl">
              CGPA, SGPA, SGPI and Percentage Conversion with Semester Performance Analysis
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <div className="space-y-4">
          <div className="rounded-3xl p-5 border border-blue-900/20 bg-slate-950/10">
            <h3 className="text-lg font-bold mb-3">CGPA & Percentage Converter</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-300">
                Enter CGPA
                <input
                  value={cgpaInput}
                  onChange={(e) => setCgpaInput(e.target.value)}
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  className={inputStyle}
                  placeholder="8.5"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-300">
                Enter Percentage
                <input
                  value={percentageInput}
                  onChange={(e) => setPercentageInput(e.target.value)}
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  className={inputStyle}
                  placeholder="80"
                />
              </label>
            </div>
          </div>

          <div className="rounded-3xl p-5 border border-blue-900/20 bg-slate-950/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">SGPA & SGPI Builder</h3>
              <button
                type="button"
                onClick={addSubjectRow}
                className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
              >
                <Plus className="w-4 h-4" />
                Add Subject
              </button>
            </div>
            <div className="space-y-4">
              {subjects.map((subject, index) => (
                <div key={subject.id} className="grid gap-3 md:grid-cols-12 items-end">
                  <div className="md:col-span-5">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Subject</label>
                    <input
                      value={subject.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setSubjects((prev) => prev.map((item) => (item.id === subject.id ? { ...item, name } : item)));
                      }}
                      className={inputStyle}
                      placeholder={`Subject ${index + 1}`}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Credits</label>
                    <input
                      value={subject.credits}
                      onChange={(e) => {
                        const credits = Number(e.target.value);
                        setSubjects((prev) => prev.map((item) => (item.id === subject.id ? { ...item, credits } : item)));
                      }}
                      type="number"
                      min="0"
                      step="1"
                      className={inputStyle}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Grade Point</label>
                    <input
                      value={subject.gradePoint}
                      onChange={(e) => {
                        const gradePoint = Number(e.target.value);
                        setSubjects((prev) => prev.map((item) => (item.id === subject.id ? { ...item, gradePoint } : item)));
                      }}
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      className={inputStyle}
                    />
                  </div>
                  <div className="md:col-span-1 flex justify-end md:justify-center">
                    <button
                      type="button"
                      onClick={() => removeSubject(subject.id)}
                      className="rounded-2xl bg-red-500/10 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/15"
                      aria-label="Remove subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl p-5 border border-blue-900/20 bg-slate-950/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Semester CGPA Summary</h3>
              <button
                type="button"
                onClick={addSemesterRow}
                className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
              >
                <Plus className="w-4 h-4" />
                Add Semester
              </button>
            </div>
            <div className="space-y-4">
              {semesterSgpas.map((semester, index) => (
                <div key={semester.id} className="grid gap-3 md:grid-cols-12 items-end">
                  <div className="md:col-span-7">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Semester {index + 1}</label>
                    <input
                      value={semester.sgpa}
                      onChange={(e) => {
                        const sgpa = Number(e.target.value);
                        setSemesterSgpas((prev) => prev.map((item) => (item.id === semester.id ? { ...item, sgpa } : item)));
                      }}
                      type="number"
                      min="0"
                      max="10"
                      step="0.01"
                      className={inputStyle}
                      placeholder="8.2"
                    />
                  </div>
                  <div className="md:col-span-4 flex flex-col gap-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">SGPI</label>
                    <div className="rounded-2xl border border-blue-900/20 bg-slate-950/70 px-4 py-3 text-sm text-slate-100">
                      {Number((semester.sgpa * 10).toFixed(1))}
                    </div>
                  </div>
                  <div className="md:col-span-1 flex justify-end md:justify-center">
                    <button
                      type="button"
                      onClick={() => removeSemesterRow(semester.id)}
                      className="rounded-2xl bg-red-500/10 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/15"
                      aria-label="Remove semester"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl p-5 border border-blue-900/20 bg-slate-950/10">
            <h3 className="text-lg font-bold mb-4">Grade Point Calculator</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-300">
                Marks Obtained
                <input
                  value={marksObtained}
                  onChange={(e) => setMarksObtained(e.target.value)}
                  type="number"
                  min="0"
                  className={inputStyle}
                  placeholder="82"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-300">
                Maximum Marks
                <input
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  type="number"
                  min="1"
                  className={inputStyle}
                  placeholder="100"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <motion.button
        type="button"
        onClick={calculate}
        whileHover={{ scale: 1.02 }}
        className="mb-6 inline-flex items-center justify-center w-full rounded-3xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-sky-500/20 transition"
      >
        Calculate Academic Score
      </motion.button>

      {result && (
        <div className="grid gap-5 xl:grid-cols-3">
          <div className="rounded-3xl border border-blue-900/20 bg-[#081126]/80 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Conversion</p>
                <h3 className="text-xl font-bold">CGPA & Percentage</h3>
              </div>
              <Award className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <p>CGPA: <span className="font-semibold text-white">{formatAcademicNumber(result.cgpa)}</span></p>
              <p>Percentage: <span className="font-semibold text-white">{formatAcademicNumber(result.percentage)}%</span></p>
            </div>
          </div>
          <div className="rounded-3xl border border-blue-900/20 bg-[#081126]/80 p-6">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Semester Metrics</p>
              <h3 className="text-xl font-bold">SGPA & CGPA</h3>
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <p>SGPA: <span className="font-semibold text-white">{formatAcademicNumber(result.sgpa)}</span></p>
              <p>SGPI: <span className="font-semibold text-white">{formatAcademicNumber(result.sgpi)}</span></p>
              <p>Semester CGPA: <span className="font-semibold text-white">{formatAcademicNumber(result.semesterCgpa)}</span></p>
            </div>
          </div>
          <div className="rounded-3xl border border-blue-900/20 bg-[#081126]/80 p-6">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Academic Summary</p>
              <h3 className="text-xl font-bold">Performance</h3>
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <p>Grade Point: <span className="font-semibold text-white">{formatAcademicNumber(result.gradePoint)}</span></p>
              <p>Classification: <span className="font-semibold text-cyan-300">{result.classification}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
