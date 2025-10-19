import React, { createContext, useState, useEffect } from 'react'; // Import React and required hooks

/**
 * ThemeContext manages the application's theme (light/dark mode).
 * It reads the user's saved preference, supports system preference,
 * and updates localStorage and the DOM when the theme changes.
 */

// Create context for theme management
export const ThemeContext = createContext();

// ThemeProvider component wraps the app and provides theme context
export const ThemeProvider = ({ children }) => {
  // Helper function to get initial theme from localStorage or system preference
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Check if the system prefers dark mode
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // State for current theme, initialized with user/system preference
  const [theme, setTheme] = useState(getInitialTheme);

  // Toggle between light and dark theme
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Effect: Update localStorage and document class when theme changes
  // Apply theme to <html> and localStorage whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Provide theme and toggleTheme to all children via context
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
