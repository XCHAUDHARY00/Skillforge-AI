import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  Terminal, Play, Clock, 
  Trophy, Zap, Swords, Copy,
  AlertCircle, X, TrendingUp, HelpCircle, CheckCircle, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const QUESTIONS = {
  coding: {
    easy: { title: 'Two Sum Problem', desc: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', defaultCode: 'def twoSum(nums, target):\n    # Write your highly optimized code here\n    pass' },
    medium: { title: 'Merge Intervals', desc: 'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.', defaultCode: 'def merge(intervals):\n    # Write your code here\n    pass' },
    hard: { title: 'N-Queens', desc: 'The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other.', defaultCode: 'def solveNQueens(n):\n    # Write your code here\n    pass' }
  }
};

const CodingBattle = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Game States
  const [battleState, setBattleState] = useState('lobby'); // lobby, waiting, playing, finished
  const [gameMode, setGameMode] = useState('coding'); // coding, quiz
  const [difficulty, setDifficulty] = useState('easy');
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  
  // Quiz States
  const [selectedOption, setSelectedOption] = useState(null);
  const [answeredOption, setAnsweredOption] = useState(null); // locked-in answer after submitting
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [aiQuestions, setAiQuestions] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);
  const [matchStats, setMatchStats] = useState(null);
  const [quizAnswerLog, setQuizAnswerLog] = useState([]); // [{q, chosen, correct, isRight}]
  const [showingResult, setShowingResult] = useState(false); // brief result per question
  
  // Play States
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [winner, setWinner] = useState(null);
  const [opponent, setOpponent] = useState(null);
  
  const pollInterval = useRef(null);
  const isTransitioningRef = useRef(false);
  const playerId = useRef(Math.random().toString(36).substring(2, 9)).current;

  const me = {
    name: user?.user?.username || user?.username || 'You (Player 1)',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=6366f1',
    level: 42,
    xp: user?.career_xp || 2540,
    color: '#6366f1'
  };

  const getApiUrl = () => {
    const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/';
    return envUrl.endsWith('/') ? envUrl : envUrl + '/';
  };

  useEffect(() => {
    if (!roomCode || battleState === 'lobby' || battleState === 'finished' || battleState === 'analyzing') {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
      return;
    }

    const apiUrl = getApiUrl();
    
    const syncRoom = async () => {
      if (isTransitioningRef.current) return;

      try {
        const response = await fetch(`${apiUrl}battles/sync/${roomCode}/`);
        if (!response.ok) return;
        const data = await response.json();
        
        if (data.status === 'playing' && battleState === 'waiting') {
          const opponentName = data.host_player_id === playerId ? data.join_player : data.host_player;
          setOpponent({
            name: opponentName || 'Opponent',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=ef4444',
            level: 45, xp: 2890, color: '#ef4444'
          });
          setGameMode(data.game_mode || 'coding');
          setDifficulty(data.difficulty || 'easy');
          if (data.game_mode === 'coding' && data.difficulty) {
            setCode(QUESTIONS['coding'][data.difficulty]?.defaultCode || '');
          } else if (data.game_mode === 'quiz') {
            setCurrentQuestionIndex(0);
            setSelectedOption(null);
            setAnsweredOption(null);
            setCorrectAnswersCount(0);
            setIsWaitingForOpponent(false);
            setQuizAnswerLog([]);
            setShowingResult(false);
            if (data.quiz_data && Array.isArray(data.quiz_data) && data.quiz_data.length >= 5) {
              setAiQuestions(data.quiz_data);
            } else {
              setAiQuestions(null);
            }
          }
          setBattleState('playing');
        } else if (data.status === 'finished' && !isTransitioningRef.current) {
          isTransitioningRef.current = true;
          if (pollInterval.current) {
            clearInterval(pollInterval.current);
            pollInterval.current = null;
          }
          setIsWaitingForOpponent(false);
          setWinner(data.winner);
          setMatchStats({
            host_player: data.host_player,
            host_player_id: data.host_player_id,
            join_player: data.join_player,
            join_player_id: data.join_player_id,
            host_score: data.host_score, host_time: data.host_time, 
            join_score: data.join_score, join_time: data.join_time
          });
          setBattleState('analyzing');
          setTimeout(() => {
            setBattleState('finished');
          }, 1500);
        }
      } catch (error) {
        console.error('Error syncing room:', error);
      }
    };

    pollInterval.current = setInterval(syncRoom, 1500);
    syncRoom();

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
    };
  }, [roomCode, battleState, isWaitingForOpponent]);

  useEffect(() => {
    let timer;
    if (battleState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && battleState === 'playing') {
      handleTimeUp();
    }
    return () => clearInterval(timer);
  }, [battleState, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const submitToBackend = async (finalScore, timeTaken) => {
    try {
      const apiUrl = getApiUrl();
      await fetch(`${apiUrl}battles/submit/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          room_code: roomCode, 
          player: me.name,
          playerId: playerId,
          score: finalScore,
          time_taken: timeTaken
        })
      });
    } catch (e) {
      console.error('Submit error:', e);
    }
  };

  const handleTimeUp = async () => {
    const timeTaken = 300 - timeLeft;
    await submitToBackend(correctAnswersCount, 300);
    if (gameMode === 'quiz') setIsWaitingForOpponent(true);
  };

  const handleFlee = async () => {
    isTransitioningRef.current = false;
    if (roomCode && battleState !== 'lobby') {
      try {
        const apiUrl = getApiUrl();
        await fetch(`${apiUrl}battles/flee/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room_code: roomCode, player: me.name, playerId: playerId })
        });
      } catch (e) {
        console.error('Flee error:', e);
      }
    }
    setBattleState('lobby');
    setRoomCode('');
    setWinner(null);
  };

  // Coding mode submit
  const handleCodingSubmit = async () => {
    if (battleState !== 'playing') return;
    const timeTaken = 300 - timeLeft;
    await submitToBackend(0, timeTaken);
  };

  // Quiz: user clicks "Next" or "Submit Battle" after answering (Instant 0-lag transition)
  const handleQuizNext = () => {
    if (selectedOption === null) return; // must pick an answer
    
    const questionsList = aiQuestions || getLocalQuizQuestions();
    const currentQ = questionsList[currentQuestionIndex];
    const isRight = selectedOption === currentQ.ans;
    const newScore = isRight ? correctAnswersCount + 1 : correctAnswersCount;

    // Log this answer for review (shown after submitting battle)
    setQuizAnswerLog(prev => [...prev, {
      q: currentQ.q,
      opts: currentQ.opts,
      chosen: selectedOption,
      correct: currentQ.ans,
      isRight
    }]);

    setCorrectAnswersCount(newScore);

    if (currentQuestionIndex < questionsList.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      // All questions done — submit to backend instantly
      const timeTaken = 300 - timeLeft;
      submitToBackend(newScore, timeTaken);
      setIsWaitingForOpponent(true);
    }
  };

  const getLocalQuizQuestions = () => {
    const banks = {
      easy: [
        { q: 'Which data structure uses LIFO (Last In First Out) principle?', opts: ['Queue', 'Stack', 'Linked List', 'Array'], ans: 1 },
        { q: 'What does HTML stand for?', opts: ['Hyper Text Markup Language', 'High Text Machine Language', 'Hyper Loop Machine Language', 'None'], ans: 0 },
        { q: 'Which of the following is a Javascript framework?', opts: ['Django', 'React', 'Flask', 'Laravel'], ans: 1 },
        { q: 'Which symbol is used for single line comments in Javascript?', opts: ['//', '/*', '#', '<!--'], ans: 0 },
        { q: 'What is the time complexity of binary search?', opts: ['O(n)', 'O(n^2)', 'O(log n)', 'O(1)'], ans: 2 },
        { q: 'Which HTTP method is used to create a new resource?', opts: ['GET', 'POST', 'PUT', 'DELETE'], ans: 1 },
        { q: 'What is the output of 2 + "2" in JS?', opts: ['4', '22', 'NaN', 'Error'], ans: 1 },
        { q: 'Which keyword is used to declare a constant in JS?', opts: ['var', 'let', 'const', 'def'], ans: 2 },
        { q: 'What does CSS stand for?', opts: ['Computer Style Sheets', 'Creative Style Sheets', 'Cascading Style Sheets', 'Colorful Style Sheets'], ans: 2 },
        { q: 'Which hook is used to manage state in React?', opts: ['useEffect', 'useState', 'useContext', 'useReducer'], ans: 1 }
      ],
      medium: [
        { q: 'What is the time complexity of quicksort in the worst case?', opts: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'], ans: 2 },
        { q: 'Which design pattern restricts object creation to a single instance?', opts: ['Factory', 'Singleton', 'Observer', 'Builder'], ans: 1 },
        { q: 'What is a closure in JavaScript?', opts: ['A function bundled with its lexical environment', 'A loop that never ends', 'A block of code', 'An error type'], ans: 0 },
        { q: 'Which method adds an element to the end of an array?', opts: ['push()', 'pop()', 'shift()', 'unshift()'], ans: 0 },
        { q: 'What does ACID stand for in databases?', opts: ['Atomicity, Consistency, Isolation, Durability', 'Array, Code, Int, Double', 'Asynchronous, Causal, Isolated, Distributed', 'None'], ans: 0 },
        { q: 'What is the default port for HTTP?', opts: ['443', '80', '8080', '22'], ans: 1 },
        { q: 'Which algorithm is used to find the shortest path in a graph?', opts: ['DFS', 'Dijkstra', 'Binary Search', 'Merge Sort'], ans: 1 },
        { q: 'What is a Promise in JS?', opts: ['An object representing eventual completion of an async operation', 'A guarantee of execution', 'A synchronous function', 'A new data type'], ans: 0 },
        { q: 'Which command is used to create a new branch in Git?', opts: ['git branch', 'git checkout -b', 'Both A and B', 'git merge'], ans: 2 },
        { q: 'What is Virtual DOM in React?', opts: ['A direct copy of the real DOM', 'A lightweight JavaScript representation of the DOM', 'A browser feature', 'A CSS engine'], ans: 1 }
      ],
      hard: [
        { q: 'Which consistency model guarantees that all readers see the most recent write?', opts: ['Eventual', 'Causal', 'Strong', 'Monotonic'], ans: 2 },
        { q: 'What is the CAP theorem?', opts: ['Consistency, Availability, Partition tolerance', 'Concurrency, Asynchrony, Parallelism', 'Code, API, Process', 'None'], ans: 0 },
        { q: 'Which sorting algorithm is most efficient for nearly sorted data?', opts: ['Quick Sort', 'Merge Sort', 'Insertion Sort', 'Heap Sort'], ans: 2 },
        { q: 'What is a B-Tree primarily used for?', opts: ['In-memory searching', 'Database indexing', 'Cryptographic hashing', 'Graph traversal'], ans: 1 },
        { q: 'What is the primary difference between a process and a thread?', opts: ['Threads share memory, processes do not', 'Processes are faster', 'Threads cannot be preempted', 'No difference'], ans: 0 },
        { q: 'In OSI model, which layer is responsible for routing?', opts: ['Data Link', 'Transport', 'Network', 'Application'], ans: 2 },
        { q: 'What does CORS stand for?', opts: ['Cross-Origin Resource Sharing', 'Central Object Routing System', 'Computer Online Rest Service', 'None'], ans: 0 },
        { q: 'Which garbage collection algorithm does V8 (JavaScript) primarily use?', opts: ['Reference Counting', 'Mark-and-Sweep', 'Manual Memory Management', 'Stop-and-copy'], ans: 1 },
        { q: 'What is event delegation in JavaScript?', opts: ['Attaching a single listener to a parent element', 'Creating multiple events', 'Stopping event propagation', 'None'], ans: 0 },
        { q: 'What is a Bloom Filter?', opts: ['A probabilistic data structure used to test set membership', 'An image processing algorithm', 'A sorting method', 'A type of binary tree'], ans: 0 }
      ]
    };
    return banks[difficulty] || banks.easy;
  };

  const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleCreateRoom = async (mode) => {
    isTransitioningRef.current = false;
    setGameMode(mode);
    const newRoomCode = generateRoomCode();
    setRoomCode(newRoomCode);
    if (mode === 'coding') {
      setCode(QUESTIONS['coding'][difficulty].defaultCode);
    } else {
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setAnsweredOption(null);
      setCorrectAnswersCount(0);
      setIsWaitingForOpponent(false);
      setAiQuestions(null);
      setQuizAnswerLog([]);
      setShowingResult(false);
    }
    
    setIsGenerating(true);
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}battles/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          room_code: newRoomCode, 
          player: me.name, 
          playerId: playerId,
          mode: mode,
          difficulty: difficulty
        })
      });
      setIsGenerating(false);
      if (!res.ok) {
        const errText = await res.text();
        alert("Backend error: " + res.status + " " + errText.substring(0, 100));
        return;
      }
      setBattleState('waiting');
    } catch (error) {
      setIsGenerating(false);
      alert("Network Error: " + error.message);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) return;
    isTransitioningRef.current = false;
    const code = joinCode.toUpperCase().trim();
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}battles/join/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_code: code, player: me.name, playerId: playerId })
      });
      if (res.ok) {
        const data = await res.json();
        setRoomCode(code);
        setOpponent({
          name: data.opponent || 'Opponent',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=ef4444',
          level: 45, xp: 2890, color: '#ef4444'
        });
        setGameMode(data.mode || 'coding');
        setDifficulty(data.difficulty || 'easy');
        if (data.mode === 'coding' && data.difficulty) {
          setCode(QUESTIONS['coding'][data.difficulty]?.defaultCode || '');
        } else if (data.mode === 'quiz') {
          setCurrentQuestionIndex(0);
          setSelectedOption(null);
          setAnsweredOption(null);
          setCorrectAnswersCount(0);
          setIsWaitingForOpponent(false);
          setQuizAnswerLog([]);
          setShowingResult(false);
          if (data.quiz_data && Array.isArray(data.quiz_data) && data.quiz_data.length >= 5) {
            setAiQuestions(data.quiz_data);
          } else {
            setAiQuestions(null);
          }
        }
        setBattleState('playing');
      } else {
        alert("Room not found or is full!");
      }
    } catch (error) {
      console.error('Error joining room', error);
    }
  };

  if (battleState === 'lobby') {
    return (
      <div className="min-h-screen text-white flex flex-col items-center justify-center p-6 relative overflow-hidden bg-transparent">
        {isGenerating && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
            <h2 className="text-2xl font-bold">Creating Room...</h2>
          </div>
        )}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="z-10 max-w-2xl w-full">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20">
              <Swords size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold font-sans tracking-tight mb-3">Multiplayer Arena</h1>
            <p className="text-gray-400 mb-6">Challenge friends or random opponents to test your skills.</p>
            
            <div className="flex justify-center gap-3">
              {['easy', 'medium', 'hard'].map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`px-6 py-2 rounded-full font-bold uppercase tracking-wider text-xs transition-all ${
                    difficulty === d 
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                  }`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <button onClick={() => handleCreateRoom('coding')}
              className="bg-[#11111a] border border-white/10 hover:border-indigo-500/50 p-6 rounded-2xl text-left transition-all hover:-translate-y-1 group">
              <Terminal size={28} className="text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">Play Coding</h3>
              <p className="text-sm text-gray-400">1v1 real-time DSA algorithms battle.</p>
              <div className="mt-4 text-xs font-bold text-indigo-400 uppercase tracking-wider">Create Room &rarr;</div>
            </button>
            <button onClick={() => handleCreateRoom('quiz')}
              className="bg-[#11111a] border border-white/10 hover:border-emerald-500/50 p-6 rounded-2xl text-left transition-all hover:-translate-y-1 group">
              <HelpCircle size={28} className="text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">Play Quiz</h3>
              <p className="text-sm text-gray-400">Fast-paced MCQ battle on CS concepts.</p>
              <div className="mt-4 text-xs font-bold text-emerald-400 uppercase tracking-wider">Create Room &rarr;</div>
            </button>
          </div>

          <div className="bg-[#11111a] border border-white/10 p-6 rounded-2xl flex items-center gap-4">
            <input 
              type="text" 
              placeholder="Enter Room Code (e.g. X7B9K2)" 
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
              className="flex-1 bg-[#1a1a25] border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 uppercase font-mono"
            />
            <button onClick={handleJoinRoom}
              className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
              Join Room
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const PlayerCard = ({ player, isOpponent }) => (
    <motion.div 
      initial={{ opacity: 0, x: isOpponent ? 50 : -50 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative p-5 rounded-2xl border bg-[#11111a] flex flex-col items-center justify-center gap-3"
      style={{ borderColor: `${player.color}40`, boxShadow: `0 0 20px ${player.color}10` }}
    >
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 px-2 py-1 rounded-md border border-white/5">
        <Zap size={12} color={player.color} />
        <span className="text-[10px] text-gray-400 font-mono">Lvl {player.level}</span>
      </div>
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 p-1" style={{ borderColor: player.color }}>
          <img src={player.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover bg-gray-800" />
        </div>
        {battleState === 'playing' && (
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -bottom-2 -right-2 bg-green-500 w-5 h-5 rounded-full border-2 border-[#11111a]"
          />
        )}
      </div>
      <div className="text-center">
        <h3 className="text-white font-bold text-lg">{player.name}</h3>
        <p className="text-xs text-gray-400 mt-1">{player.xp} XP</p>
      </div>
      <div className="w-full mt-4 bg-gray-800 h-2 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: '100%' }}
          animate={{ width: battleState === 'playing' ? '80%' : '100%' }}
          className="h-full rounded-full"
          style={{ backgroundColor: player.color }}
        />
      </div>
    </motion.div>
  );

  const isWinner = winner === me.name || (matchStats && (
    (matchStats.host_player_id === playerId && winner === matchStats.host_player) ||
    (matchStats.join_player_id === playerId && winner === matchStats.join_player)
  ));
  const isDraw = winner === 'Draw';
  const questionsList = aiQuestions || getLocalQuizQuestions();

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col font-sans overflow-hidden">
      
      {/* Top Navbar */}
      <header className="h-16 border-b border-white/10 bg-[#0f0f13] flex items-center justify-between px-6 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${gameMode === 'coding' ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'}`}>
            {gameMode === 'coding' ? <Terminal size={20} /> : <HelpCircle size={20} />}
          </div>
          <div>
            <h1 className="font-bold text-md tracking-wide uppercase">1v1 {gameMode} BATTLE</h1>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Room ID: #{roomCode}</p>
              <span className="text-[10px] bg-white/10 px-2 rounded uppercase text-white font-bold">{difficulty}</span>
            </div>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black border border-white/10 px-5 py-2 rounded-full shadow-lg">
          <Clock size={16} className={timeLeft <= 60 ? 'text-red-500 animate-pulse' : 'text-emerald-400'} />
          <span className={`text-xl font-mono font-bold tracking-widest ${timeLeft <= 60 ? 'text-red-500' : 'text-white'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        <button 
          onClick={handleFlee}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/5"
        >
          <X size={16} /> Flee Battle
        </button>
      </header>

      {/* Main Battle Arena */}
      <main className="flex-1 flex gap-4 p-4 h-[calc(100vh-4rem)] relative">
        
        {/* Left Side: Player 1 */}
        <aside className="w-64 flex-shrink-0 flex flex-col justify-center hidden md:flex">
          <PlayerCard player={me} isOpponent={false} />
        </aside>

        {/* Center */}
        <div className="flex-1 flex flex-col border border-white/10 rounded-2xl overflow-hidden bg-[#0d0d12] shadow-2xl relative">
          
          {/* Waiting Overlay */}
          <AnimatePresence>
            {battleState === 'waiting' && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center"
              >
                <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6" />
                <h2 className="text-3xl font-bold mb-2">Waiting for Opponent...</h2>
                <div className="bg-white/10 px-6 py-3 rounded-xl border border-white/20 flex flex-col items-center mt-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Share this code with your friend</p>
                  <div className="flex items-center gap-3">
                    <p className="text-3xl font-mono font-bold text-indigo-400">{roomCode}</p>
                    <button 
                      onClick={() => navigator.clipboard.writeText(roomCode)}
                      className="p-2 bg-indigo-500/20 hover:bg-indigo-500/40 rounded-lg transition-colors"
                      title="Copy Code"
                    >
                      <Copy size={20} className="text-indigo-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analyzing Overlay */}
          <AnimatePresence>
            {battleState === 'analyzing' && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-24 h-24 relative mb-6">
                  <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full" />
                  <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <Zap size={32} className="text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Analyzing Results...</h2>
                <p className="text-gray-400">Comparing scores and calculating winner.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Finished Overlay */}
          <AnimatePresence>
            {battleState === 'finished' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center overflow-y-auto"
              >
                <motion.div 
                  initial={{ y: 20 }} animate={{ y: 0 }}
                  className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 border-4 shadow-2xl ${
                    isWinner ? 'bg-indigo-500/20 border-indigo-400 shadow-indigo-500/50' 
                    : isDraw ? 'bg-yellow-500/20 border-yellow-400 shadow-yellow-500/50'
                    : 'bg-red-500/20 border-red-400 shadow-red-500/50'
                  }`}
                >
                  <Trophy size={48} className={isWinner ? 'text-indigo-400' : isDraw ? 'text-yellow-400' : 'text-red-400'} />
                </motion.div>
                
                <h2 className="text-4xl font-black mb-1 tracking-tight">
                  {isWinner ? 'VICTORY! 🎉' : isDraw ? 'DRAW! 🤝' : 'DEFEAT 💪'}
                </h2>
                <p className="text-gray-400 text-base mb-4">
                  {isWinner ? 'You dominated the arena!' : isDraw ? 'A fierce battle, perfectly matched.' : 'Your opponent proved superior... this time.'}
                </p>

                {/* Score Summary */}
                {gameMode === 'quiz' && matchStats && (
                  <div className="flex gap-4 justify-center mb-6">
                    <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Your Score</p>
                      <p className="text-3xl font-black text-emerald-400">
                        {me.name === matchStats.host_player ? matchStats.host_score : matchStats.join_score}/10
                      </p>
                    </div>
                    <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Opponent</p>
                      <p className="text-3xl font-black text-rose-400">
                        {me.name === matchStats.host_player ? matchStats.join_score : matchStats.host_score}/10
                      </p>
                    </div>
                  </div>
                )}

                {/* Per-Question Answer Review */}
                {gameMode === 'quiz' && quizAnswerLog.length > 0 && (
                  <div className="w-full max-w-lg mb-6 text-left">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 text-center">📋 Your Answer Review</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {quizAnswerLog.map((log, i) => (
                        <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${
                          log.isRight ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'
                        }`}>
                          {log.isRight 
                            ? <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                            : <XCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                          }
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-300 font-medium truncate">Q{i+1}: {log.q}</p>
                            <p className={`text-xs mt-0.5 ${log.isRight ? 'text-emerald-400' : 'text-red-400'}`}>
                              Your answer: {log.opts[log.chosen]}
                            </p>
                            {!log.isRight && (
                              <p className="text-xs text-emerald-400">
                                Correct: {log.opts[log.correct]}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {isWinner && (
                  <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-400 px-6 py-2 rounded-xl font-bold flex items-center gap-2 mb-4">
                    <TrendingUp size={18} /> +50 XP Gained
                  </div>
                )}

                <button 
                  onClick={() => {
                    isTransitioningRef.current = false;
                    setBattleState('lobby');
                    setRoomCode('');
                    setWinner(null);
                    setQuizAnswerLog([]);
                    setMatchStats(null);
                  }}
                  className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Return to Lobby
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Coding or Quiz main area */}
          {gameMode === 'coding' ? (
            <>
              <div className="bg-[#15151e] border-b border-white/10 p-4">
                <h2 className="text-lg font-bold text-indigo-400 flex items-center gap-2">
                  <Terminal size={18} /> {QUESTIONS.coding[difficulty]?.title}
                </h2>
                <p className="text-sm text-gray-400 mt-1">{QUESTIONS.coding[difficulty]?.desc}</p>
              </div>
              <div className="flex-1 relative">
                <Editor
                  height="100%"
                  defaultLanguage="python"
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value)}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 16,
                    padding: { top: 20 },
                    scrollBeyondLastLine: false,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
                  }}
                />
              </div>
              <div className="bg-[#15151e] border-t border-white/10 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-md text-xs font-mono text-gray-400 flex items-center gap-2">
                    <AlertCircle size={14} /> Python 3.10
                  </div>
                </div>
                <button
                  onClick={handleCodingSubmit}
                  disabled={battleState !== 'playing'}
                  className="relative overflow-hidden group flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 disabled:opacity-50"
                >
                  <Play size={18} className="fill-current" /> Submit Code
                </button>
              </div>
            </>
          ) : (
            // Quiz Mode UI
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0d0d12]">
              {isWaitingForOpponent ? (
                <div className="w-full max-w-3xl text-center bg-white/5 border border-white/10 rounded-2xl p-12">
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                  <h2 className="text-3xl font-bold mb-2">Waiting for Opponent...</h2>
                  <p className="text-gray-400">You scored <span className="text-emerald-400 font-bold">{correctAnswersCount}/10</span>! Waiting for {opponent?.name || 'Opponent'} to finish.</p>
                </div>
              ) : (
                <div className="w-full max-w-3xl">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                    
                    {/* Progress */}
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Question {currentQuestionIndex + 1} of {questionsList.length}</span>
                      <span className="text-xs font-bold text-gray-400">Score: <span className="text-emerald-400">{correctAnswersCount}</span></span>
                    </div>
                    
                    <h2 className="text-xl font-bold mb-6 leading-relaxed">
                      {questionsList[currentQuestionIndex]?.q}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {questionsList[currentQuestionIndex]?.opts.map((opt, i) => {
                        const isSelected = selectedOption === i;
                        const btnClass = isSelected 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold shadow-lg shadow-emerald-500/10 scale-[1.01]' 
                          : 'bg-black/50 hover:bg-white/10 border-white/10 hover:border-emerald-500/30 text-white';
                        
                        return (
                          <button 
                            key={i} 
                            onClick={() => setSelectedOption(i)}
                            className={`p-4 rounded-xl text-left font-medium transition-all flex items-center justify-between border ${btnClass}`}
                          >
                            <span>{opt}</span>
                            {isSelected && <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleQuizNext}
                      disabled={battleState !== 'playing' || selectedOption === null}
                      className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {currentQuestionIndex < questionsList.length - 1 ? 'Next Question →' : 'Submit Battle →'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Player 2 */}
        <aside className="w-64 flex-shrink-0 flex flex-col justify-center hidden md:flex">
          {opponent ? (
            <PlayerCard player={opponent} isOpponent={true} />
          ) : (
            <div className="h-[300px] border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center p-6 text-center">
              <p className="text-gray-500">Waiting for Opponent...</p>
            </div>
          )}
        </aside>

      </main>
    </div>
  );
};

export default CodingBattle;
