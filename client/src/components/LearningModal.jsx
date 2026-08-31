import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, CheckCircle2, XCircle, X, ArrowRight, RotateCcw, Trophy, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { getApiUrl, parseJsonResponse } from '../utils/apiClient';

const LearningModal = ({ isOpen, onClose }) => {
  const { token } = useAuth();
  const { accentColor } = useTheme();
  const { showToast } = useToast();

  const [curriculum, setCurriculum] = useState({});
  const [userProgress, setUserProgress] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('python');
  const [quiz, setQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTopics = async () => {
    if (!token) return;
    try {
      const res = await fetch(getApiUrl('/api/learning/topics'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await parseJsonResponse(res);
        setCurriculum(data.curriculum || {});
        setUserProgress(data.progress || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (isOpen) {
      fetchTopics();
      setEvaluation(null);
      setQuiz(null);
      setUserAnswers({});
    }
  }, [isOpen, token]);

  const startQuiz = async (topic) => {
    setSelectedTopic(topic);
    setLoading(true);
    setEvaluation(null);
    setUserAnswers({});
    try {
      const res = await fetch(getApiUrl('/api/learning/quiz'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ topic })
      });
      if (res.ok) {
        const data = await parseJsonResponse(res);
        setQuiz(data.quiz);
      }
    } catch (e) {
      showToast('Failed to load quiz.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionIndex, optionIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const submitQuiz = async () => {
    if (!quiz) return;
    const answersArray = quiz.questions.map((_, idx) => userAnswers[idx]);
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/learning/evaluate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          topic: selectedTopic,
          answers: answersArray
        })
      });

      if (res.ok) {
        const data = await parseJsonResponse(res);
        setEvaluation(data.evaluation || data);
        fetchTopics();
      }
    } catch (e) {
      showToast('Failed to evaluate quiz.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-7 shadow-2xl z-10 border border-black/5 dark:border-white/10 max-h-[88vh] flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0"
              style={{ backgroundColor: accentColor, color: '#33223B' }}
            >
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">Interactive AI Tutor & Quizzes</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Master coding & computer science concepts with adaptive feedback</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1 custom-chat-scroller">
          {!quiz && !evaluation && (
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Select a Topic to Test Knowledge:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'python', name: 'Python Core & OOP', desc: 'Variables, loops, functions, decorators, async' },
                  { id: 'javascript', name: 'JavaScript & ES6+', desc: 'Closures, promises, event loop, DOM, prototypes' }
                ].map((track) => (
                  <button
                    key={track.id}
                    onClick={() => startQuiz(track.id)}
                    className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-left transition-all group hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {track.name}
                        </span>
                        <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{track.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Learning Progress Summary */}
              {userProgress.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>Your Learning Mastery</span>
                  </h3>
                  <div className="space-y-2">
                    {userProgress.map((prog) => (
                      <div key={prog.id} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-zinc-900 dark:text-white capitalize">{prog.topic}</span>
                          <span className="text-[10px] text-zinc-400 block">{prog.level} • {prog.status}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{prog.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active Quiz Player */}
          {quiz && !evaluation && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400">
                  Topic: {quiz.topic.toUpperCase()}
                </span>
                <span className="text-xs text-zinc-400">
                  {Object.keys(userAnswers).length} of {quiz.questions.length} answered
                </span>
              </div>

              {quiz.questions.map((q, qIdx) => (
                <div key={qIdx} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2.5">
                  <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                    {qIdx + 1}. {q.question}
                  </p>
                  <div className="space-y-1.5">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = userAnswers[qIdx] === oIdx;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleSelectOption(qIdx, oIdx)}
                          className={`w-full p-2.5 rounded-xl text-left text-xs font-medium transition-all flex items-center gap-2.5 ${
                            isSelected
                              ? 'border-2 border-purple-500 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-100 font-bold'
                              : 'border border-zinc-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setQuiz(null)}
                  className="text-xs text-zinc-400 hover:text-zinc-600"
                >
                  Cancel
                </button>
                <button
                  onClick={submitQuiz}
                  disabled={loading}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-zinc-900 shadow-md transition-transform hover:scale-105"
                  style={{ backgroundColor: accentColor }}
                >
                  {loading ? 'Evaluating...' : 'Submit & Review Answers'}
                </button>
              </div>
            </div>
          )}

          {/* Quiz Evaluation Results */}
          {evaluation && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-center space-y-1">
                <Trophy className="w-8 h-8 text-amber-500 mx-auto" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Score: {evaluation.percentage}% ({evaluation.correctCount} / {evaluation.totalQuestions} Correct)
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-300">
                  {evaluation.passed ? '🎉 Great job! You demonstrated solid mastery of this concept.' : 'Keep practicing! Review the explanations below.'}
                </p>
              </div>

              <div className="space-y-3">
                {evaluation.results.map((res, rIdx) => (
                  <div key={rIdx} className={`p-3.5 rounded-2xl border ${res.isCorrect ? 'border-green-200 dark:border-green-800/60 bg-green-50/50 dark:bg-green-950/20' : 'border-red-200 dark:border-red-800/60 bg-red-50/50 dark:bg-red-950/20'}`}>
                    <div className="flex items-start gap-2 mb-1">
                      {res.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white">{res.question}</p>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">
                          Your answer: <strong className={res.isCorrect ? 'text-green-600' : 'text-red-600'}>{res.userAnswer}</strong>
                          {!res.isCorrect && <> • Correct: <strong className="text-green-600">{res.correctAnswer}</strong></>}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 italic">
                          💡 {res.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => { setEvaluation(null); setQuiz(null); }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-900 shadow-md"
                  style={{ backgroundColor: accentColor }}
                >
                  Choose Another Topic
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningModal;
