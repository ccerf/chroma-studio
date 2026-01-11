import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { ColorState } from './types';
import { generateHarmoniousPalette, mixColors, getColorName, ensureUniqueNames } from './utils/colorUtils';
import { generatePaletteFromPrompt } from './services/geminiService';
import ColorSegment from './components/ColorSegment';
import { SparklesIcon, RefreshIcon } from './components/Icons';

const App: React.FC = () => {
  const [colors, setColors] = useState<ColorState[]>(() => {
    const initialHexes = generateHarmoniousPalette(5);
    const initialNames = ensureUniqueNames(initialHexes.map(hex => ({ hex, name: getColorName(hex) })));
    return initialHexes.map((hex, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      hex,
      isLocked: false,
      name: initialNames[i]
    }));
  });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const refreshUniqueNames = (currentColors: ColorState[]) => {
    const names = ensureUniqueNames(currentColors.map(c => ({ hex: c.hex, name: getColorName(c.hex) })));
    return currentColors.map((c, i) => ({ ...c, name: names[i] }));
  };

  const generateNewColors = useCallback(() => {
    const freshHexes = generateHarmoniousPalette(colors.length);
    setColors(prev => {
      const updated = prev.map((c, i) => {
        if (c.isLocked) return c;
        const newHex = freshHexes[i] || generateHarmoniousPalette(1)[0];
        return { ...c, hex: newHex, name: getColorName(newHex) };
      });
      return refreshUniqueNames(updated);
    });
  }, [colors.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        generateNewColors();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generateNewColors]);

  const toggleLock = (id: string) => {
    setColors(prev => prev.map(c => c.id === id ? { ...c, isLocked: !c.isLocked } : c));
  };

  const removeColor = (id: string) => {
    if (colors.length <= 2) return;
    setColors(prev => refreshUniqueNames(prev.filter(c => c.id !== id)));
  };

  const updateHex = (id: string, newHex: string) => {
    if (!/^#[0-9A-F]{0,6}$/i.test(newHex)) return;
    setColors(prev => {
      const updated = prev.map(c => 
        c.id === id ? { 
          ...c, 
          hex: newHex.length === 7 ? newHex.toUpperCase() : newHex,
          name: newHex.length === 7 ? getColorName(newHex) : c.name
        } : c
      );
      return newHex.length === 7 ? refreshUniqueNames(updated) : updated;
    });
  };

  const insertBetween = (index: number) => {
    if (colors.length >= 10) return;
    const c1 = colors[index];
    const c2 = colors[index + 1];
    const newHex = mixColors(c1.hex, c2.hex);
    const newColor: ColorState = {
      id: Math.random().toString(36).substr(2, 9),
      hex: newHex,
      isLocked: false,
      name: getColorName(newHex)
    };
    const newPalette = [...colors];
    newPalette.splice(index + 1, 0, newColor);
    setColors(refreshUniqueNames(newPalette));
  };

  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const aiPalette = await generatePaletteFromPrompt(aiPrompt);
      const newColors: ColorState[] = aiPalette.colors.slice(0, 8).map((c) => ({
        id: Math.random().toString(36).substr(2, 9),
        hex: c.hex.startsWith('#') ? c.hex.toUpperCase() : '#' + c.hex.toUpperCase(),
        isLocked: false,
        name: c.name || getColorName(c.hex)
      }));
      setColors(refreshUniqueNames(newColors));
      setAiPrompt('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-white dot-grid relative">
      {/* Header with softer appearance */}
      <header className="tech-bar-light h-16 grid grid-cols-3 items-center px-8 z-[100] shrink-0 border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
            <div className="w-2 h-2 bg-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[11px] font-black tracking-[0.4em] text-slate-900 leading-none">CHROMA</h1>
            <span className="text-[8px] font-bold text-indigo-500 uppercase tracking-[0.2em] mt-1 opacity-80">STUDIO</span>
          </div>
        </div>

        <div className="flex justify-center">
          <form onSubmit={handleAiGenerate} className="relative w-full max-w-[380px]">
            <input 
              type="text" 
              placeholder="Describe a mood, brand or theme..." 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-md h-10 pl-11 pr-4 text-[11px] font-medium tracking-wide focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 focus:outline-none placeholder-slate-400"
            />
            <SparklesIcon size={14} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isAiLoading ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}`} />
            {isAiLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
            )}
          </form>
        </div>

        <div className="flex items-center justify-end gap-6">
          <button 
            onClick={generateNewColors}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 hover:text-indigo-600 transition-all group"
          >
            <RefreshIcon size={14} className="group-hover:rotate-180 transition-transform duration-700" />
            Remix
          </button>
          <button 
            onClick={() => {
              const hexList = colors.map(c => c.hex).join(', ');
              navigator.clipboard.writeText(hexList);
            }}
            className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-md text-[10px] font-black tracking-widest transition-all active:scale-95 shadow-sm"
          >
            EXPORT
          </button>
        </div>
      </header>

      {/* Main Canvas with Corrected Add-Button Positioning */}
      <main className="flex-1 flex overflow-x-auto no-scrollbar relative items-stretch">
        {colors.map((color, index) => (
          <Fragment key={color.id}>
            <div className="flex-1 min-w-[160px] h-full relative group">
              <ColorSegment 
                color={color} 
                onToggleLock={toggleLock}
                onRemove={removeColor}
                onHexChange={updateHex}
              />
              
              {/* Perfectly Centered Add Button Zone */}
              {index < colors.length - 1 && (
                <div className="absolute inset-y-0 right-0 w-12 translate-x-1/2 flex items-center justify-center z-50 pointer-events-none gap-zone">
                  <button 
                    onClick={() => insertBetween(index)}
                    className="add-btn-trigger pointer-events-auto w-10 h-10 bg-white text-slate-900 shadow-xl rounded-lg flex items-center justify-center border border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all active:scale-90"
                    title="Insert Color"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </Fragment>
        ))}
      </main>

      {/* Footer with softer appearance */}
      <footer className="h-10 px-8 flex items-center justify-between tech-bar-light border-t border-slate-200 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mono">ENGINE_STATUS: STABLE</p>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mono hidden sm:block">HOTKEY: [SPACE] FOR NEW_SYNTH</p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mono uppercase">CHROMA_OS.CORE</p>
        </div>
      </footer>
    </div>
  );
};

export default App;