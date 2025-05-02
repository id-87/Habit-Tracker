import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const habits = [
  { name: 'Sleep (hrs)', key: 'sleep', max: 12 },
  { name: 'Water (glasses)', key: 'water', max: 12 },
  { name: 'Screen Time (hrs)', key: 'screen', max: 12 }
];

const initialData = habits.reduce((acc, h) => ({ ...acc, [h.key]: 0 }), {});
const initialStreak = 0;

const IndexPage = () => {
  const [dailyData, setDailyData] = useState(initialData);
  const [streak, setStreak] = useState(initialStreak);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  useEffect(() => {
    // Mock weekly data
    const mock = Array.from({ length: 7 }).map((_, i) => ({
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
      sleep: Math.floor(Math.random() * 9) + 4,
      water: Math.floor(Math.random() * 10) + 2,
      screen: Math.floor(Math.random() * 8) + 2
    }));
    setWeeklyData(mock);
  }, []);

  const handleUpdate = (key: string, value: number) => {
    setDailyData(prev => ({ ...prev, [key]: value }));
  };

  const handleCheckIn = () => {
    const completed = Object.values(dailyData).every(val => val > 0);
    if (completed) {
      setStreak(s => s + 1);
      alert('🎉 Great job! Habit check-in complete.');
    } else {
      alert('⛔ Fill all values before check-in.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      {/* Navbar */}
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">HabitTracker</h1>
        <img src="https://randomuser.me/api/portraits/men/75.jpg" className="w-10 h-10 rounded-full" alt="avatar" />
      </header>

      {/* Hero */}
      <section className="text-center mt-6">
        <motion.h2 className="text-3xl font-semibold mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Track Your Habits Daily 📈
        </motion.h2>
        <p className="text-gray-600">Stay consistent, build streaks, and improve your lifestyle.</p>
      </section>

      {/* Habit Trackers */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {habits.map(habit => (
          <motion.div
            key={habit.key}
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-xl shadow p-4 flex flex-col gap-3"
          >
            <h3 className="font-medium">{habit.name}</h3>
            <input
              type="range"
              min={0}
              max={habit.max}
              value={dailyData[habit.key]}
              onChange={e => handleUpdate(habit.key, parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-right text-sm text-gray-600">{dailyData[habit.key]} / {habit.max}</div>
          </motion.div>
        ))}
      </section>

      {/* Check-In + Streak */}
      <section className="text-center py-4">
        <button
          onClick={handleCheckIn}
          className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
        >
          ✅ Check-In
        </button>
        <div className="mt-4 text-lg">
          🔥 Current Streak: <span className="font-bold">{streak} days</span>
        </div>
      </section>

      {/* Charts */}
      <section className="p-6 bg-white m-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-4">📊 Weekly Habit Progress</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sleep" stroke="#4f46e5" name="Sleep" />
            <Line type="monotone" dataKey="water" stroke="#059669" name="Water" />
            <Line type="monotone" dataKey="screen" stroke="#f97316" name="Screen Time" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-6">
        Built by Harshit Gupta · © 2025
      </footer>
    </div>
  );
};

export default IndexPage;
