import React from 'react';
import { motion } from 'motion/react';

interface ArrayListVisualizerProps {
  cells: {
    value: string;
    isHighlighted: boolean;
    isNew?: boolean;
    isMoving?: boolean;
    originalIndex?: number;
  }[];
  capacity: number;
  size: number;
}

export default function ArrayListVisualizer({ cells, capacity, size }: ArrayListVisualizerProps) {
  return (
    <div className="bg-surface border border-zinc-200 shadow-elevation-1 p-6 rounded-sm" id="arraylist-visualizer-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-100">
        <div>
          <h4 className="font-display font-bold text-sm text-on-surface uppercase tracking-wider">ArrayList <span className="text-xs font-mono font-normal text-zinc-400 lowercase">(Vetor Contínuo)</span></h4>
          <p className="text-xs text-zinc-500 font-sans mt-1">Memória contígua em posições consecutivas de hardware.</p>
        </div>
        <div className="flex gap-2 text-[10px] font-mono">
          <span className="bg-zinc-100 text-zinc-700 border border-zinc-200 px-2 py-0.5 tracking-tight">
            SIZE: {size}
          </span>
          <span className="bg-zinc-900 text-white px-2 py-0.5 tracking-tight">
            CAPACITY: {capacity}
          </span>
        </div>
      </div>

      {/* Grid contendo os blocos de memória */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mt-2">
        {cells.map((cell, idx) => {
          const hasValue = cell.value !== '';
          return (
            <motion.div
              key={idx}
              layoutId={`array-cell-${idx}`}
              className={`relative flex flex-col justify-between h-20 rounded-sm transition-all duration-150 border-[1.5px] ${
                cell.isHighlighted
                  ? 'border-zinc-950 bg-zinc-950 text-white shadow-sm'
                  : cell.isNew
                  ? 'border-primary bg-primary/10'
                  : hasValue
                  ? 'border-zinc-300 bg-white'
                  : 'border-dashed border-zinc-200 bg-zinc-50'
              }`}
            >
              {/* Indicador do Índice de Memória */}
              <span className={`absolute top-1 left-1.5 text-[9px] font-mono font-bold ${
                cell.isHighlighted ? 'text-zinc-400' : 'text-zinc-400'
              }`}>
                [{idx}]
              </span>

              {/* Endereço de Memória Simulado */}
              <span className={`absolute top-1 right-1.5 text-[7px] font-mono tracking-tight ${
                cell.isHighlighted ? 'text-zinc-500' : 'text-zinc-400'
              }`}>
                0x{(1024 + idx * 4).toString(16).toUpperCase()}
              </span>

              {/* Valor do Elemento */}
              <div className="flex-1 flex items-center justify-center pt-2">
                {hasValue ? (
                   <motion.span
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`font-display font-semibold text-lg select-none ${
                      cell.isHighlighted ? 'text-white' : cell.isNew ? 'text-primary font-bold' : 'text-zinc-900'
                    }`}
                  >
                    {cell.value}
                  </motion.span>
                ) : (
                  <span className="font-mono text-[8px] text-zinc-300 tracking-wider">EMPTY</span>
                )}
              </div>

              {/* Status Indicator Bar */}
              <div
                className={`h-1 w-full ${
                  cell.isHighlighted
                    ? 'bg-secondary'
                    : cell.isNew
                    ? 'bg-primary'
                    : hasValue
                    ? 'bg-zinc-800'
                    : 'bg-transparent'
                }`}
              />
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 items-center text-[10px] text-zinc-500 border-t border-zinc-100 pt-4 font-mono">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-white border border-zinc-300 rounded-sm" />
          <span>Valor Guardado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-zinc-950 border border-zinc-950 rounded-sm" />
          <span>Em Foco (Lido/Pesquisado)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-primary/10 border border-primary rounded-sm" />
          <span>Novo Valor Inserido</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-zinc-50 border border-dashed border-zinc-200 rounded-sm" />
          <span>Memória Livre Alocada</span>
        </div>
      </div>
    </div>
  );
}
