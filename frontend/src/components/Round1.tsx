import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Question } from '../data/questions';
import { Terminal, ShieldAlert, Crosshair, Clock, AlertTriangle, Power, Cpu, Database, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TacticalBackground from './TacticalBackground';
import api from '../api/axios';

const TypewriterText = ({ text, onComplete, speed = 45 }: { text: string, onComplete?: () => void, speed?: number }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  // Keep a mutable ref to the latest onComplete to avoid re-running the typing effect
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  
  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    setIsTyping(true);
    
    const timer = setInterval(() => {
      if (i < text.length) {
        // Use substring instead of appending to prev to prevent double-typing in StrictMode
        setDisplayedText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
        if (onCompleteRef.current) onCompleteRef.current();
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span className="whitespace-pre-wrap">
      {displayedText}
      <span className={`inline-block w-3 h-5 bg-[#39ff14] align-middle ml-1 ${!isTyping ? 'animate-pulse' : ''}`}></span>
    </span>
  );
};

// Decorative HUD Corners Component
const HudCorners = () => (
  <>
    <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#39ff14] opacity-70"></div>
    <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#39ff14] opacity-70"></div>
    <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-[#39ff14] opacity-70"></div>
    <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#39ff14] opacity-70"></div>
    
    {/* Camera Recording Indicator */}
    <div className="absolute top-4 right-6 flex items-center gap-2 opacity-80">
      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.8)]"></div>
      <span className="text-red-500 text-xs font-bold tracking-widest">REC</span>
    </div>

    {/* Camera ID */}
    <div className="absolute bottom-4 left-6 opacity-60">
      <span className="text-[#39ff14] text-xs font-bold tracking-widest">CAM-04 // SAT-LINK SECURE</span>
    </div>
  </>
);

export default function Round1() {
  const [hasStarted, setHasStarted] = useState(() => {
    try {
      return sessionStorage.getItem('hasSeenBriefing_v2') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [showBriefing, setShowBriefing] = useState(() => {
    try {
      return sessionStorage.getItem('hasSeenBriefing_v2') !== 'true';
    } catch (e) {
      return true;
    }
  });
  const [briefingFinished, setBriefingFinished] = useState(false);
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [level, setLevel] = useState(1);
  const [points, setPoints] = useState(0);
  const [correctInLevel, setCorrectInLevel] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState(60);
  const [totalTime, setTotalTime] = useState(3600); // 1 hour
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answerInput, setAnswerInput] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [questionsByLevel, setQuestionsByLevel] = useState<{ [key: number]: Question[] }>({});
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set<number>>(new Set());

  // Create or get session when game starts
  const initializeSession = useCallback(async () => {
    try {
      const teamName = localStorage.getItem('teamName');
      if (!teamName) {
        window.location.href = '/';
        return;
      }

      const response = await api.post('/game/session', {
        teamName,
        roundKey: 'round1'
      });

      const session = response.data;
      setSessionId(session._id);
      setLevel(session.currentLevel);
      setPoints(session.totalPoints);
      setCorrectInLevel(session.correctInLevel);
      setConsecutiveWrong(session.consecutiveWrong);
      setTotalTime(session.timeRemaining);
      
      // Mark already answered questions
      const answeredIds = new Set<number>(session.answeredQuestions.map((q: any) => q.questionId));
      setAnsweredQuestionIds(answeredIds);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  }, []);

  // Fetch all questions for a specific level from backend
  const fetchQuestionsForLevel = useCallback(async (targetLevel: number) => {
    try {
      const response = await api.get(`/questions/by-level?level=${targetLevel}&roundKey=round1`);
      const questions = response.data;
      
      if (questions.length > 0) {
        setQuestionsByLevel(prev => ({ ...prev, [targetLevel]: questions }));
        return questions;
      }
      
      // If no questions for this level, try to find max available level
      const allQuestionsResponse = await api.get('/admin/questions');
      const allQuestions = allQuestionsResponse.data;
      const round1Questions = allQuestions.filter((q: any) => (q.roundKey || 'round1') === 'round1');
      const maxLevel = Math.max(...round1Questions.map((q: any) => q.level));
      
      if (targetLevel > maxLevel) {
        return fetchQuestionsForLevel(maxLevel);
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      return [];
    }
  }, []);

  const pickQuestion = useCallback(async (targetLevel: number) => {
    // Check if we already have questions for this level cached
    let available = questionsByLevel[targetLevel];
    
    // If not cached, fetch from backend
    if (!available || available.length === 0) {
      available = await fetchQuestionsForLevel(targetLevel);
    }
    
    if (available && available.length > 0) {
      // Filter out already answered questions in this session
      const unanswered = available.filter(q => !answeredQuestionIds.has(q.id));
      
      // If all questions answered, allow repeating
      const questionPool = unanswered.length > 0 ? unanswered : available;
      
      // Randomly pick one question
      const randomQ = questionPool[Math.floor(Math.random() * questionPool.length)];
      
      setCurrentQuestion(randomQ);
      setTimeLeft(60);
      setAnswerInput('');
      setSelectedOption('');
      setFeedback(null);
    } else {
      console.error('No questions available for level', targetLevel);
    }
  }, [questionsByLevel, fetchQuestionsForLevel, answeredQuestionIds]);

  useEffect(() => {
    if (hasStarted && !sessionId) {
      initializeSession();
    }
  }, [hasStarted, sessionId, initializeSession]);

  useEffect(() => {
    if (hasStarted && sessionId) {
      pickQuestion(level);
    }
  }, [hasStarted, sessionId, level, pickQuestion]);

  // Timer effect
  useEffect(() => {
    if (!hasStarted || gameOver || feedback || showQuitModal) return;

    const timer = setInterval(() => {
      setTotalTime(prev => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });

      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, gameOver, feedback, showQuitModal, level]);

  const handleTimeout = () => {
    setFeedback({ message: 'CONNECTION TIMEOUT: DEFENSE MEASURE RECONFIGURED', type: 'warning' });
    setTimeout(() => {
      pickQuestion(level);
    }, 2000);
  };

  const checkAnswer = (q: Question, ans: string) => {
    if (q.type === 'mcq') return ans === q.correct;
    const normalize = (s: string) => s.replace(/\s+/g, '').replace(/;$/, '').toLowerCase();
    return normalize(ans) === normalize(q.correct);
  };

  const handleSubmit = async () => {
    if (!currentQuestion || feedback || !sessionId) return;

    const ans = currentQuestion.type === 'mcq' ? selectedOption : answerInput;
    if (!ans) return;

    const isCorrect = checkAnswer(currentQuestion, ans);

    try {
      // Submit answer to backend
      const response = await api.post(`/game/session/${sessionId}/answer`, {
        questionId: currentQuestion.id,
        answer: ans,
        isCorrect
      });

      const updatedSession = response.data;
      
      // Update local state from server response
      setPoints(updatedSession.totalPoints);
      setCorrectInLevel(updatedSession.correctInLevel);
      setConsecutiveWrong(updatedSession.consecutiveWrong);
      
      // Mark this question as answered
      setAnsweredQuestionIds(prev => new Set([...prev, currentQuestion.id]));

      if (isCorrect) {
        if (updatedSession.currentLevel > level) {
          // Level up
          const nextLevel = updatedSession.currentLevel;
          setLevel(nextLevel);
          setFeedback({ message: `FIREWALL BREACHED: LEVEL ${nextLevel} UNLOCKED`, type: 'success' });
          setTimeout(() => pickQuestion(nextLevel), 2000);
        } else {
          setFeedback({ message: 'NODE COMPROMISED: CORRECT', type: 'success' });
          setTimeout(() => pickQuestion(level), 1500);
        }
      } else {
        if (updatedSession.currentLevel < level) {
          // Level down
          const nextLevel = updatedSession.currentLevel;
          setLevel(nextLevel);
          setFeedback({ message: 'SECURITY TRIGGERED: ACCESS DOWNGRADED', type: 'error' });
          setTimeout(() => pickQuestion(nextLevel), 2500);
        } else {
          setFeedback({ message: `ACCESS DENIED: INCORRECT (${updatedSession.consecutiveWrong}/2 STRIKES)`, type: 'error' });
          setTimeout(() => pickQuestion(level), 2000);
        }
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      setFeedback({ message: 'CONNECTION ERROR: RETRY', type: 'error' });
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const briefingText = `> SATELLITE UPLINK ESTABLISHED...
> TASK FORCE 141 COMMAND NETWORK ONLINE.
> ENCRYPTION KEY ACCEPTED.

> "The world is on the brink. We don't have the luxury of choosing our battles anymore." — Captain Price

> MISSION BRIEFING: OPERATION CODEX (ROUND 1)
> TARGET: VLADIMIR MAKAROV'S PERSONAL MAINFRAME

> SITUATION REPORT:
> Makarov has placed 10 security hurdles between you and him.
> Every hurdle you cross brings you one step closer — and prepares
> you for the final battle ahead. Answer questions to breach his defenses.

> OPERATION PARAMETERS:
  * TIME LIMIT    : 60 Minutes total
  * QUESTION TIME : 60 Seconds per question
  * TOTAL LEVELS  : 10 hurdles to reach Makarov

> RULES OF ENGAGEMENT:
  * LEVEL UP    : To clear Level N, you must answer N questions correctly.
                  Level 1 = 1 correct | Level 2 = 2 correct | Level 3 = 3 correct
                  ...and so on up to Level 10 = 10 correct answers.
  * DEMOTION    : 2 consecutive wrong answers OR 2 consecutive timeouts
                  will demote you back 1 level. Stay sharp.
  * TIMEOUT     : If the timer runs out, it counts as a wrong answer.

> LEADERBOARD RANKING:
  * PRIMARY   : Highest level reached wins.
  * TIEBREAK  : If two teams reach the same level, the team that got
                there first is ranked higher.
  * SECONDARY : Total points scored across all answers.

> Each hurdle you clear sharpens your skills for the battle to come.
> Think fast. Answer faster. Reach Makarov before anyone else.
> "Bravo Six, going dark."`;

  // Briefing Screen
  if (showBriefing) {
    return (
      <div className="min-h-screen bg-[#020502] text-[#39ff14] font-mono flex items-center justify-center p-2 md:p-4 scanlines crt-flicker relative overflow-hidden">
        <TacticalBackground />
        <div className="z-10 max-w-3xl w-full bg-black/70 backdrop-blur-md p-6 md:p-8 relative shadow-[0_0_50px_rgba(57,255,20,0.15)] max-h-[90vh] flex flex-col">
          <HudCorners />
          <div className="flex items-center gap-3 mb-4 border-b border-[#39ff14]/50 pb-3 shrink-0">
            <Target className="w-8 h-8 text-[#39ff14] animate-pulse" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-widest text-glow">CLASS WARS: ROUND 1</h1>
          </div>
          
          <div className="text-sm md:text-base leading-relaxed space-y-4 flex-grow overflow-y-auto font-bold pr-2">
            <TypewriterText 
              text={briefingText} 
              speed={20}
              onComplete={() => setBriefingFinished(true)}
            />
          </div>

          <div className="mt-6 flex justify-end h-12 shrink-0">
            {briefingFinished && (
              <motion.button 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => { 
                  setShowBriefing(false); 
                  setHasStarted(true); 
                  try {
                    sessionStorage.setItem('hasSeenBriefing_v2', 'true');
                  } catch (e) {}
                }}
                className="px-6 py-2 bg-[#001a00] border-2 border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14] hover:text-black transition-all duration-200 uppercase tracking-widest font-bold flex items-center gap-2 group shadow-[0_0_15px_rgba(57,255,20,0.3)] hover:shadow-[0_0_25px_rgba(57,255,20,0.8)]"
              >
                <Cpu className="w-5 h-5 group-hover:animate-spin" />
                [ INITIATE BREACH ]
              </motion.button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (gameOver) {
    // End session if not already ended
    if (sessionId) {
      api.post(`/game/session/${sessionId}/end`).catch(err => console.error('Failed to end session:', err));
    }

    return (
      <div className="min-h-screen bg-[#020502] text-[#39ff14] font-mono flex items-center justify-center p-4 scanlines crt-flicker relative">
        <TacticalBackground />
        <div className="z-10 max-w-2xl w-full bg-black/80 backdrop-blur-md p-12 text-center relative">
          <HudCorners />
          <ShieldAlert className="w-24 h-24 mx-auto mb-6 text-[#39ff14]" />
          <h1 className="text-5xl font-bold mb-4 tracking-widest text-glow">OPERATION CONCLUDED</h1>
          <div className="space-y-4 text-2xl mb-8 text-left bg-[#001100] p-6 border border-[#39ff14]/50">
            <p className="flex justify-between"><span>FINAL CLEARANCE LEVEL:</span> <span className="text-white text-glow">{level}</span></p>
            <p className="flex justify-between"><span>TOTAL INTEL EXTRACTED:</span> <span className="text-white text-glow">{points} PTS</span></p>
            <p className="flex justify-between"><span>TIME ELAPSED:</span> <span className="text-white">{formatTime(3600 - totalTime)}</span></p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => {
                try {
                  sessionStorage.removeItem('hasSeenBriefing_v2');
                } catch (e) {}
                window.location.href = '/competition/round1';
              }}
              className="px-8 py-4 bg-black border-2 border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14] hover:text-black transition-all duration-300 uppercase tracking-widest font-bold"
            >
              [ RESTART TERMINAL ]
            </button>
            <button 
              onClick={() => {
                window.location.href = '/competition';
              }}
              className="px-8 py-4 bg-black border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-black transition-all duration-300 uppercase tracking-widest font-bold"
            >
              [ RETURN TO LOBBY ]
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020502] text-[#39ff14] font-mono p-2 md:p-4 flex flex-col items-center justify-center scanlines crt-flicker relative overflow-hidden">
      <TacticalBackground />
      
      {/* Main HUD Container */}
      <div className="z-10 w-full max-w-5xl bg-black/75 backdrop-blur-sm flex flex-col h-[95vh] relative shadow-[0_0_40px_rgba(57,255,20,0.1)] border border-[#39ff14]/20">
        <HudCorners />
        
        {/* Top Bar */}
        <div className="bg-[#001a00]/80 border-b border-[#39ff14]/50 p-3 md:p-4 flex flex-wrap justify-between items-center gap-4 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-[#39ff14] animate-pulse" />
            <div>
              <h1 className="text-xl font-bold tracking-widest text-glow">CLASS WARS: ROUND 1</h1>
              <p className="text-xs text-[#39ff14]/70 tracking-[0.2em]">
                OPERATIVE: {localStorage.getItem('teamName')?.toUpperCase() || 'UNKNOWN'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => {
                setShowBriefing(true);
                setBriefingFinished(true); // Instantly show the start button if they reopen it
              }}
              className="hidden md:block px-3 py-1 border border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14] hover:text-black transition-colors text-xs tracking-widest"
            >
              [ VIEW BRIEFING ]
            </button>
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-[#39ff14]/70 uppercase tracking-widest">Global Uplink</span>
              <span className="text-xl font-bold flex items-center gap-2 text-glow">
                <Clock className="w-4 h-4" /> {formatTime(totalTime)}
              </span>
            </div>
            <button 
              onClick={() => setShowQuitModal(true)}
              className="p-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-black transition-colors shadow-[0_0_10px_rgba(255,0,0,0.2)]"
              title="Disconnect"
            >
              <Power className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Telemetry / Status Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-[#39ff14]/50 bg-[#000a00]/90 text-xs z-10 shrink-0">
          <div className="p-2 border-r border-b md:border-b-0 border-[#39ff14]/50 flex flex-col justify-center items-center">
            <span className="text-[#39ff14]/70 tracking-widest mb-1">SECURITY LEVEL</span>
            <span className="text-2xl font-bold text-white text-glow">[{level}]</span>
          </div>
          <div className="p-2 border-r border-b md:border-b-0 border-[#39ff14]/50 flex flex-col justify-center items-center">
            <span className="text-[#39ff14]/70 tracking-widest mb-1">INTEL POINTS</span>
            <span className="text-2xl font-bold text-[#39ff14]">{points}</span>
          </div>
          <div className="p-2 border-r border-[#39ff14]/50 flex flex-col justify-center items-center">
            <span className="text-[#39ff14]/70 tracking-widest mb-1">LEVEL PROGRESS</span>
            <span className="text-2xl font-bold text-[#39ff14]">{correctInLevel} / {level}</span>
          </div>
          <div className="p-2 flex flex-col justify-center items-center">
            <span className="text-red-500/70 tracking-widest mb-1">FAIL STRIKES</span>
            <span className="text-2xl font-bold text-red-500 text-glow-red">{consecutiveWrong} / 2</span>
          </div>
        </div>

        {/* Main Interface */}
        <div className="p-4 md:p-6 flex-grow relative flex flex-col z-10 overflow-y-auto">
          
          {/* Local Timer */}
          <div className="absolute top-4 right-6 flex items-center gap-2 z-20">
            <span className="text-xs tracking-widest text-[#39ff14]/70 hidden md:inline">NODE TIMEOUT</span>
            <span className={`text-2xl md:text-3xl font-bold font-mono ${timeLeft <= 10 ? 'text-red-500 animate-pulse text-glow-red' : 'text-[#39ff14] text-glow'}`}>
              00:{timeLeft.toString().padStart(2, '0')}
            </span>
          </div>

          {currentQuestion && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={currentQuestion.id}
              className="max-w-4xl w-full mx-auto mt-8 md:mt-4 flex-grow flex flex-col"
            >
              <div className="text-xs text-[#39ff14]/80 mb-3 tracking-widest flex items-center gap-2 bg-[#001a00] w-fit px-3 py-1 border border-[#39ff14]/30">
                <span className="w-1.5 h-1.5 bg-[#39ff14] animate-pulse"></span>
                INCOMING ENCRYPTED HURDLE // TYPE: {currentQuestion.type.toUpperCase()}
              </div>
              
              <h2 className="text-lg md:text-xl leading-relaxed text-white mb-4 font-bold">
                <span className="text-[#39ff14]/50 mr-2">{'>'}</span>
                {currentQuestion.text}
              </h2>

              {currentQuestion.code && (
                <div className="relative mb-4">
                  <div className="absolute top-0 left-0 w-full h-full bg-[#001100]/50 pointer-events-none"></div>
                  <pre className="border-l-4 border-[#39ff14] p-3 md:p-4 text-[#39ff14] overflow-x-auto text-sm md:text-base shadow-[inset_0_0_20px_rgba(57,255,20,0.05)] bg-[#000500]/80 max-h-[35vh] overflow-y-auto">
                    {currentQuestion.code}
                  </pre>
                </div>
              )}

              {/* Input Section */}
              <div className="mt-auto pt-4">
                {currentQuestion.type === 'mcq' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {currentQuestion.options?.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedOption(opt)}
                        className={`p-3 md:p-4 text-left border-2 transition-all duration-200 font-mono text-sm md:text-base ${
                          selectedOption === opt 
                            ? 'bg-[#39ff14] border-[#39ff14] text-black shadow-[0_0_20px_rgba(57,255,20,0.6)] font-bold' 
                            : 'bg-black/60 border-[#39ff14]/40 text-[#39ff14] hover:border-[#39ff14] hover:bg-[#001a00]'
                        }`}
                      >
                        <span className={selectedOption === opt ? 'text-black mr-2' : 'text-[#39ff14]/60 mr-2'}>[{idx + 1}]</span> 
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center bg-black/60 border-2 border-[#39ff14]/50 focus-within:border-[#39ff14] focus-within:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all p-3 md:p-4">
                    <span className="text-[#39ff14] mr-3 hidden md:inline text-base md:text-lg">root@classwars:~$</span>
                    <span className="text-[#39ff14] mr-3 md:hidden text-base md:text-lg">{'>'}</span>
                    <input
                      type="text"
                      value={answerInput}
                      onChange={(e) => setAnswerInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                      placeholder={currentQuestion.type === 'code' ? "enter correction syntax..." : "enter decryption key..."}
                      className="w-full bg-transparent text-lg md:text-xl text-white outline-none placeholder:text-[#39ff14]/30"
                      autoFocus
                      autoComplete="off"
                      spellCheck="false"
                    />
                    <span className="w-3 h-6 bg-[#39ff14] animate-pulse ml-2"></span>
                  </div>
                )}

                <div className="mt-6 flex justify-between items-center">
                  <div className="text-xs md:text-sm text-[#39ff14]/70 animate-pulse tracking-widest">
                    AWAITING INPUT...
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!!feedback || (currentQuestion.type === 'mcq' ? !selectedOption : !answerInput)}
                    className="px-6 py-3 md:px-8 md:py-3 bg-[#001a00] border-2 border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14] hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 uppercase tracking-widest font-bold flex items-center gap-2 text-sm md:text-base shadow-[0_0_15px_rgba(57,255,20,0.2)]"
                  >
                    <Crosshair className="w-5 h-5" /> [ EXECUTE ]
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Feedback Overlay */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-30"
              >
                <div className={`p-10 border-2 text-center max-w-2xl w-full relative ${
                  feedback.type === 'success' ? 'border-[#39ff14] bg-[#001100]/90 text-[#39ff14] shadow-[0_0_50px_rgba(57,255,20,0.2)]' : 
                  feedback.type === 'error' ? 'border-red-500 bg-[#110000]/90 text-red-500 shadow-[0_0_50px_rgba(255,0,0,0.2)]' :
                  'border-yellow-500 bg-[#111100]/90 text-yellow-500 shadow-[0_0_50px_rgba(255,255,0,0.2)]'
                }`}>
                  <HudCorners />
                  <h2 className={`text-3xl md:text-4xl font-bold tracking-widest mb-4 ${
                    feedback.type === 'success' ? 'text-glow' : 
                    feedback.type === 'error' ? 'text-glow-red' : ''
                  }`}>
                    {feedback.message}
                  </h2>
                  <div className="mt-6 text-lg opacity-80 tracking-widest">
                    {feedback.type === 'success' ? 'PROCEEDING TO NEXT NODE...' : 'RECALCULATING ROUTE...'}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quit Modal */}
      <AnimatePresence>
        {showQuitModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4"
          >
            <div className="max-w-xl w-full border-2 border-red-500 bg-[#0a0000] p-12 text-center shadow-[0_0_80px_rgba(239,68,68,0.3)] relative">
              <HudCorners />
              <AlertTriangle className="w-20 h-20 mx-auto text-red-500 mb-8 animate-pulse" />
              <h2 className="text-4xl font-bold text-red-500 mb-6 tracking-widest text-glow-red">SEVER CONNECTION?</h2>
              <p className="text-red-400/90 mb-12 text-xl leading-relaxed">Warning: Disconnecting now will wipe all extracted intel and reset your clearance level.</p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button 
                  onClick={async () => {
                    if (sessionId) {
                      try {
                        await api.post(`/game/session/${sessionId}/end`);
                      } catch (err) {
                        console.error('Failed to end session:', err);
                      }
                    }
                    setGameOver(true);
                  }}
                  className="px-8 py-4 bg-black border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-black transition-colors uppercase tracking-widest font-bold text-lg"
                >
                  [ CONFIRM DISCONNECT ]
                </button>
                <button 
                  onClick={() => setShowQuitModal(false)}
                  className="px-8 py-4 bg-black border-2 border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14] hover:text-black transition-colors uppercase tracking-widest font-bold text-lg"
                >
                  [ CANCEL ]
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
