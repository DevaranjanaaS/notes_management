// ThemeToggle.js
import React from 'react';
import { useTheme } from './ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa'; // Optional: Import icons for better UX

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle">
      <button onClick={toggleTheme} className="toggle-btn">
        {isDarkMode ? <FaSun /> : <FaMoon />} {/* Display sun for light mode, moon for dark mode */}
        <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
      </button>
    </div>
  );
};

export default ThemeToggle;
