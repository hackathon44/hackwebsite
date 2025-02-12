'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function TeachersDashboard() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [selectedClass, setSelectedClass] = useState("Class 10");

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
      }
    }
    checkUser();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const studentPerformanceData = {
    labels: ["Excellent", "Good", "Average", "Needs Improvement"],
    datasets: [{
      data: [30, 40, 20, 10],
      backgroundColor: ["#8e44ad", "#3498db", "#2ecc71", "#e74c3c"],
      borderColor: "#ffffff",
    }],
  };

  const progressData = {
    labels: ["Math", "Science", "English", "History", "Computer"],
    datasets: [{
      label: "Class Progress",
      data: [85, 78, 92, 74, 88],
      backgroundColor: "rgba(52, 152, 219, 0.8)",
    }],
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-8">
      <h1 className="text-4xl font-bold text-purple-400 mb-4">Teacher's Dashboard</h1>
      <h3 className="text-lg text-blue-300 mb-6">Welcome, {user?.email}</h3>

      <div className="w-full max-w-4xl bg-gray-900 shadow-lg rounded-xl p-6">
        <label className="text-lg text-purple-300">Select Class:</label>
        <select
          className="w-full p-2 bg-gray-800 text-white rounded-md mt-2"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option>Class 10</option>
          <option>Class 11</option>
          <option>Class 12</option>
        </select>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-xl text-blue-400">Student Performance</h2>
            <Pie data={studentPerformanceData} />
          </div>

          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-xl text-blue-400">Class Progress</h2>
            <Bar data={progressData} />
          </div>
        </div>

        <div className="flex justify-around mt-8">
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">AI - Online Access</button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">AI - Offline Access</button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}