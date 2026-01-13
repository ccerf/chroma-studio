import React, { useState } from 'react';
import { ColorState } from '../types';
import { getTextColor, getContrastStatus, hexToRgb, hexToHsl } from '../utils/colorUtils';
import { LockIcon, UnlockIcon, CopyIcon, TrashIcon } from './Icons';

interface ColorSegmentProps {
  color: ColorState;
  onToggleLock: (id: string) => void;
  onRemove: (id: string) => void;
  onHexChange: (id: string, newHex: string) => void;
}

const ColorSegment: React.FC<ColorSegmentProps> = ({ color, onToggleLock, onRemove, onHexChange }) => {
  const [isCopied, setIsCopied] = useState(false);
  const textColor = getTextColor(color.hex);
  const contrast = getContrastStatus(color.hex);
  const rgb = hexToRgb(color.hex);
  const hsl = hexToHsl(color.hex);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(color.hex);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getContrastLabel = (status: string) => {
    if (status === 'AAA') return 'Contrast: Great (AAA)';
    if (status === 'AA') return 'Contrast: Good (AA)';
    return 'Contrast: Low';
  };

  return (
    <div 
      className={`h-full w-full segment-transition relative flex flex-col items-center justify-between py-12 px-4 border-r border-slate-900/5 last:border-r-0`}
      style={{ backgroundColor: color.hex }}
    >
      {/* Enhanced Technical Data Header */}
      <div 
        className="flex flex-col items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ color: textColor }}
      >
        <div className="px-2.5 py-1 border border-current/20 rounded-md bg-white/5 backdrop-blur-sm">
           <span className="text-[12px] font-black tracking-widest mono uppercase">{getContrastLabel(contrast)}</span>
        </div>
        <span className="text-[10px] font-bold mono opacity-40 tracking-tight">
          DATA_NODE: {rgb?.r}_{rgb?.g}_{rgb?.b}
        </span>
      </div>

      {/* Primary Identifier: HEX & Design Naming */}
      <div className="flex flex-col items-center gap-3 z-10 w-full" style={{ color: textColor }}>
        <div className="relative flex flex-col items-center w-full">
          <input 
            type="text" 
            value={color.hex.replace('#', '')} 
            onChange={(e) => onHexChange(color.id, '#' + e.target.value)}
            className="text-xl font-black bg-transparent border-none text-center focus:outline-none focus:ring-0 uppercase w-full cursor-pointer tracking-[0.1em] mono hover:bg-current/10 rounded-md transition-all py-1.5"
            maxLength={6}
          />
          <div className="w-10 h-[1.5px] bg-current opacity-30 mt-1" />
        </div>
        <p className="text-[12px] font-black uppercase tracking-[0.25em] text-center truncate w-full px-2 opacity-80 mono">
          {color.name}
        </p>
      </div>

      {/* Interaction Interface */}
      <div className="flex flex-col items-center gap-6" style={{ color: textColor }}>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-400">
          <button 
            onClick={copyToClipboard}
            className="p-2.5 hover:bg-current/10 rounded-md border border-transparent hover:border-current/10 transition-all relative"
            title="Copy Hex"
          >
            {isCopied && (
              <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 text-[7px] font-black bg-slate-900 text-white px-2 py-1 rounded-md shadow-2xl z-50 mono">
                COPIED
              </span>
            )}
            <CopyIcon size={14} />
          </button>
          
          <button 
            onClick={() => onRemove(color.id)}
            className="p-2.5 hover:bg-current/10 rounded-md border border-transparent hover:border-current/10 transition-all"
            title="Eject Segment"
          >
            <TrashIcon size={14} />
          </button>

          <button 
            onClick={() => onToggleLock(color.id)}
            className={`p-2.5 rounded-md border transition-all ${color.isLocked ? 'bg-current/15 border-current/40' : 'hover:bg-current/10 border-transparent hover:border-current/10'}`}
            title="Pin Column"
          >
            {color.isLocked ? <LockIcon size={14} /> : <UnlockIcon size={14} />}
          </button>
        </div>
        
        <span className="text-[10px] mono opacity-30 font-bold uppercase tracking-widest">{hsl}</span>
      </div>

      {/* Anchor for Locked State */}
      {color.isLocked && (
        <div className="absolute top-10 left-6 flex flex-col items-center gap-2 opacity-40 pointer-events-none">
           <div className="w-[3px] h-6 bg-current rounded-full" />
           <span className="text-[6px] mono font-black vertical-text uppercase tracking-widest" style={{ color: textColor, writingMode: 'vertical-rl' }}>LOCKED_CELL</span>
        </div>
      )}
      
      {/* Subtle depth overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
    </div>
  );
};

export default ColorSegment;
