import React from 'react';
import { Layers, Volume2, ListOrdered, Undo2, HardDrive, History, FileUp, Cpu } from 'lucide-react';

export default function UseCases() {
  const listCases = [
    {
      title: 'Lista de Reprodução de Músicas',
      description: 'Em um player de música, você quer poder adicionar/remover faixas em tempo de execução, bem como navegar "próxima" e "anterior" instantaneamente sem reinstanciar ou deslocar índices na memória.',
      structure: 'LinkedList',
      reason: 'Cada faixa é um nó e aponta diretamente para a próxima (e anterior em listas duplamente ligadas). As transições são imediatas e eficientes sem deslocar índices.',
      icon: Volume2,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Sistema de Undo/Redo (Desfazer/Refazer)',
      description: 'Editores de texto e de foto mantêm uma pilha de ações. Ao realizar um novo comando de edição, o estado é empilhado no início ou no fim da fila com extrema eficiência e sem limites estritos de tamanho inicial.',
      structure: 'LinkedList',
      reason: 'Inserções frequentes no início da lista (nó "cabeça" representando o histórico mais recente) ocorrem em velocidade O(1), permitindo manipulação ultrarrápida de desfazer sem custos de cópia de Array.',
      icon: Undo2,
      iconBg: 'bg-emerald-100 text-emerald-700',
    },
    {
      title: 'Gerenciador de Buffer / Filas no SPOOL de Impressora',
      description: 'Tarefas de impressão entram em uma fila sequencial conforme são emitidas. Elas precisam de inserção no final e remoção no topo (First-In, First-Out) de forma constante e fluida.',
      structure: 'LinkedList',
      reason: 'Remover da frente em uma LinkedList consome tempo fixo O(1). Se fizéssemos com ArrayList, toda vez que uma página terminasse de imprimir, a fila inteira de trás teria que ser copiada para a esquerda para preencher o slot zero.',
      icon: ListOrdered,
      iconBg: 'bg-emerald-50 text-emerald-600',
    }
  ];

  const arrayCases = [
    {
      title: 'Base de Dados para Busca Binária ou Randomizada',
      description: 'Sistemas que lêem coleções gigantes de registros estáticos (como nomes de cidades, códigos postais ou dicionários indexados) e realizam buscas por índice ou busca binária.',
      structure: 'ArrayList',
      reason: 'O acesso a qualquer elemento aleatório se dá em tempo constante O(1). Na LinkedList, para ler a cidade no índice 5.000, o programa teria que seguir 5.000 ponteiros, o que destruiria a performance.',
      icon: HardDrive,
      iconBg: 'bg-sky-50 text-sky-600',
    },
    {
      title: 'Sistemas de Renderização de Games (Matrizes/Loops)',
      description: 'Em jogos, é necessário iterar e atualizar as coordenadas de milhares de projéteis de partículas ou entidades a cada ciclo (frame) renderizado de forma extremamente rápida.',
      structure: 'ArrayList',
      reason: 'Os elementos do ArrayList ficam compactados lado a lado na memória de forma sequencial. A CPU lê blocos inteiros de uma vez, reduzindo travamentos e otimizando a localidade do cache.',
      icon: Cpu,
      iconBg: 'bg-sky-100 text-sky-700',
    },
    {
      title: 'Histórico Estático de Transações Financieiras',
      description: 'Uma lista de extratos bancários de um mês de um usuário. Os dados são carregados de uma vez no início da sessão e são predominantemente consultados e listados na tela sequencialmente.',
      structure: 'ArrayList',
      reason: 'Os dados quase nunca são inseridos no início ou no meio após carregados. A eficiência de leitura aleatória e menor pegada física de memória do ArrayList justificam seu uso.',
      icon: History,
      iconBg: 'bg-sky-50 text-sky-600',
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="usecases-section">
      {/* ArrayList Panel */}
      <div className="bg-surface rounded-sm border border-zinc-200 shadow-elevation-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-zinc-100">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-zinc-100 text-zinc-800 border border-zinc-350 px-2 py-0.5 rounded-sm">
              ESTÁTICO / RANDOM
            </span>
            <h3 className="font-display font-bold text-base text-zinc-900 uppercase tracking-wide">Quando escolher ArrayList</h3>
          </div>
          
          <div className="space-y-6">
            {arrayCases.map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className="flex gap-4 border-b border-dashed border-zinc-200 pb-5 last:border-0 last:pb-0">
                  <div className="p-2.5 bg-zinc-100 text-zinc-900 border border-zinc-200 h-fit rounded-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-zinc-900 font-display uppercase tracking-wide">{c.title}</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed font-sans">{c.description}</p>
                    <div className="mt-2 bg-zinc-50 rounded-sm p-3 border border-zinc-200/60">
                      <p className="text-xs text-zinc-700 leading-normal font-sans">
                        <strong className="font-semibold text-zinc-900 font-mono text-[10px] uppercase">Vantagem Prática:</strong> {c.reason}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* LinkedList Panel */}
      <div className="bg-surface rounded-sm border border-zinc-200 shadow-elevation-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-zinc-100">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-zinc-900 text-white px-2 py-0.5 rounded-sm">
              DINÂMICO / ITERATIVO
            </span>
            <h3 className="font-display font-bold text-base text-zinc-900 uppercase tracking-wide">Quando escolher LinkedList</h3>
          </div>

          <div className="space-y-6">
            {listCases.map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className="flex gap-4 border-b border-dashed border-zinc-200 pb-5 last:border-0 last:pb-0">
                  <div className="p-2.5 bg-zinc-950 text-white border border-zinc-950 h-fit rounded-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-zinc-900 font-display uppercase tracking-wide">{c.title}</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed font-sans">{c.description}</p>
                    <div className="mt-2 bg-zinc-50 rounded-sm p-3 border border-zinc-200/60">
                      <p className="text-xs text-zinc-700 leading-normal font-sans">
                        <strong className="font-semibold text-zinc-900 font-mono text-[10px] uppercase">Vantagem Prática:</strong> {c.reason}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
