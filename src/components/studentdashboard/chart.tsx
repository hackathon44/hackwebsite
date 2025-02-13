'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../app/utils/supabase';
import { useAuth } from '../../app/context/authcontext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { ArrowUp, ArrowDown, Brain, Target, TrendingUp, Book, AlertTriangle } from 'lucide-react';

interface TestAttempt {
  test_id: string;
  marks_obtained: number;
  attempt_time: string;
  is_correct: boolean;
  question_id: string;
}

interface Test {
  id: string;
  name: string;
  total_marks: number;
}

interface ProcessedTestResult {
  test_name: string;
  total_marks: number;
  marks_obtained: number;
  attempt_date: string;
  accuracy_percentage: number;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<ProcessedTestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentAnalytics = async () => {
      if (!user?.id) return;

      try {
        const { data: attempts, error: attemptsError } = await supabase
          .from('student_attempts')
          .select('*')
          .eq('student_id', user.id);

        if (attemptsError) throw attemptsError;

        const { data: tests, error: testsError } = await supabase
          .from('tests')
          .select('*');

        if (testsError) throw testsError;

        const processedResults = new Map<string, ProcessedTestResult>();
        
        attempts?.forEach(attempt => {
          const test = tests?.find(t => t.id === attempt.test_id);
          if (!test) return;

          if (!processedResults.has(attempt.test_id)) {
            processedResults.set(attempt.test_id, {
              test_name: test.name,
              total_marks: test.total_marks,
              marks_obtained: 0,
              attempt_date: new Date(attempt.attempt_time).toLocaleDateString(),
              accuracy_percentage: 0
            });
          }

          const result = processedResults.get(attempt.test_id)!;
          result.marks_obtained += attempt.marks_obtained;
        });

        processedResults.forEach(result => {
          result.accuracy_percentage = Math.round((result.marks_obtained / result.total_marks) * 100);
        });

        setTestResults(Array.from(processedResults.values()));
      } catch (error) {
        console.error('Error in fetchStudentAnalytics:', error);
        setError('Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAnalytics();
  }, [user?.id]);

  const averageAccuracy = testResults.reduce((acc, curr) => acc + curr.accuracy_percentage, 0) / testResults.length;
  const sortedByPerformance = [...testResults].sort((a, b) => b.accuracy_percentage - a.accuracy_percentage);
  const strongSubjects = sortedByPerformance.filter(test => test.accuracy_percentage >= averageAccuracy);
  const weakSubjects = sortedByPerformance.filter(test => test.accuracy_percentage < averageAccuracy);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white/30 backdrop-blur-sm rounded-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 p-8 bg-gray-50">
      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Performance</p>
              <p className="text-3xl font-bold text-black mt-2">{averageAccuracy.toFixed(1)}%</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tests Attempted</p>
              <p className="text-3xl font-bold text-black mt-2">{testResults.length}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <Book className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Areas for Improvement</p>
              <p className="text-3xl font-bold text-black mt-2">{weakSubjects.length}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-black mb-6">Subject Performance Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={testResults}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="test_name" stroke="#4b5563" />
                <YAxis stroke="#4b5563" />
                <Tooltip />
                <Bar
                  dataKey="accuracy_percentage"
                  name="Accuracy"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-black mb-6">Skills Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={testResults}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="test_name" stroke="#4b5563" />
                <Radar
                  name="Performance"
                  dataKey="accuracy_percentage"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Strong Areas */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <Brain className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-black">Strong Areas</h3>
          </div>
          <div className="space-y-4">
            {strongSubjects.map(subject => (
              <div
                key={subject.test_name}
                className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100"
              >
                <div>
                  <p className="font-medium text-black">{subject.test_name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Score: {subject.marks_obtained}/{subject.total_marks}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 font-semibold">{subject.accuracy_percentage}%</span>
                  <ArrowUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <Target className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-black">Areas for Improvement</h3>
          </div>
          <div className="space-y-4">
            {weakSubjects.map(subject => (
              <div
                key={subject.test_name}
                className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100"
              >
                <div>
                  <p className="font-medium text-black">{subject.test_name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Score: {subject.marks_obtained}/{subject.total_marks}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-red-600 font-semibold">{subject.accuracy_percentage}%</span>
                  <ArrowDown className="w-5 h-5 text-red-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Test History */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-black mb-4">Test History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {testResults.map((result, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                    {result.test_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {result.marks_obtained} / {result.total_marks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      result.accuracy_percentage >= averageAccuracy
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.accuracy_percentage}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {result.attempt_date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}