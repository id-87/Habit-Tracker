import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { SunIcon, MoonIcon, PlusIcon, CogIcon, CheckIcon, ArrowRightOnRectangleIcon, UserPlusIcon } from '@heroicons/react/24/solid';

interface Habit {
  name: string;
  key: string;
  max: number;
}

interface DailyData {
  [key: string]: number;
}

interface User {
  username: string;
  password: string;
  habits: Habit[];
  dailyData: DailyData;
  streak: number;
  achievements: string[];
  totalWater: number;
  weeklyData: any[];
}

const initialHabits: Habit[] = [
  { name: 'Sleep (hrs)', key: 'sleep', max: 12 },
  { name: 'Water (glasses)', key: 'water', max: 12 },
  { name: 'Screen Time (hrs)', key: 'screen', max: 12 },
];

const quotes = [
  "Small steps every day lead to big results!",
  "Consistency is the key to success.",
  "Your habits shape your future.",
];

const HabitTracker = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [dailyData, setDailyData] = useState<DailyData>(
    initialHabits.reduce((acc, h) => ({ ...acc, [h.key]: 0 }), {})
  );
  const [streak, setStreak] = useState(0);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [reminder, setReminder] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [totalWater, setTotalWater] = useState(0);

  useEffect(() => {
    if (currentUser) {
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.username === currentUser);
      if (user) {
        setHabits(user.habits);
        setDailyData(user.dailyData);
        setStreak(user.streak);
        setAchievements(user.achievements);
        setTotalWater(user.totalWater);
        setWeeklyData(user.weeklyData);
      }
    } else {
      setHabits(initialHabits);
      setDailyData(initialHabits.reduce((acc, h) => ({ ...acc, [h.key]: 0 }), {}));
      setStreak(0);
      setAchievements([]);
      setTotalWater(0);
      setWeeklyData([]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map(u =>
        u.username === currentUser
          ? { ...u, habits, dailyData, streak, achievements, totalWater, weeklyData }
          : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    }
  }, [currentUser, habits, dailyData, streak, achievements, totalWater, weeklyData]);

  useEffect(() => {
    if (currentUser) {
      const mock = Array.from({ length: 7 }).map((_, i) => {
        const data: any = { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i] };
        habits.forEach(h => {
          data[h.key] = Math.floor(Math.random() * h.max * 0.8) + 2;
        });
        return data;
      });
      setWeeklyData(mock);

      const timer = setTimeout(() => {
        if (Object.values(dailyData).some(val => val === 0)) {
          setReminder('Don’t forget to log your habits today! 📋');
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [habits, dailyData, currentUser]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogin = (username: string, password: string) => {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(username);
      setShowLogin(false);
      setReminder(`Welcome back, ${username}! 🎉`);
    } else {
      setReminder('Invalid username or password.');
    }
  };

  const handleSignup = (username: string, password: string) => {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(u => u.username === username)) {
      setReminder('Username already exists.');
      return;
    }
    if (!username || !password) {
      setReminder('Please fill all fields.');
      return;
    }
    const newUser: User = {
      username,
      password,
      habits: initialHabits,
      dailyData: initialHabits.reduce((acc, h) => ({ ...acc, [h.key]: 0 }), {}),
      streak: 0,
      achievements: [],
      totalWater: 0,
      weeklyData: [],
    };
    localStorage.setItem('users', JSON.stringify([...users, newUser]));
    setCurrentUser(username);
    setShowSignup(false);
    setReminder(`Welcome, ${username}! Start tracking your habits! 🚀`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setReminder('Logged out successfully.');
  };

  const handleUpdate = (key: string, value: number) => {
    setDailyData(prev => ({ ...prev, [key]: value }));
  };

  const handleCheckIn = () => {
    const completed = Object.values(dailyData).every(val => val > 0);
    if (completed) {
      setStreak(s => {
        const newStreak = s + 1;
        if (newStreak === 3) {
          setAchievements(prev => [...prev, '3-Day Streak! 🔥']);
        }
        return newStreak;
      });
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
      setWeeklyData(prev => {
        const lastDay = prev[prev.length - 1] || {};
        const newDay = { ...lastDay, day: 'Today', ...dailyData };
        return [...prev.slice(1), newDay];
      });
    } else {
      setReminder('⛔ Please fill all habits before checking in.');
    }
  };

  const handleAddHabit = (name: string, max: number) => {
    const key = name.toLowerCase().replace(/\s/g, '_');
    const newHabit: Habit = { name, key, max };
    setHabits(prev => [...prev, newHabit]);
    setDailyData(prev => ({ ...prev, [key]: 0 }));
    setShowAddHabit(false);
  };

  const handleReset = () => {
    setDailyData(habits.reduce((acc, h) => ({ ...acc, [h.key]: 0 }), {}));
    setStreak(0);
    setTotalWater(0);
    setAchievements([]);
    setShowSettings(false);
  };

  const completionPercentage = Math.round(
    (Object.values(dailyData).reduce((sum, val) => sum + val, 0) /
      (habits.reduce((sum, h) => sum + h.max, 0) || 1)) * 100
  );

  const HabitCard = ({ habit }: { habit: Habit }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col gap-4"
    >
      <h3 className="font-semibold text-lg">{habit.name}</h3>
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

  const LoginModal = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

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
          <h3 className="text-xl font-semibold mb-4">Login</h3>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white"
          />
          <div className="flex gap-4">
            <button
              onClick={() => setShowLogin(false)}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => handleLogin(username, password)}
              disabled={!username || !password}
              className="flex-1 bg-teal-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Login
            </button>
          </div>
          <p className="mt-4 text-sm text-center">
            Don’t have an account?{' '}
            <button
              onClick={() => { setShowLogin(false); setShowSignup(true); }}
              className="text-teal-500 underline"
            >
              Sign Up
            </button>
          </p>
        </motion.div>
      </motion.div>
    );
  };

  const SignupModal = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

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
          <h3 className="text-xl font-semibold mb-4">Sign Up</h3>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white"
          />
          <div className="flex gap-4">
            <button
              onClick={() => setShowSignup(false)}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSignup(username, password)}
              disabled={!username || !password}
              className="flex-1 bg-teal-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Sign Up
            </button>
          </div>
          <p className="mt-4 text-sm text-center">
            Already have an account?{' '}
            <button
              onClick={() => { setShowSignup(false); setShowLogin(true); }}
              className="text-teal-500 underline"
            >
              Login
            </button>
          </p>
        </motion.div>
      </motion.div>
    );
  };

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
        <h3 className="text-xl font-semibold mb-4">Account Settings</h3>
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
      <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-10 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-teal-500">HabitTracker</h1>
        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <span className="text-sm font-medium">{currentUser}</span>
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-white font-semibold">
                {currentUser[0].toUpperCase()}
              </div>
              <button onClick={toggleDarkMode} className="p-2 rounded-full text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-full flex items-center gap-2"
              >
                <CogIcon className="w-5 h-5" /> Account
              </button>
              <button onClick={handleLogout} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <ArrowRightOnRectangleIcon className="w-6 h-6" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowLogin(true)}
                className="bg-teal-500 text-white px-4 py-2 rounded-full flex items-center gap-2"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" /> Login
              </button>
              <button
                onClick={() => setShowSignup(true)}
                className="bg-indigo-500 text-white px-4 py-2 rounded-full flex items-center gap-2"
              >
                <UserPlusIcon className="w-5 h-5" /> Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      {currentUser ? (
        <>
          <section className="text-center py-12 px-6 bg-gradient-to-r from-teal-100 to-indigo-100 dark:from-teal-900 dark:to-indigo-900">
            <motion.h2
              className="text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Welcome, {currentUser}! 🚀
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

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {habits.map(habit => (
              <HabitCard key={habit.key} habit={habit} />
            ))}
          </section>

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
        </>
      ) : (
        <section className="text-center py-12 px-6">
          <motion.h2
            className="text-3xl font-bold mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Please Log In or Sign Up
          </motion.h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Track your habits and build streaks by creating an account!
          </p>
          <div className="flex gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setShowLogin(true)}
              className="bg-teal-500 text-white px-6 py-2 rounded-full flex items-center gap-2"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" /> Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setShowSignup(true)}
              className="bg-indigo-500 text-white px-4 py-2 rounded-full flex items-center gap-2"
            >
              <UserPlusIcon className="w-5 h-5" /> Sign Up
            </motion.button>
          </div>
        </section>
      )}

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

      <AnimatePresence>
        {showSettings && <SettingsModal />}
        {showAddHabit && <AddHabitModal />}
        {showLogin && <LoginModal />}
        {showSignup && <SignupModal />}
      </AnimatePresence>

      <footer className="text-center text-sm text-gray-500 dark:text-gray-400 py-6">
        Built by Harshit Gupta · © 2025
      </footer>
    </div>
  );
};

export default HabitTracker;