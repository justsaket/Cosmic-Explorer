import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../quiz/quizData';
import {
  GraduationCap, CheckCircle2, XCircle, ArrowRight,
  RotateCcw, Sparkles, X, Award
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { narrationManager } from '../narration/narrationManager';
import { getQuizFeedbackLine } from '../narration/storyDialogue';
import confetti from 'canvas-confetti';

interface QuizModalProps {
  onRecordScore: (quizId: string, scorePercent: number) => void;
  onClose: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  onRecordScore,
  onClose
}) => {
  const [selectedPlanet, setSelectedPlanet] = useState<'all' | 'moon' | 'mars'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const activeQuestions = React.useMemo(() => {
    if (selectedPlanet === 'all') return QUIZ_QUESTIONS;
    return QUIZ_QUESTIONS.filter(q => q.planetId === selectedPlanet);
  }, [selectedPlanet]);

  const currentQ = activeQuestions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isSubmitted) return;
    soundManager.playPing();
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isSubmitted) return;
    setIsSubmitted(true);

    const isCorrect = selectedOption === currentQ.correctIndex;
    if (isCorrect) {
      soundManager.playQuizSuccess();
      setScore(prev => prev + 1);
    } else {
      soundManager.playQuizFail();
    }

    narrationManager.speak(
      getQuizFeedbackLine({
        isCorrect,
        explanation: currentQ.explanation,
        funFact: currentQ.funFact
      }),
      { priority: 'high' }
    );
  };

  const handleNextQuestion = () => {
    soundManager.playPing();
    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setIsFinished(true);
      const total = activeQuestions.length;
      const finalScore = score;
      const percent = Math.round((finalScore / total) * 100);
      onRecordScore(`quiz_${selectedPlanet}`, percent);

      if (percent >= 70) {
        soundManager.playMissionComplete();
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
        narrationManager.speak(
          `Incredible work, Explorer! You scored ${finalScore} out of ${total}. You're ready for deep-space command!`,
          { priority: 'high' }
        );
      } else {
        narrationManager.speak(
          `Nice journey through the Academy Quiz! You scored ${finalScore} out of ${total}—every question brings us closer to mastering the stars.`,
          { priority: 'high' }
        );
      }
    }
  };

  const handleRestart = () => {
    soundManager.playPing();
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div
      data-testid="quiz-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 animate-fade-in"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden hud-glow">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                Planetary Academy Quiz
              </h2>
              <p className="text-xs text-slate-400">
                Test your understanding of verified lunar and Martian science
              </p>
            </div>
          </div>

          <button
            aria-label="Close Quiz"
            onClick={() => {
              soundManager.playPing();
              onClose();
            }}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Planet filter bar if not finished */}
        {!isFinished && (
          <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-mono-tech">
              <span className="text-slate-400">EXAM SUBJECT:</span>
              <button
                onClick={() => {
                  setSelectedPlanet('all');
                  handleRestart();
                }}
                className={`px-2 py-0.5 rounded transition ${selectedPlanet === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Comprehensive
              </button>
              <button
                onClick={() => {
                  setSelectedPlanet('moon');
                  handleRestart();
                }}
                className={`px-2 py-0.5 rounded transition ${selectedPlanet === 'moon' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Moon
              </button>
              <button
                onClick={() => {
                  setSelectedPlanet('mars');
                  handleRestart();
                }}
                className={`px-2 py-0.5 rounded transition ${selectedPlanet === 'mars' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Mars
              </button>
            </div>

            <div className="font-mono-tech text-cyan-400">
              Question {currentIndex + 1} of {activeQuestions.length}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isFinished ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="p-4 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 mb-4 animate-bounce">
                <Award className="w-12 h-12" />
              </div>

              <h3 className="text-2xl font-bold font-display text-white mb-1">
                Academy Assessment Complete!
              </h3>
              
              <div className="text-3xl font-mono-tech font-bold text-cyan-400 my-3">
                {score} / {activeQuestions.length} Correct
              </div>

              <p className="text-sm text-slate-300 max-w-md mb-6">
                {score === activeQuestions.length
                  ? 'Outstanding performance! You have demonstrated true mastery of planetary physics and space exploration geology.'
                  : score >= activeQuestions.length * 0.7
                  ? 'Commendable score, Explorer! Your scientific knowledge of the Moon and Mars qualifies you for deep-space certification.'
                  : 'Good effort, Cadet. Continue exploring surface landmarks and reviewing discoveries in your backpack to deepen your knowledge.'}
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
                >
                  <RotateCcw className="w-4 h-4" /> Retake Exam
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-lg"
                >
                  Return to Exploration
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Question Statement */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[11px] uppercase font-mono-tech text-cyan-400 mb-1">
                  Topic: {currentQ.planetId.toUpperCase()} • {currentQ.difficulty.toUpperCase()}
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white leading-snug">
                  {currentQ.question}
                </h3>
              </div>

              {/* 4 Multiple Choice Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctIndex;

                  let optionStyle = 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-200';
                  if (isSelected && !isSubmitted) {
                    optionStyle = 'bg-cyan-500/20 border-cyan-400 text-white hud-glow';
                  } else if (isSubmitted) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-rose-500/20 border-rose-500 text-rose-200';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isSubmitted}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition flex items-center justify-between gap-3 ${optionStyle}`}
                    >
                      <span>{option}</span>
                      {isSubmitted && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {isSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Constructive Feedback when submitted */}
              {isSubmitted && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 animate-fade-in space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase font-mono-tech">
                    {selectedOption === currentQ.correctIndex ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Spot On — Correct Answer!
                      </span>
                    ) : (
                      <span className="text-amber-300 flex items-center gap-1">
                        <Sparkles className="w-4 h-4" /> Almost There — Let&apos;s Explore Why!
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {currentQ.explanation}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 text-xs text-amber-300/90 italic flex items-start gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Fun Fact: {currentQ.funFact}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {!isFinished && (
          <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs font-mono-tech text-slate-400">
              Current Score: <span className="text-cyan-400 font-bold">{score}</span>
            </div>

            {!isSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className={`py-2 px-5 rounded-xl font-bold text-xs sm:text-sm transition ${
                  selectedOption !== null
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 py-2 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm transition"
              >
                {currentIndex + 1 < activeQuestions.length ? 'Next Question' : 'View Results'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
