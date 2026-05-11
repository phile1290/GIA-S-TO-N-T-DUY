/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Lightbulb, 
  ChevronRight, 
  RotateCcw, 
  CheckCircle2, 
  HelpCircle, 
  Trophy,
  BookOpen,
  Sparkles,
  ArrowLeft,
  Send,
  Camera,
  X,
  Menu
} from 'lucide-react';
import { generateMathProblem, MathProblem, answerStudentQuestion, verifyAnswer } from './services/mathService';

const TOPICS = [
  "1. Nhận diện quy luật",
  "2. Lưới tọa độ - Tìm đường",
  "3. Suy luận logic phân nhánh",
  "4. Trạng thái và tối ưu hóa",
  "5. Thực thi chuỗi lệnh",
  "6. Phân chia và tìm kiếm",
  "7. Mã hóa và giải mã",
  "8. Đồ thị và bản đồ",
  "9. Đọc hiểu lưu đồ khối",
  "10. Trò chơi chiến lược",
  "11. Tập hợp & Sắp xếp logic"
];

const LEVELS = [
  "Level 1",
  "Level 2",
  "Level 3",
  "Level 4",
  "Level 5"
];

export default function App() {
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHint1, setShowHint1] = useState(false);
  const [showHint2, setShowHint2] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'none', message: string }>({ type: 'none', message: '' });
  const [isChecking, setIsChecking] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>(undefined);
  const [selectedLevel, setSelectedLevel] = useState<string | undefined>(undefined);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  
  // Q&A States
  const [studentQuestion, setStudentQuestion] = useState('');
  const [qaHistory, setQaHistory] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ data: string, mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProblem = async (topic?: string, level?: string) => {
    setLoading(true);
    setProblem(null);
    setShowHint1(false);
    setShowHint2(false);
    setShowSolution(false);
    setUserAnswer('');
    setFeedback({ type: 'none', message: '' });
    setIsMenuOpen(false);
    setQaHistory([]);
    setStudentQuestion('');
    setSelectedImage(null);
    
    try {
      const newProblem = await generateMathProblem(topic, level);
      setProblem(newProblem);
    } catch (error) {
      console.error("Error fetching problem:", error);
      setFeedback({ type: 'error', message: 'Ôi, có lỗi gì đó rồi. Con thử lại nhé!' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setSelectedImage({ data: base64String, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAskQuestion = async () => {
    if (!problem || !studentQuestion.trim()) return;
    
    const currentQuestion = studentQuestion;
    const currentImage = selectedImage;
    setStudentQuestion('');
    setSelectedImage(null);
    setIsAnswering(true);
    
    // Add user question to history immediately for UI
    const userMsg = { role: 'user' as const, text: currentQuestion };
    const newHistory = [...qaHistory, userMsg];
    setQaHistory(newHistory);

    try {
      const answer = await answerStudentQuestion(problem, currentQuestion, qaHistory, currentImage || undefined);
      setQaHistory([...newHistory, { role: 'model' as const, text: answer }]);
    } catch (error) {
      console.error("Error answering question:", error);
      setQaHistory([...newHistory, { role: 'model' as const, text: "Thầy xin lỗi, có chút trục trặc kỹ thuật. Con hỏi lại nhé!" }]);
    } finally {
      setIsAnswering(false);
    }
  };

  const checkAnswer = async () => {
    if (!problem || !userAnswer.trim() || isChecking) return;
    
    setIsChecking(true);
    try {
      const isCorrect = await verifyAnswer(problem, userAnswer);
      
      if (isCorrect) {
        setFeedback({ type: 'success', message: problem.loi_dong_vien });
        setShowSolution(true);
      } else {
        setFeedback({ type: 'error', message: 'Chưa chính xác lắm, con thử suy nghĩ thêm hoặc xem gợi ý nhé!' });
      }
    } catch (error) {
      console.error("Error verifying answer:", error);
      setFeedback({ type: 'error', message: 'Có lỗi xảy ra khi kiểm tra đáp án, vui lòng thử lại!' });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div 
      className="min-h-screen text-[#2D3436] font-sans selection:bg-blue-100 relative bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop')" }}
    >
      {/* Overlay to ensure text readability against the dark background */}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b border-white/30 bg-white/70 backdrop-blur-lg sticky top-0 z-20 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
            <div 
              className="flex items-center gap-2 sm:gap-3 cursor-pointer" 
              onClick={() => setIsMenuOpen(true)}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 shrink-0">
                <Brain size={24} className="sm:w-7 sm:h-7" />
              </div>
              <div>
                <h1 className="font-black text-xl sm:text-2xl tracking-tighter text-blue-900 uppercase leading-tight">Tin Học Trẻ</h1>
                <p className="text-[8px] sm:text-[10px] font-bold text-blue-500 tracking-[0.1em] sm:tracking-[0.2em] uppercase">Bảng M1 - Tiểu Học</p>
              </div>
            </div>
            
            {!isMenuOpen && (
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-50 text-blue-700 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-100 transition-all border border-blue-100 shrink-0"
              >
                <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Menu Chính</span>
                <span className="sm:hidden">Menu</span>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-12">
          <AnimatePresence mode="wait">
          {isMenuOpen ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 sm:space-y-12"
            >
              <div className="text-center space-y-3 sm:space-y-4 bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-lg border border-white/40">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">TIN HỌC TRẺ - BẢNG M1</h2>
                <p className="text-gray-700 max-w-lg mx-auto font-medium text-sm sm:text-base">Rèn luyện tư duy thuật toán và logic lập trình dành cho học sinh Tiểu học.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 bg-white/70 backdrop-blur-md p-4 sm:p-8 rounded-3xl shadow-lg border border-white/40">
                <section className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2 sm:gap-3 border-b-4 border-blue-600 pb-2 w-fit">
                    <BookOpen size={20} className="text-blue-600 sm:w-6 sm:h-6" />
                    <h3 className="text-lg sm:text-xl font-black uppercase tracking-tighter text-gray-900">
                      Danh Mục Chuyên Đề
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    {TOPICS.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => setSelectedTopic(topic)}
                        className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl text-left transition-all border-2 ${
                          selectedTopic === topic 
                            ? 'border-blue-600 bg-blue-50 shadow-md sm:translate-x-2' 
                            : 'border-white bg-white shadow-sm hover:border-blue-200 hover:translate-x-1'
                        }`}
                      >
                        <div className="font-bold text-base sm:text-lg text-gray-800">{topic}</div>
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedTopic(undefined)}
                      className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl text-left transition-all border-2 ${
                        selectedTopic === undefined 
                          ? 'border-blue-600 bg-blue-50 shadow-md sm:translate-x-2' 
                          : 'border-white bg-white shadow-sm hover:border-blue-200 hover:translate-x-1'
                      }`}
                    >
                      <div className="font-bold text-base sm:text-lg text-gray-800">Tất cả chuyên đề</div>
                    </button>
                  </div>
                </section>

                <section className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2 sm:gap-3 border-b-4 border-indigo-600 pb-2 w-fit">
                    <Trophy size={20} className="text-indigo-600 sm:w-6 sm:h-6" />
                    <h3 className="text-lg sm:text-xl font-black uppercase tracking-tighter text-gray-900">
                      Cấp Độ Thử Thách
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    {LEVELS.map((level) => (
                      <button
                        key={level}
                        onClick={() => setSelectedLevel(level)}
                        className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl text-left transition-all border-2 ${
                          selectedLevel === level 
                            ? 'border-indigo-600 bg-indigo-50 shadow-md sm:translate-x-2' 
                            : 'border-white bg-white shadow-sm hover:border-indigo-200 hover:translate-x-1'
                        }`}
                      >
                        <div className="font-bold text-base sm:text-lg text-gray-800">{level}</div>
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedLevel(undefined)}
                      className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl text-left transition-all border-2 ${
                        selectedLevel === undefined 
                          ? 'border-indigo-600 bg-indigo-50 shadow-md sm:translate-x-2' 
                          : 'border-white bg-white shadow-sm hover:border-indigo-200 hover:translate-x-1'
                      }`}
                    >
                      <div className="font-bold text-base sm:text-lg text-gray-800">Mọi cấp độ</div>
                    </button>
                  </div>
                </section>
              </div>

              <div className="flex justify-center pt-4 sm:pt-8">
                <button
                  onClick={() => fetchProblem(selectedTopic, selectedLevel)}
                  className="group relative inline-flex items-center justify-center gap-2 sm:gap-4 px-8 sm:px-16 py-4 sm:py-5 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black text-lg sm:text-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 active:translate-y-0 transition-all uppercase tracking-tighter w-full sm:w-auto"
                >
                  Bắt đầu thí nghiệm
                  <ChevronRight size={24} className="sm:w-7 sm:h-7" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="problem"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8"
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 sm:py-24 space-y-6 sm:space-y-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-white/40">
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 border-4 sm:border-8 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div className="text-center space-y-2 sm:space-y-3 px-4">
                    <p className="text-xl sm:text-2xl font-black text-gray-800 uppercase tracking-tighter">Đang khởi tạo dữ liệu...</p>
                    <p className="text-sm sm:text-base text-blue-500 font-bold animate-pulse">Vui lòng chờ trong giây lát</p>
                  </div>
                </div>
              ) : problem ? (
                <div className="space-y-8">
                  {/* Problem Card */}
                  <div className="bg-white/85 backdrop-blur-md rounded-[2rem] sm:rounded-[40px] p-6 sm:p-10 md:p-14 shadow-2xl border border-white/40 space-y-8 sm:space-y-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 sm:p-8 flex flex-col sm:flex-row gap-2 sm:gap-3 items-end sm:items-center">
                      <span className="px-3 py-1 sm:px-4 sm:py-1.5 bg-blue-900 text-white rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest text-center">
                        {problem.cap_do}
                      </span>
                      <span className="px-3 py-1 sm:px-4 sm:py-1.5 bg-indigo-600 text-white rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest text-center">
                        {problem.lop_de_xuat}
                      </span>
                    </div>

                    <div className="space-y-6 sm:space-y-8 pt-12 sm:pt-0">
                      <div className="flex items-center gap-2 sm:gap-3 text-blue-600 font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-xs sm:text-sm">
                        <div className="w-1.5 sm:w-2 h-6 sm:h-8 bg-blue-600 rounded-full"></div>
                        {problem.chuyen_de}
                      </div>
                      
                      <div className="space-y-6 sm:space-y-8">
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight text-gray-900 tracking-tight">
                          {problem.de_bai}
                        </h3>

                        {/* Image Display */}
                        {problem.svg_code && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-4 border-blue-50 shadow-inner bg-white flex justify-center items-center p-4 sm:p-8 mx-auto w-full"
                          >
                            <div 
                              className="w-full max-w-full flex justify-center items-center overflow-x-auto [&>svg]:max-w-full [&>svg]:h-auto"
                              dangerouslySetInnerHTML={{ __html: problem.svg_code }}
                            />
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Interaction Area */}
                    <div className="space-y-6 sm:space-y-8 pt-4 sm:pt-6">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <input
                          type="text"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          placeholder="Kết quả của con là..."
                          className="flex-1 px-6 py-4 sm:px-8 sm:py-5 bg-gray-50 border-2 sm:border-4 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl sm:rounded-3xl outline-none text-lg sm:text-xl font-bold transition-all shadow-inner w-full"
                          onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                        />
                        <button
                          onClick={checkAnswer}
                          disabled={isChecking}
                          className="px-8 py-4 sm:px-12 sm:py-5 bg-blue-600 text-white rounded-2xl sm:rounded-3xl font-black text-base sm:text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase tracking-tighter w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                          {isChecking ? (
                            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            "Xác nhận"
                          )}
                        </button>
                      </div>

                      {feedback.type !== 'none' && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex items-start sm:items-center gap-3 sm:gap-4 ${
                            feedback.type === 'success' ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-red-50 text-red-700 border-2 border-red-100'
                          }`}
                        >
                          {feedback.type === 'success' ? <CheckCircle2 size={24} className="shrink-0 sm:w-7 sm:h-7" /> : <HelpCircle size={24} className="shrink-0 sm:w-7 sm:h-7" />}
                          <span className="font-black text-base sm:text-lg uppercase tracking-tight">{feedback.message}</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Hints Section */}
                    <div className="pt-6 sm:pt-10 border-t-2 border-gray-100 space-y-4 sm:space-y-6">
                      <div className="flex flex-wrap gap-2 sm:gap-4">
                        {!showHint1 && (
                          <button
                            onClick={() => setShowHint1(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 bg-yellow-400 text-yellow-900 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black border-b-4 border-yellow-600 hover:translate-y-0.5 transition-all uppercase"
                          >
                            <Lightbulb size={16} className="sm:w-5 sm:h-5" />
                            Gợi ý 1
                          </button>
                        )}
                        {showHint1 && !showHint2 && (
                          <button
                            onClick={() => setShowHint2(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 bg-yellow-400 text-yellow-900 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black border-b-4 border-yellow-600 hover:translate-y-0.5 transition-all uppercase"
                          >
                            <Lightbulb size={16} className="sm:w-5 sm:h-5" />
                            Gợi ý 2
                          </button>
                        )}
                        {!showSolution && (
                          <button
                            onClick={() => setShowSolution(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 bg-gray-100 text-gray-500 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black border-b-4 border-gray-300 hover:translate-y-0.5 transition-all sm:ml-auto uppercase"
                          >
                            Xem đáp án
                          </button>
                        )}
                      </div>

                      <AnimatePresence>
                        {showHint1 && (
                          <motion.div
                            key="hint1"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 sm:p-6 bg-yellow-50 rounded-2xl sm:rounded-3xl border-2 border-yellow-200 shadow-sm"
                          >
                            <p className="text-yellow-900 font-bold text-base sm:text-lg">
                              <span className="bg-yellow-400 text-yellow-900 px-2 py-1 sm:px-3 sm:py-1 rounded-md sm:rounded-lg mr-2 sm:mr-3 uppercase text-[10px] sm:text-xs font-black inline-block mb-1 sm:mb-0">Gợi ý 1</span>
                              {problem.goi_y_1}
                            </p>
                          </motion.div>
                        )}
                        {showHint2 && (
                          <motion.div
                            key="hint2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 sm:p-6 bg-yellow-50 rounded-2xl sm:rounded-3xl border-2 border-yellow-200 shadow-sm"
                          >
                            <p className="text-yellow-900 font-bold text-base sm:text-lg">
                              <span className="bg-yellow-400 text-yellow-900 px-2 py-1 sm:px-3 sm:py-1 rounded-md sm:rounded-lg mr-2 sm:mr-3 uppercase text-[10px] sm:text-xs font-black inline-block mb-1 sm:mb-0">Gợi ý 2</span>
                              {problem.goi_y_2}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Solution Section */}
                  <AnimatePresence>
                    {showSolution && (
                      <motion.div
                        key="solution-section"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/85 backdrop-blur-md rounded-[2rem] sm:rounded-[40px] p-6 sm:p-10 md:p-14 shadow-2xl border-4 border-green-500/50 space-y-6 sm:space-y-10"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 text-green-600">
                          <CheckCircle2 size={28} className="sm:w-9 sm:h-9" />
                          <h4 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">Báo cáo kết quả</h4>
                        </div>
                        
                        <div className="space-y-6 sm:space-y-8 text-gray-800 leading-relaxed text-lg sm:text-xl">
                          <div className="p-6 sm:p-8 bg-green-50 rounded-2xl sm:rounded-3xl border-2 border-green-100">
                            <p className="text-xs sm:text-sm font-black text-green-600 uppercase tracking-widest mb-1 sm:mb-2">Đáp án cuối cùng</p>
                            <p className="text-3xl sm:text-4xl font-black text-green-900">{problem.dap_an_cuoi_cung}</p>
                          </div>
                          <div className="whitespace-pre-wrap font-medium bg-gray-50 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 text-base sm:text-lg">
                            <p className="text-xs sm:text-sm font-black text-gray-400 uppercase tracking-widest mb-3 sm:mb-4">Phân tích logic</p>
                            {problem.loi_giai_chi_tiet}
                          </div>
                        </div>

                        {/* AI Q&A Section */}
                        <div className="mt-8 sm:mt-12 p-5 sm:p-8 bg-blue-50/80 backdrop-blur-md rounded-[1.5rem] sm:rounded-[32px] border-2 border-blue-200/50 space-y-4 sm:space-y-6 shadow-lg shadow-blue-50">
                          <div className="flex items-center gap-2 sm:gap-3 text-blue-800 font-black uppercase tracking-tight text-lg sm:text-xl">
                            <HelpCircle size={24} className="sm:w-7 sm:h-7" />
                            <span>Trung tâm giải đáp thắc mắc</span>
                          </div>
                          <div className="flex flex-col gap-3 sm:gap-4">
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                              <div className="flex-1 relative">
                                <input
                                  type="text"
                                  value={studentQuestion}
                                  onChange={(e) => setStudentQuestion(e.target.value)}
                                  placeholder="Con chưa hiểu phần nào? Hãy hỏi thầy nhé..."
                                  className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-white border-2 border-blue-100 rounded-xl sm:rounded-2xl outline-none focus:border-blue-600 transition-all text-base sm:text-lg font-bold shadow-sm pr-12 sm:pr-14"
                                  onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                                />
                                <button
                                  onClick={() => fileInputRef.current?.click()}
                                  className={`absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${
                                    selectedImage ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-blue-600'
                                  }`}
                                  title="Tải ảnh thắc mắc"
                                >
                                  <Camera size={20} className="sm:w-6 sm:h-6" />
                                </button>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  ref={fileInputRef}
                                  onChange={handleImageUpload}
                                />
                              </div>
                              <button
                                onClick={handleAskQuestion}
                                disabled={isAnswering || !studentQuestion.trim()}
                                className="px-6 py-3 sm:px-10 sm:py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black text-base sm:text-lg hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100 uppercase tracking-tighter flex items-center justify-center gap-2 w-full sm:w-auto"
                              >
                                {isAnswering ? (
                                  <>
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Đang xử lý...</span>
                                  </>
                                ) : (
                                  <>
                                    <Send size={18} className="sm:w-5 sm:h-5" />
                                    <span>Gửi câu hỏi</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {selectedImage && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl overflow-hidden border-2 border-blue-200 shadow-sm group"
                              >
                                <img 
                                  src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} 
                                  alt="Preview" 
                                  className="w-full h-full object-cover"
                                />
                                <button 
                                  onClick={() => setSelectedImage(null)}
                                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={12} />
                                </button>
                              </motion.div>
                            )}
                          </div>
                          
                          <AnimatePresence>
                            {qaHistory.length > 0 && (
                              <div key="qa-history-container" className="space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar flex flex-col items-center">
                                {qaHistory.map((msg, idx) => (
                                  <motion.div
                                    key={`msg-${idx}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-center w-full"
                                  >
                                    <div className={`w-full max-w-[90%] sm:max-w-[85%] p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm text-center overflow-hidden ${
                                      msg.role === 'user' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-white border-2 border-blue-100 text-gray-800'
                                    }`}>
                                      <div className="flex flex-col items-center gap-2 sm:gap-3 w-full">
                                        {msg.role === 'model' && (
                                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
                                            <Brain size={14} className="sm:w-4 sm:h-4" />
                                          </div>
                                        )}
                                        <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words w-full font-medium">
                                          {(() => {
                                            const cleanText = msg.text.replace(/```(?:xml|svg|html)?\s*(<svg[\s\S]*?<\/svg>)\s*```/g, '$1');
                                            const svgRegex = /<svg[\s\S]*?<\/svg>/g;
                                            const parts = [];
                                            let lastIndex = 0;
                                            let match;

                                            while ((match = svgRegex.exec(cleanText)) !== null) {
                                              if (match.index > lastIndex) {
                                                parts.push(<span key={`text-${lastIndex}`}>{cleanText.substring(lastIndex, match.index)}</span>);
                                              }
                                              parts.push(
                                                <div 
                                                  key={`svg-${match.index}`} 
                                                  className="my-4 flex justify-center w-full overflow-x-auto bg-white/50 p-2 sm:p-4 rounded-xl border border-blue-100 [&>svg]:max-w-full [&>svg]:h-auto"
                                                  dangerouslySetInnerHTML={{ __html: match[0] }} 
                                                />
                                              );
                                              lastIndex = svgRegex.lastIndex;
                                            }

                                            if (lastIndex < cleanText.length) {
                                              parts.push(<span key={`text-${lastIndex}`}>{cleanText.substring(lastIndex)}</span>);
                                            }

                                            return parts.length > 0 ? parts : cleanText;
                                          })()}
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                                {isAnswering && (
                                  <motion.div 
                                    key="answering-indicator"
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }}
                                    className="flex justify-center w-full"
                                  >
                                    <div className="bg-white border-2 border-blue-100 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-sm text-center">
                                      <div className="flex gap-1 justify-center">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="pt-6 sm:pt-10 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 text-center sm:text-left">
                          <p className="text-blue-600 font-black italic text-lg sm:text-xl">"{problem.loi_dong_vien}"</p>
                          <button
                            onClick={() => fetchProblem(selectedTopic, selectedLevel)}
                            className="flex items-center justify-center gap-2 sm:gap-3 px-6 py-4 sm:px-10 sm:py-5 bg-gray-900 text-white rounded-xl sm:rounded-2xl font-black text-lg sm:text-xl hover:bg-black transition-all shadow-xl sm:shadow-2xl uppercase tracking-tighter w-full sm:w-auto"
                          >
                            <RotateCcw size={20} className="sm:w-6 sm:h-6" />
                            Thử thách mới
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16 border-t-2 sm:border-t-4 border-white/30 mt-10 sm:mt-20 bg-white/40 backdrop-blur-md rounded-t-3xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-600 font-black uppercase tracking-widest text-center">
          <p>© 2026 TIN HỌC TRẺ BẢNG M1</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-10">
            <a href="#" className="hover:text-blue-600 transition-colors">Học liệu</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Cộng đồng</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Hỗ trợ</a>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
