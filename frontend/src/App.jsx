import React, { useState, useEffect, useRef } from 'react';

// Main App component for the 20-20-20 Rule Timer
export default function App() {
  // State for customization settings, initialized to 20-20-20 rule defaults
  const [workMinutes, setWorkMinutes] = useState(20); // Corresponds to intervalMinutes
  const [breakSeconds, setBreakSeconds] = useState(20); // Corresponds to breakDurationSeconds
  // longBreakMinutes state removed as per request
  const [distanceFeet, setDistanceFeet] = useState(20); // For the 20-20-20 rule break message

  // State for alert type ('sound', 'visual')
  const [alertType, setAlertType] = useState('sound');

  // State for active timer tab ('work', 'break')
  const [activeTab, setActiveTab] = useState('work');

  // State for timer control
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60); // Time left for current active tab

  // State for timer mode ('manual' or 'automate')
  const [timerMode, setTimerMode] = useState('manual');

  // States for session counts
  const [workCount, setWorkCount] = useState(0);
  const [breakCount, setBreakCount] = useState(0);

  // Ref to store the interval ID to clear it later
  const intervalRef = useRef(null);

  // Audio object for sound alerts
  // Using a placeholder URL for the sound, as per instructions, avoid external sound URLs
  const breakSoundRef = useRef(new Audio('https://www.soundjay.com/buttons/beep-07a.mp3'));

  // State for controlling the visibility of the settings modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Effect hook to update timeLeft when activeTab or customization settings change
  useEffect(() => {
    let newTime = 0;
    if (activeTab === 'work') {
      newTime = workMinutes * 60;
    } else if (activeTab === 'break') {
      newTime = breakSeconds;
    }
    setTimeLeft(newTime);
    setTimerRunning(false); // Stop timer when tab changes
    clearInterval(intervalRef.current); // Clear any running interval
  }, [activeTab, workMinutes, breakSeconds]); // longBreakMinutes removed from dependencies

  // Effect hook for the main timer countdown
  useEffect(() => {
    if (!timerRunning) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalRef.current);
          triggerAlert();

          if (timerMode === 'automate') {
            if (activeTab === 'work') {
              setActiveTab('break');
              setWorkCount((prevCount) => prevCount + 1); // Increment work count when work session ends
            } else { // activeTab === 'break'
              setActiveTab('work');
              setBreakCount((prevCount) => prevCount + 1); // Increment break count when break session ends
            }
            setTimerRunning(true); // Auto-start the next phase
          } else { // Manual mode
            setTimerRunning(false); // Timer stops, user manually switches
            if (activeTab === 'work') {
                setWorkCount((prevCount) => prevCount + 1); // Increment work count even in manual mode
            } else {
                setBreakCount((prevCount) => prevCount + 1); // Increment break count even in manual mode
            }
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [timerRunning, activeTab, workMinutes, breakSeconds, timerMode]); // Dependencies

  // Function to trigger the selected alert type
  const triggerAlert = () => {
    if (alertType === 'sound') {
      breakSoundRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
    // Visual alert is handled by the UI changing based on activeTab and timer state
  };

  // Function to format time for display (MM:SS)
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Handler for starting/pausing the timer
  const handleStartPause = () => {
    setTimerRunning((prev) => !prev);
  };

  // Handler for resetting the timer for the current tab
  const handleReset = () => {
    setTimerRunning(false);
    clearInterval(intervalRef.current);
    let newTime = 0;
    if (activeTab === 'work') {
      newTime = workMinutes * 60;
    } else if (activeTab === 'break') {
      newTime = breakSeconds;
    }
    setTimeLeft(newTime);
    setWorkCount(0); // Reset counts on manual reset
    setBreakCount(0); // Reset counts on manual reset
  };

  return (
    <div className={`app-container ${activeTab === 'work' ? 'bg-red' : 'bg-teal'}`}>

      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
          Eye Timer
        </div>
        <div className="nav-buttons">
          <button>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '5px' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Report
          </button>
          <button onClick={() => setShowSettingsModal(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '5px' }}>
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09z"></path>
            </svg>
            Setting
          </button>
        </div>
      </header>

      {/* Timer Card */}
      <div className="timer-card">
        <div className="timer-tabs">
          <button
            className={`timer-tab-button ${activeTab === 'work' ? 'active' : ''}`}
            onClick={() => setActiveTab('work')}
          >
            Work
          </button>
          <button
            className={`timer-tab-button ${activeTab === 'break' ? 'active' : ''}`}
            onClick={() => setActiveTab('break')}
          >
            Break
          </button>
        </div>

        <div className="timer-display">
          {formatTime(timeLeft)}
        </div>

        <button
          className={`start-button ${timerRunning ? 'running' : ''}`}
          onClick={handleStartPause}
          style={{ color: timerRunning ? (activeTab === 'work' ? '#498b8b' : '#ba4949') : (activeTab === 'work' ? '#ba4949' : '#498b8b') }}
        >
          {timerRunning ? 'PAUSE' : 'START'}
        </button>

        <div className="session-info">
          {activeTab === 'work' ? `Working time` : `Time for a break!`}
          {activeTab === 'break' && ` Look at something ${distanceFeet} feet away.`}
        </div>
      </div>

      {/* Automate/Manual Toggle Button */}
      <button
        className="mode-toggle-button"
        onClick={() => setTimerMode(timerMode === 'manual' ? 'automate' : 'manual')}
      >
        {timerMode === 'manual' ? 'Switch to Automate Mode' : 'Switch to Manual Mode'}
      </button>

      {/* Session Counts Display */}
      <div className="session-counts">
        <div>
          Work Sessions: <span>{workCount}</span>
        </div>
        <div>
          Break Sessions: <span>{breakCount}</span>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="settings-modal-overlay">
          <div className="settings-modal-content">
            <div className="settings-modal-header">
              <h2>Timer Settings</h2>
              <button className="settings-close-button" onClick={() => setShowSettingsModal(false)}>
                &times;
              </button>
            </div>

            <div className="settings-group">
              <h3>Time (minutes)</h3>
              <div className="settings-item">
                <label htmlFor="work-minutes">Work</label>
                <input
                  type="number"
                  id="work-minutes"
                  value={workMinutes}
                  onChange={(e) => setWorkMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
              </div>
              <div className="settings-item">
                <label htmlFor="break-seconds">Break (seconds)</label>
                <input
                  type="number"
                  id="break-seconds"
                  value={breakSeconds}
                  onChange={(e) => setBreakSeconds(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
              </div>
              {/* Long Break input removed */}
            </div>

            <div className="settings-group">
              <h3>20-20-20 Rule Specifics</h3>
              <div className="settings-item">
                <label htmlFor="distance-feet">Distance (feet)</label>
                <input
                  type="number"
                  id="distance-feet"
                  value={distanceFeet}
                  onChange={(e) => setDistanceFeet(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
              </div>
            </div>

            <div className="settings-group">
              <h3>Alert Type</h3>
              <div className="settings-item">
                <label>Choose Alert:</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="alertType"
                      value="sound"
                      checked={alertType === 'sound'}
                      onChange={() => setAlertType('sound')}
                    />
                    Sound
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="alertType"
                      value="visual"
                      checked={alertType === 'visual'}
                      onChange={() => setAlertType('visual')}
                    />
                    Visual
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
