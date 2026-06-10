import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CornerRightDown } from 'lucide-react';

interface LinkedListNodeProps {
  id: string;
  value: string;
  isHighlighted: boolean;
  isNew?: boolean;
  nextId: string | null;
  nodeIndex: number;
  totalNodes: number;
}

interface LinkedListVisualizerProps {
  nodes: {
    id: string;
    value: string;
    isHighlighted: boolean;
    nextId: string | null;
    isNew?: boolean;
  }[];
  headId: string | null;
  activePointer?: { from: string; to: string | null; label: string } | null;
}

export default function LinkedListVisualizer({ nodes, headId, activePointer }: LinkedListVisualizerProps) {
  // Separa os nós normais (que pertencem à lista conectada) do nó "novo" em flutuação (criado temporariamente no degrau da animação)
  const connectedNodes = nodes.filter((n) => !n.isNew);
  const newNodes = nodes.filter((n) => n.isNew);

  return (
    <div className="bg-surface border border-zinc-200 shadow-elevation-1 p-6 overflow-hidden rounded-sm" id="linkedlist-visualizer-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-100">
        <div>
          <h4 className="font-display font-bold text-sm text-on-surface uppercase tracking-wider">LinkedList <span className="text-xs font-mono font-normal text-zinc-400 lowercase">(Lista Encadeada Simples)</span></h4>
          <p className="text-xs text-zinc-500 font-sans mt-1">Nós dispersos alocados na Heap, linkados por referências de ponteiros.</p>
        </div>
        <div className="flex gap-2 text-[10px] font-mono select-none">
          <span className="bg-zinc-900 text-white px-2.5 py-0.5 border border-zinc-900 rounded-sm">
            HEAD: {headId ? '0x' + headId.replace(/node-|-new|-/g, '').toUpperCase().slice(0, 4) : 'NULL'}
          </span>
        </div>
      </div>

      {/* Área Principal de Renderização */}
      <div className="relative min-h-[190px] flex flex-col justify-end w-full pb-2">
        
        {/* Seção de Nó Em Espera (Nó sendo criado/modificado) */}
        {newNodes.length > 0 && (
          <div className="absolute top-0 left-6 flex items-center gap-2" id="new-node-container">
            <span className="text-[8px] font-bold bg-primary/10 text-primary px-2 py-0.5 uppercase font-mono tracking-wider border border-primary/20 rounded-sm">
              Allocating on Heap
            </span>
            {newNodes.map((node) => (
              <motion.div
                key={node.id}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center scale-95 origin-left"
              >
                {/* Visual Classico de Nó em Heap */}
                <div className="flex border-[1.5px] border-primary rounded-sm bg-white shadow-sm overflow-hidden">
                  <div className="bg-primary/10 px-3 py-2 flex flex-col items-center justify-center border-r-[1.5px] border-primary min-w-[50px]">
                    <span className="text-[7px] uppercase font-mono text-primary font-bold">Data</span>
                    <span className="font-display font-bold text-zinc-900 text-base">{node.value}</span>
                  </div>
                  <div className="px-3 py-2 flex flex-col items-center justify-center bg-zinc-50 min-w-[50px]">
                    <span className="text-[7px] uppercase font-mono text-zinc-400">Next</span>
                    <div className="w-2.5 h-2.5 rounded-sm bg-zinc-900 relative mt-1">
                      <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-primary-variant" />
                    </div>
                  </div>
                </div>

                {/* Seta indicando o link do novo nó */}
                <div className="flex flex-col items-center px-3 text-primary">
                  <CornerRightDown className="w-5 h-5 animate-bounce mt-1" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Linha das Conexões e Ponteiros Principais */}
        <div className="w-full overflow-x-auto pb-4 pt-10 scrollbar-thin">
          <div className="flex items-center gap-0 min-w-max px-4">
            
            {/* Cabeça da Lista (HEAD badge) */}
            <div className="flex flex-col items-center mr-4">
              <span className="text-[9px] font-mono font-bold bg-zinc-900 text-white px-2 py-0.5 border border-zinc-900 tracking-widest rounded-sm">
                HEAD
              </span>
              <ArrowRight className="w-4 h-4 text-zinc-900 my-1.5" />
            </div>

            {connectedNodes.length === 0 ? (
              <div className="flex border border-dashed border-zinc-300 rounded-sm px-5 py-4 bg-zinc-50 text-zinc-400 text-xs font-mono font-medium">
                Empty List (NULL)
              </div>
            ) : (
              connectedNodes.map((node, idx) => {
                const isLast = idx === connectedNodes.length - 1;
                // Simulação de endereço físico de memória para cada nó disperso na Heap
                const simulatedAddress = '0x' + (2850 + idx * 89).toString(16).toUpperCase();
                
                return (
                  <div key={node.id} className="flex items-center">
                    
                    {/* O Nó (Split Cell: Valor + Ponteiro) */}
                    <motion.div
                      layoutId={node.id}
                      className={`flex border-[1.5px] rounded-sm bg-white shadow-sm overflow-hidden transition-all duration-200 ${
                        node.isHighlighted
                          ? 'border-zinc-950 bg-zinc-950 text-white ring-1 ring-zinc-950'
                          : 'border-zinc-300 hover:border-zinc-400'
                      }`}
                    >
                      {/* Lado Esquerdo: Valor (Dado) */}
                      <div className={`px-4 py-3 flex flex-col items-center justify-center border-r-[1.5px] ${
                        node.isHighlighted ? 'border-zinc-800 bg-zinc-900 text-white' : 'border-zinc-200 bg-white'
                      }`}>
                        <span className={`text-[7px] uppercase font-mono font-semibold mb-0.5 select-none ${
                          node.isHighlighted ? 'text-zinc-400' : 'text-zinc-400'
                        }`}>
                          VAL
                        </span>
                        <span className="font-display font-bold text-lg">{node.value}</span>
                        <span className={`text-[6px] font-mono select-none mt-1 ${
                          node.isHighlighted ? 'text-zinc-500' : 'text-zinc-400'
                        }`}>
                          {simulatedAddress}
                        </span>
                      </div>

                      {/* Lado Direito: Próximo (Ponteiro) */}
                      <div className={`px-4 py-3 flex flex-col items-center justify-center min-w-[55px] ${
                        node.isHighlighted ? 'bg-zinc-900' : 'bg-zinc-50'
                      }`}>
                        <span className="text-[7px] uppercase font-mono text-zinc-400 font-semibold mb-1 select-none">
                          NEXT
                        </span>
                        {isLast ? (
                          <span className={`text-[10px] font-mono font-bold tracking-tight ${
                            node.isHighlighted ? 'text-zinc-400' : 'text-zinc-400'
                          }`}>
                            NULL
                          </span>
                        ) : (
                          <div className="relative flex items-center justify-center mt-1">
                            {/* Dot representando o ponteiro */}
                            <div className={`w-3.5 h-3.5 rounded-sm relative flex items-center justify-center ${
                              node.isHighlighted ? 'bg-secondary' : 'bg-zinc-800'
                            }`}>
                              <div className="w-1.5 h-1.5 bg-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Seta de Conexão entre nós consecutivas */}
                    {!isLast && (
                      <div className="flex items-center min-w-[40px] px-1 relative">
                        {/* Linha horizontal */}
                        <div className={`h-[2px] w-full ${
                          node.isHighlighted ? 'bg-secondary' : 'bg-zinc-300'
                        }`} />
                        {/* Ponta da Seta */}
                        <div className={`absolute right-1 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] ${
                          node.isHighlighted ? 'border-l-secondary' : 'border-l-zinc-300'
                        }`} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Legenda de LinkedList */}
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 items-center text-[10px] text-zinc-500 border-t border-zinc-100 pt-4 font-mono">
        <div className="flex items-center gap-2">
          <div className="flex border border-zinc-300 rounded-sm overflow-hidden">
            <div className="w-3.5 h-3.5 bg-white border-r border-zinc-200" />
            <div className="w-3.5 h-3.5 bg-zinc-50" />
          </div>
          <span>Nó [Dado | Ponteiro]</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-[2px] bg-zinc-300" />
          <span>Direção do Endereço <em>(Next)</em></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-zinc-950 border border-zinc-950 rounded-sm" />
          <span>Nó Sob Inspeção Ativa</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-zinc-900 text-white text-[8px] px-1.5 py-0.5 font-bold rounded-sm">HEAD</span>
          <span>Ponteiro de Origem</span>
        </div>
      </div>
    </div>
  );
}
