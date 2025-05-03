import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { SunIcon, MoonIcon, PlusIcon, CogIcon, CheckIcon } from '@heroicons/react/24/solid';

// Interface for habit data
interface Habit {
  name: string;
  key: string;
  max: number;
  icon: string; // Added for icons in UI
}

// Interface for daily data
interface DailyData {
  [key: string]: number;
}

// Initial habits with icons
const initialHabits: Habit[] = [
  { name: 'Sleep (hrs)', key: 'sleep', max: 12, icon: '🛌' },
  { name: 'Water (glasses)', key: 'water', max: 12, icon: '💧' },
  { name: 'Screen Time (hrs)', key: 'screen', max: 12, icon: '📱' },
];

// Mock motivational quotes
const quotes = [
  "Small steps every day lead to big results!",
  "Consistency is the key to success.",
  "Your habits shape your future.",
];

// Component
const HabitTracker = () => {
  // State management
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [dailyData, setDailyData] = useState<DailyData>(
    initialHabits.reduce((acc, h) => ({ ...acc, [h.key]: 0 }), {})
  );
  const [streak, setStreak] = useState(0);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [reminder, setReminder] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [totalWater, setTotalWater] = useState(0);

  // Mock weekly data on mount
  useEffect(() => {
    const mock = Array.from({ length: 7 }).map((_, i) => {
      const data: any = { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i] };
      habits.forEach(h => {
        data[h.key] = Math.floor(Math.random() * h.max * 0.8) + 2;
      });
      return data;
    });
    setWeeklyData(mock);

    // Simulate reminder after 5 seconds
    const timer = setTimeout(() => {
      if (Object.values(dailyData).some(val => val === 0)) {
        setReminder('Don’t forget to log your habits today! 📋');
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [habits, dailyData]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Update daily data
  const handleUpdate = (key: string, value: number) => {
    setDailyData(prev => ({ ...prev, [key]: value }));
  };

  // Handle check-in
  const handleCheckIn = () => {
    const completed = Object.values(dailyData).every(val => val > 0);
    if (completed) {
      setStreak(s => {
        const newStreak = s + 1;
        // Check for streak achievements
        if (newStreak === 3) {
          setAchievements(prev => [...prev, '3-Day Streak! 🔥']);
        }
        return newStreak;
      });
      // Update total water for water habit
      if (dailyData['water']) {
        setTotalWater(prev => {
          const newTotal = prev + dailyData['water'];
          if (newTotal >= 50 && !achievements.includes('50 Glasses Water')) {
            setAchievements(prev => [...prev, '50 Glasses Water! 💦']);
          }
          return newTotal;
        });
      }
      setReminder('🎉 Great job! Keep it up!');
      // Update weekly data
      setWeeklyData(prev => {
        const lastDay = prev[prev.length - 1] || {};
        const newDay = { ...lastDay, day: 'Today', ...dailyData };
        return [...prev.slice(1), newDay];
      });
    } else {
      setReminder('⛔ Please fill all habits before checking in.');
    }
  };

  // Add new habit
  const handleAddHabit = (name: string, max: number) => {
    const key = name.toLowerCase().replace(/\s/g, '_');
    const newHabit: Habit = { name, key, max, icon: '📋' };
    setHabits(prev => [...prev, newHabit]);
    setDailyData(prev => ({ ...prev, [key]: 0 }));
    setShowAddHabit(false);
  };

  // Reset data
  const handleReset = () => {
    setDailyData(initialHabits.reduce((acc, h) => ({ ...acc, [h.key]: 0 }), {}));
    setStreak(0);
    setTotalWater(0);
    setAchievements([]);
    setShowSettings(false);
  };

  // Calculate completion percentage
  const completionPercentage = Math.round(
    (Object.values(dailyData).reduce((sum, val) => sum + val, 0) /
      (habits.reduce((sum, h) => sum + h.max, 0) || 1)) * 100
  );

  // Small component: Habit Card
  const HabitCard = ({ habit }: { habit: Habit }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col gap-4"
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">{habit.icon}</span>
        <h3 className="font-semibold text-lg">{habit.name}</h3>
      </div>
      <input
        type="range"
        min={0}
        max={habit.max}
        value={dailyData[habit.key]}
        onChange={e => handleUpdate(habit.key, parseInt(e.target.value))}
        className="w-full accent-teal-500"
      />
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
        <span>{dailyData[habit.key]} / {habit.max}</span>
        <span>{Math.round((dailyData[habit.key] / habit.max) * 100)}%</span>
      </div>
    </motion.div>
  );

  // Small component: Add Habit Modal
  const AddHabitModal = () => {
    const [name, setName] = useState('');
    const [max, setMax] = useState(10);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
        >
          <h3 className="text-xl font-semibold mb-4">Add New Habit</h3>
          <input
            type="text"
            placeholder="Habit Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white"
          />
          <input
            type="number"
            placeholder="Max Value"
            value={max}
            onChange={e => setMax(parseInt(e.target.value))}
            className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white"
          />
          <div className="flex gap-4">
            <button
              onClick={() => setShowAddHabit(false)}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => handleAddHabit(name, max)}
              disabled={!name || max <= 0}
              className="flex-1 bg-teal-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Add Habit
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Small component: Settings Modal
  const SettingsModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
      >
        <h3 className="text-xl font-semibold mb-4">Settings</h3>
        <button
          onClick={handleReset}
          className="w-full bg-red-500 text-white px-4 py-2 rounded mb-4"
        >
          Reset All Data
        </button>
        <button
          onClick={() => setShowSettings(false)}
          className="w-full bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} font-sans transition-colors duration-300`}>
      {/* Navbar */}
      <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-10 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-teal-500">HabitTracker</h1>
        <div className="flex items-center gap-4">
          <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
          </button>
          <button onClick={() => setShowSettings(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <CogIcon className="w-6 h-6" />
          </button>
          <img src="https://randomuser.me/api/portraits/men/75.jpg" className="w-10 h-10 rounded-full" alt="avatar" />
        </div>
      </header>

      {/* Hero */}
      <section className="text-center py-12 px-6 bg-gradient-to-r from-teal-100 to-indigo-100 dark:from-teal-900 dark:to-indigo-900">
        <motion.h2
          className="text-4xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Build Better Habits 🚀
        </motion.h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          {quotes[Math.floor(Math.random() * quotes.length)]}
        </p>
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => setShowAddHabit(true)}
          className="bg-teal-500 text-white px-6 py-2 rounded-full flex items-center gap-2 mx-auto"
        >
          <PlusIcon className="w-5 h-5" /> Add New Habit
        </motion.button>
      </section>

      {/* Summary */}
      <section className="px-6 py-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center"
        >
          <h3 className="text-xl font-semibold mb-2">Today’s Progress</h3>
          <div className="text-3xl font-bold text-teal-500">{completionPercentage}%</div>
          <p className="text-gray-600 dark:text-gray-300">Keep going to reach 100%!</p>
        </motion.div>
      </section>

      {/* Habit Trackers */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {habits.map(habit => (
          <HabitCard key={habit.key} habit={habit} />
        ))}
      </section>

      {/* Check-In + Streak */}
      <section className="text-center py-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={handleCheckIn}
          className="bg-teal-500 text-white px-8 py-3 rounded-full flex items-center gap-2 mx-auto"
        >
          <CheckIcon className="w-5 h-5" /> Check-In
        </motion.button>
        <div className="mt-4 text-xl">
          🔥 Streak: <span className="font-bold">{streak} days</span>
        </div>
      </section>

      {/* Achievements */}
      {achievements.length > 0 && (
        <section className="px-6 py-4">
          <h3 className="text-xl font-semibold mb-4">🏆 Achievements</h3>
          <div className="flex flex-wrap gap-4">
            {achievements.map((ach, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-full"
              >
                {ach}
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Charts */}
      <section className="p-6 bg-white dark:bg-gray-800 m-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4">📊 Weekly Progress</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            {habits.map(h => (
              <Line
                key={h.key}
                type="monotone"
                dataKey={h.key}
                stroke={['#14b8a6', '#4f46e5', '#f97316', '#ec4899'][habits.indexOf(h) % 4]}
                name={h.name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Reminder Notification */}
      <AnimatePresence>
        {reminder && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-teal-500 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            {reminder}
            <button
              onClick={() => setReminder(null)}
              className="ml-4 text-sm underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showSettings && <SettingsModal />}
        {showAddHabit && <AddHabitModal />}
      </AnimatePresence>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 dark:text-gray-400 py-6">
        Built by Harshit Gupta · © 2025
      </footer>
    </div>
  );
};

export default HabitTracker;