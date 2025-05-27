import React, { useState, useEffect, useRef, useCallback } from 'react'; // Import useCallback

export default function App() {
  const [workMinutes, setWorkMinutes] = useState(localStorage.getItem("workminutes") === "NaN" ? 20 : localStorage.getItem("workminutes") < 0 ? 20 : localStorage.getItem("workminutes")); // Corresponds to intervalMinutes
  const [breakSeconds, setBreakSeconds] = useState(localStorage.getItem("breakeseconds") === "NaN" ? 20 : localStorage.getItem("breakeseconds") < 0 ? 20 : localStorage.getItem("breakeseconds")); // Corresponds to breakDurationSeconds
  const [distanceFeet, setDistanceFeet] = useState(20); // For the 20-20-20 rule break message
  const [alertType, setAlertType] = useState('sound'); // State for alert type ('sound', 'visual')
  const [activeTab, setActiveTab] = useState('work');
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60); // Time left for current active tab
  const [timerMode, setTimerMode] = useState(localStorage.getItem("timermode")); // State for timer mode ('manual' or 'automate')
  const [workCount, setWorkCount] = useState(localStorage.getItem("workcount") || 0);
  const [breakCount, setBreakCount] = useState(localStorage.getItem("breakcount") || 0);
  const intervalRef = useRef(null);
  const breakSoundRef = useRef(new Audio('/alarm.mp3')); // Reference to the break sound file
  const [showSettingsModal, setShowSettingsModal] = useState(false);


  // Handler for starting/pausing the timer
  const handleStartPause = () => {
    setTimerRunning((prev) => !prev);
  };

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
  }, [activeTab, workMinutes, breakSeconds]);

  // Memoize triggerAlert using useCallback
  const triggerAlert = useCallback(() => {
    if (alertType === 'sound') {
      breakSoundRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
  }, [alertType]);

  useEffect(() => {
      document.title = `${formatTime(timeLeft)} - ${activeTab === 'work' ? 'Work' : 'Break'} time`;
  }, [timeLeft, timerRunning, activeTab]);

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
          // Only increment counts once here — BEFORE changing tab
          if (activeTab === 'work') {
            localStorage.setItem("workcount", Number(workCount) + Number(1))
            setWorkCount(localStorage.getItem("workcount"));
          } else {
            localStorage.setItem("breakcount", Number(breakCount) + Number(1))
            setBreakCount(localStorage.getItem("breakcount"));
          }
          setActiveTab(activeTab === 'work' ? 'break' : 'work');
          if (timerMode == 'automate') {
            handleStartPause()
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [timerRunning, workMinutes, breakSeconds, timerMode]); // Explicitly convert activeTab to String here

  // Function to format time for display (MM:SS)
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Handler for resetting the timer for the current tab
  const handleReset = () => {
    setTimerRunning(false);
    setActiveTab("work")
    clearInterval(intervalRef.current);
    let newTime = 0;
    if (activeTab === 'work') {
      newTime = workMinutes * 60;
    } else if (activeTab === 'break') {
      newTime = breakSeconds;
    }
    setTimeLeft(newTime);
    localStorage.setItem("workcount", 0)
    setWorkCount(0); // Reset counts on manual reset
    localStorage.setItem("breakcount", 0)
    setBreakCount(0); // Reset counts on manual reset
  };
  
  return (
    <div className={`app-container ${activeTab === 'work' ? 'bg-blue' : 'bg-green'}`}>

      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: 'middle', marginRight: '10px' }}>
            <circle cx="12" cy="12" r="10" fill="white" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="12" x2="12" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>Eye Timer</span>
        </div>
        <div className="nav-buttons">
          <button
            className="mode-toggle-button"
            onClick={() => { setTimerMode(timerMode === 'manual' ? 'automate' : 'manual'); localStorage.setItem("timermode", timerMode === 'manual' ? 'automate' : 'manual') } }
          >
            {timerMode === 'manual' ? 'Switch to Automate Mode' : 'Switch to Manual Mode'}
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
          className={`start-button ${activeTab == "work" ? "btn-blue" : "btn-green"} ${timerRunning ? 'running' : ''}`}
          onClick={handleStartPause}
        >
          {timerRunning ? 'PAUSE' : 'START'}
        </button>

        <div className="session-info">
          {activeTab === 'work' ? `Working time` : `Time for a break!`}
          {activeTab === 'break' && ` Look at something ${distanceFeet} feet away.`}
        </div>
      </div>

      {/* Session Counts Display */}
      <div className="session-counts">
        <div>
          Work {workCount} | {breakCount} Break
        </div>
        <button onClick={() => handleReset()} className='reset-btn'>Reset all</button>
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
              <h3>Time</h3>
              <div className="settings-item">
                <label htmlFor="work-minutes">Work (minutes)</label>
                <input
                  type="number"
                  id="work-minutes"
                  value={workMinutes}
                  onChange={(e) => { setWorkMinutes(Math.max(1, parseInt(e.target.value))); localStorage.setItem("workminutes", Math.max(1, parseInt(e.target.value))); }}
                  min={0}
                />
              </div>
              <div className="settings-item">
                <label htmlFor="break-seconds">Break (seconds)</label>
                <input
                  type="number"
                  id="break-seconds"
                  value={breakSeconds}
                  onChange={(e) => {setBreakSeconds(Math.max(1, parseInt(e.target.value))); localStorage.setItem("breakeseconds", Math.max(1, parseInt(e.target.value)));}}
                  min={0}
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
