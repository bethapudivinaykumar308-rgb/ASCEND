import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Send, X, Bot, User, ArrowRight, CornerDownLeft } from 'lucide-react';

interface AITrainerDrawerProps {
  onNavigate: (route: string) => void;
}

export const AITrainerDrawer: React.FC<AITrainerDrawerProps> = ({ onNavigate }) => {
  const {
    isTrainerOpen,
    toggleTrainer,
    trainerMessages,
    sendTrainerMessage,
    careerPlan,
    activeLesson,
  } = useApp();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isTrainerOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [trainerMessages, isTrainerOpen]);

  if (!isTrainerOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isSending) return;

    const message = inputPrompt;
    setInputPrompt('');
    setIsSending(true);

    try {
      await sendTrainerMessage(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setInputPrompt(promptText);
  };

  const targetJob = careerPlan?.goal.targetJob || 'Your Target Role';

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-stone-950 border-l border-stone-850 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-stone-850 flex items-center justify-between bg-stone-900/60">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-amber-950/60 border border-amber-800/80 text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-amber-500">
              AI Career Trainer
            </div>
            <h3 className="text-sm font-display font-semibold text-stone-100">
              {targetJob} Specialist
            </h3>
          </div>
        </div>

        <button
          onClick={() => toggleTrainer(false)}
          className="p-1.5 text-stone-400 hover:text-stone-200 transition-colors"
          aria-label="Close Trainer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 border-b border-stone-850 bg-stone-900/20 flex items-center gap-2 overflow-x-auto text-[11px] font-mono text-stone-400">
        <span className="shrink-0 text-stone-500">Suggested:</span>
        <button
          onClick={() => handleQuickPrompt("Explain today's topic in detail")}
          className="shrink-0 px-2 py-1 rounded bg-stone-900 border border-stone-800 hover:text-stone-200 transition-colors"
        >
          Explain Today&apos;s Topic
        </button>
        <button
          onClick={() => handleQuickPrompt('Give me a practice coding question')}
          className="shrink-0 px-2 py-1 rounded bg-stone-900 border border-stone-800 hover:text-stone-200 transition-colors"
        >
          Generate Practice Check
        </button>
        <button
          onClick={() => handleQuickPrompt('What are my weak areas and how to fix them?')}
          className="shrink-0 px-2 py-1 rounded bg-stone-900 border border-stone-800 hover:text-stone-200 transition-colors"
        >
          Review Weak Areas
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
        {trainerMessages.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Bot className="w-8 h-8 text-amber-500/80 mx-auto" />
            <h4 className="text-sm font-semibold text-stone-200">
              Personalized Career Training
            </h4>
            <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
              Ask about technical concepts for {targetJob}, request code critiques, or get preparation guidance for today&apos;s class.
            </p>
          </div>
        ) : (
          trainerMessages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-6 h-6 rounded bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3.5 rounded-lg text-xs leading-relaxed space-y-2 ${
                    isUser
                      ? 'bg-stone-850 text-stone-100 border border-stone-750'
                      : 'bg-stone-900/80 text-stone-300 border border-stone-800'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {msg.suggestedAction && (
                    <div className="pt-2 border-t border-stone-800 flex justify-end">
                      <button
                        onClick={() => {
                          if (msg.suggestedAction?.includes('Class')) onNavigate('todays-class');
                          else if (msg.suggestedAction?.includes('Practice')) onNavigate('practice');
                          else if (msg.suggestedAction?.includes('Job Readiness')) onNavigate('progress');
                          else onNavigate('roadmap');
                          toggleTrainer(false);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 hover:text-amber-300"
                      >
                        <span>{msg.suggestedAction}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-6 h-6 rounded bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-300 shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={handleSend} className="p-3 border-t border-stone-850 bg-stone-900/40">
        <div className="relative">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={`Ask about ${targetJob} concepts, code, or mock prep...`}
            className="w-full pr-10 pl-3 py-2.5 bg-stone-950 border border-stone-800 rounded text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-stone-600 font-sans"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isSending}
            className="absolute right-2 top-2 p-1 text-stone-400 hover:text-amber-400 disabled:opacity-30 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-stone-500">
          <span>Trained on {targetJob} roadmap</span>
          <span>Press Enter to send</span>
        </div>
      </form>
    </div>
  );
};
