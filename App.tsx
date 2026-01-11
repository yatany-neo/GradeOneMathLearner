
import React, { useState, useEffect, useCallback } from 'react';
import { CATEGORIES, APP_TITLE, SUB_TITLE } from './constants';
import { MathProblem, UserStats } from './types';
import { generateProblem } from './geminiService';
import { Trophy, Star, RefreshCw, ChevronRight, Brain, HelpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [stats, setStats] = useState<UserStats>({ score: 0, correctAnswers: 0, totalAttempts: 0 });
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const fetchProblem = useCallback(async (cat: string) => {
    setLoading(true);
    setFeedback(null);
    setShowExplanation(false);
    try {
      const problem = await generateProblem(cat);
      setCurrentProblem(problem);
    } catch (error) {
      console.error("Failed to fetch problem", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id);
    fetchProblem(id);
  };

  const handleAnswer = (selected: string) => {
    if (!currentProblem || feedback) return;

    const isCorrect = selected === currentProblem.answer;
    setStats(prev => ({
      ...prev,
      totalAttempts: prev.totalAttempts + 1,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      score: isCorrect ? prev.score + 10 : prev.score
    }));

    setFeedback({
      isCorrect,
      message: isCorrect ? "真棒！你答对啦！🌟" : "哎呀，再想想看？加油！💪"
    });
  };

  const resetGame = () => {
    setSelectedCategory(null);
    setCurrentProblem(null);
    setFeedback(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center max-w-4xl mx-auto">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold text-blue-600 mb-2 font-cartoon drop-shadow-sm">{APP_TITLE}</h1>
        <p className="text-lg text-gray-600 font-medium">{SUB_TITLE}</p>
      </header>

      {/* Stats Bar */}
      <div className="w-full flex justify-between bg-white rounded-2xl p-4 mb-8 shadow-md border-b-4 border-blue-200">
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-500" size={24} />
          <span className="font-bold text-xl text-gray-700">{stats.score} 分</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="text-orange-500" size={24} />
          <span className="font-bold text-xl text-gray-700">{stats.correctAnswers} 题</span>
        </div>
      </div>

      {!selectedCategory ? (
        /* Category Selection */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`${cat.color} hover:scale-105 transition-transform p-6 rounded-3xl shadow-lg flex items-center justify-between text-white group`}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl bg-white/20 p-3 rounded-2xl">{cat.icon}</span>
                <span className="text-2xl font-bold font-cartoon">{cat.name}</span>
              </div>
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          ))}
        </div>
      ) : (
        /* Problem Interface */
        <div className="w-full bg-white rounded-3xl shadow-xl p-6 md:p-10 border-2 border-blue-100 flex flex-col items-center">
          {loading ? (
            <div className="flex flex-col items-center py-20">
              <RefreshCw className="animate-spin text-blue-500 mb-4" size={48} />
              <p className="text-blue-500 font-bold text-xl">正在寻找有趣的题目...</p>
            </div>
          ) : currentProblem ? (
            <div className="w-full">
              <div className="flex justify-between items-center mb-6">
                <span className="bg-blue-100 text-blue-600 px-4 py-1 rounded-full font-bold">
                  {CATEGORIES.find(c => c.id === selectedCategory)?.name}
                </span>
                <button 
                  onClick={resetGame}
                  className="text-gray-400 hover:text-gray-600"
                >
                  返回主页
                </button>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 leading-relaxed text-center">
                {currentProblem.question}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {currentProblem.options.map((option, idx) => (
                  <button
                    key={idx}
                    disabled={!!feedback}
                    onClick={() => handleAnswer(option)}
                    className={`
                      p-5 rounded-2xl text-xl font-bold transition-all border-b-4
                      ${feedback 
                        ? (option === currentProblem.answer 
                            ? 'bg-green-100 border-green-500 text-green-700' 
                            : feedback.message.includes('再想想') && feedback.message.includes(option) ? 'bg-red-100 border-red-500 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-400')
                        : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 active:translate-y-1 active:border-b-0'}
                    `}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {feedback && (
                <div className={`p-6 rounded-2xl mb-6 text-center animate-bounce ${feedback.isCorrect ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  <p className="text-2xl font-bold mb-2">{feedback.message}</p>
                  {!feedback.isCorrect && (
                    <button 
                      onClick={() => setShowExplanation(true)}
                      className="text-sm underline flex items-center justify-center gap-1 mx-auto"
                    >
                      <HelpCircle size={16} /> 看看小老师的解析
                    </button>
                  )}
                </div>
              )}

              {showExplanation && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-xl">
                  <p className="font-bold text-yellow-700 mb-2">💡 小贴士：</p>
                  <p className="text-yellow-800 leading-relaxed">{currentProblem.explanation}</p>
                </div>
              )}

              {feedback && (
                <button
                  onClick={() => fetchProblem(selectedCategory)}
                  className="w-full bg-blue-500 text-white py-4 rounded-2xl text-xl font-bold shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  下一题 <ChevronRight />
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-10">
              <p>出错了，请稍后再试。</p>
              <button onClick={() => fetchProblem(selectedCategory)} className="text-blue-500 underline mt-4">重试</button>
            </div>
          )}
        </div>
      )}

      {/* Footer / Knowledge Points */}
      {!selectedCategory && (
        <div className="mt-12 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50 text-center">
            <Brain className="mx-auto text-blue-400 mb-2" size={32} />
            <h3 className="font-bold text-gray-700 mb-1">同步教材</h3>
            <p className="text-sm text-gray-500">紧贴一年级教学大纲</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-50 text-center">
            <Trophy className="mx-auto text-green-400 mb-2" size={32} />
            <h3 className="font-bold text-gray-700 mb-1">趣味激励</h3>
            <p className="text-sm text-gray-500">积分勋章奖励机制</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-50 text-center">
            <Star className="mx-auto text-purple-400 mb-2" size={32} />
            <h3 className="font-bold text-gray-700 mb-1">AI 辅导</h3>
            <p className="text-sm text-gray-500">Gemini 智能生成难题解析</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
