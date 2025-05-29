import React, { useState, useEffect, useRef, useCallback } from 'react'; // Import useCallback

const GetLocal = (item) => localStorage.getItem(item);

export default function App() {
  const [workMinutes, setWorkMinutes] = useState( GetLocal("workMinutes") == "NaN" ? 20 : GetLocal("workMinutes") < 0 ? 20 : !GetLocal("workMinutes") ? 20 : GetLocal("workMinutes")); // Corresponds to intervalMinutes
  const [relaxSeconds, setRelaxSeconds] = useState(GetLocal("relaxSeconds") == "NaN" ? 20 : GetLocal("relaxSeconds") < 0 ? 20 : !GetLocal("relaxSeconds")  ? 20 : GetLocal("relaxSeconds")); // Corresponds to relaxDurationSeconds
  const [distanceFeet, setDistanceFeet] = useState(20); // For the 20-20-20 rule relax message
  const [alertType, setAlertType] = useState('sound'); // State for alert type ('sound', 'visual')
  const [activeTab, setActiveTab] = useState('work');
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60); // Time left for current active tab
  const [timerMode, setTimerMode] = useState(GetLocal("timermode") || "manual"); // State for timer mode ('manual' or 'automate')
  const [workCount, setWorkCount] = useState(GetLocal("workcount") || 0);
  const [relaxCount, setRelaxCount] = useState(GetLocal("relaxcount") || 0); // Changed from breakCount
  const intervalRef = useRef(null);
  const relaxSoundRef = useRef(new Audio('/alarm.mp3')); // Reference to the relax sound file, changed from breakSoundRef
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const settingsModalRef = useRef(null); // Ref for the settings modal to handle clicks outside

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the modal is shown and the click is outside the modal content
      if (settingsModalRef.current && !settingsModalRef.current.contains(event.target)) {
        setShowSettingsModal(false);
      }
    };

    // Add event listener when the modal is shown
    if (showSettingsModal) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      // Remove event listener when the modal is hidden
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Cleanup function to remove event listener when the component unmounts or modal visibility changes
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsModal]);

  // Handler for starting/pausing the timer
  const handleStartPause = () => {
    setTimerRunning((prev) => !prev);
  };

  // Effect hook to update timeLeft when activeTab or customization settings change
  useEffect(() => {
    if (!timerMode) localStorage.setItem("timermode", "manual");
    if(!workMinutes) localStorage.setItem("workMinutes", "20") // Ensure string for consistency
    if(!relaxSeconds) localStorage.setItem("relaxSeconds", "20") // Ensure string for consistency, changed from breakSeconds

    let newTime = 0;
    if (activeTab === 'work') {
      newTime = parseInt(workMinutes) * 60;
    } else if (activeTab === 'relax') { // Changed from 'break'
      newTime = parseInt(relaxSeconds); // Changed from breakSeconds
    }
    setTimeLeft(newTime);
    setTimerRunning(false); // Stop timer when tab changes
    clearInterval(intervalRef.current); // Clear any running interval
  }, [activeTab, workMinutes, relaxSeconds]); // Changed from breakSeconds

  // Memoize triggerAlert using useCallback
  const triggerAlert = useCallback(() => {
    if (alertType === 'sound') {
      relaxSoundRef.current.play().catch(e => console.error("Error playing sound:", e)); // Changed from breakSoundRef
    }
  }, [alertType]);

  useEffect(() => {
      document.title = `${formatTime(timeLeft)} - ${activeTab === 'work' ? 'Work' : 'Relax'} time`; // Changed from 'Break'
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
            localStorage.setItem("workcount", (Number(workCount) + 1).toString()); // Ensure string
            setWorkCount(GetLocal("workcount"));
          } else { // Assumes 'relax' tab
            localStorage.setItem("relaxcount", (Number(relaxCount) + 1).toString()); // Changed from breakcount, ensure string
            setRelaxCount(GetLocal("relaxcount")); // Changed from breakcount
          }
          setActiveTab(activeTab === 'work' ? 'relax' : 'work'); // Changed from 'break'
          if (timerMode === 'automate') {
            setTimeout(() => {
              setTimerRunning(true);
            }, 50);
          } else {
            setTimerRunning(false); // Stop timer in manual mode
          }
          return 0; // This will be reset by the other useEffect when activeTab changes
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [timerRunning, workMinutes, relaxSeconds, timerMode, activeTab, triggerAlert, workCount, relaxCount]); // Added dependencies, changed breakSeconds to relaxSeconds

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
    // Recalculate time based on current activeTab and its settings
    // This part was a bit off in the original, ensuring it resets to work time.
    setTimeLeft(parseInt(workMinutes) * 60); 
    localStorage.setItem("workcount", "0")
    setWorkCount(0); // Reset counts on manual reset
    localStorage.setItem("relaxcount", "0") // Changed from breakcount
    setRelaxCount(0); // Reset counts on manual reset, changed from breakCount
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
            onClick={() => { 
              const newMode = timerMode === 'manual' ? 'automate' : 'manual';
              setTimerMode(newMode); 
              localStorage.setItem("timermode", newMode); 
            }}
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
            className={`timer-tab-button ${activeTab === 'relax' ? 'active' : ''}`} // Changed from 'break'
            onClick={() => setActiveTab('relax')} // Changed from 'break'
          >
            Relax 
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
          {activeTab === 'work' ? `Working time` : `Time for a relax!`} {/* Changed from 'break' */}
          {activeTab === 'relax' && ` Look at something ${distanceFeet} feet away.`} {/* Changed from 'break' */}
        </div>
      </div>

      {/* Session Counts Display */}
      <div className="session-counts">
        <div>
          Work {workCount} | {relaxCount} Relax {/* Changed from breakCount and 'Break' */}
        </div>
        <button onClick={() => handleReset()} className='reset-btn'>Reset all</button>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="settings-modal-overlay">
          <div className="settings-modal-content" ref={settingsModalRef}>
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
                  onChange={(e) => { setWorkMinutes(Math.max(1, parseInt(e.target.value) || 1).toString()); localStorage.setItem("workMinutes", Math.max(1, parseInt(e.target.value) || 1).toString()); }} // Ensure string
                  min="1" // Changed from 0 to 1 as per typical timer logic
                />
              </div>
              <div className="settings-item">
                <label htmlFor="relax-seconds">Relax (seconds)</label> {/* Changed from break-seconds and 'Break' */}
                <input
                  type="number"
                  id="relax-seconds" // Changed from break-seconds
                  value={relaxSeconds} // Changed from breakSeconds
                  onChange={(e) => {setRelaxSeconds(Math.max(1, parseInt(e.target.value) || 1).toString()); localStorage.setItem("relaxSeconds", Math.max(1, parseInt(e.target.value) || 1).toString());}} // Changed from breakSeconds, ensure string
                  min="1" // Changed from 0 to 1
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
            {/* Removed the save button from here as it wasn't in the original user-provided code for this modal */}
          </div>
        </div>
      )}
    </div>
  );
}
