import React from 'react';
import { Table, LayoutGrid, Clock, ShieldCheck } from 'lucide-react';

export default function ComplexityTable() {
  const operations = [
    {
      name: 'Acesso por Índice (get(i))',
      arrayList: 'O(1)',
      arrayListDesc: 'Acesso direto por cálculo de offset na memória contígua.',
      arrayListType: 'best',
      linkedList: 'O(N)',
      linkedListDesc: 'Precisa percorrer todos os nós anteriores de forma sequencial.',
      linkedListType: 'bad',
    },
    {
      name: 'Inserção no Início (addFirst)',
      arrayList: 'O(N)',
      arrayListDesc: 'Exige o deslocamento de todos os elementos para a direita.',
      arrayListType: 'bad',
      linkedList: 'O(1)',
      linkedListDesc: 'Apenas cria o nó e redireciona o link da cabeça (head).',
      linkedListType: 'best',
    },
    {
      name: 'Inserção no Fim (addLast)',
      arrayList: 'O(1) Amortizado',
      arrayListDesc: 'Inserção instantânea, exceto quando o array interno atinge o limite e precisa redimensionar.',
      arrayListType: 'best',
      linkedList: 'O(1)',
      linkedListDesc: 'Inserção instantânea se mantivermos o ponteiro de cauda (tail).',
      linkedListType: 'best',
    },
    {
      name: 'Remoção no Início (removeFirst)',
      arrayList: 'O(N)',
      arrayListDesc: 'Exige o deslocamento de todos os elementos restantes para a esquerda.',
      arrayListType: 'bad',
      linkedList: 'O(1)',
      linkedListDesc: 'Apenas move a referência da cabeça (head = head.next).',
      linkedListType: 'best',
    },
    {
      name: 'Inserção/Remoção no Meio (add/remove no índice i)',
      arrayList: 'O(N)',
      arrayListDesc: 'Precisa deslocar os elementos posteriores para manter a contiguidade.',
      arrayListType: 'bad',
      linkedList: 'O(N)',
      linkedListDesc: 'Requer busca O(N) do nó naquele índice antes de efetuar a troca de ponteiros O(1).',
      linkedListType: 'bad',
    },
    {
      name: 'Busca por Valor (indexOf(val))',
      arrayList: 'O(N)',
      arrayListDesc: 'Varredura linear. Contudo, é muito rápido devido à localidade de cache da CPU.',
      arrayListType: 'average',
      linkedList: 'O(N)',
      linkedListDesc: 'Varredura linear pulando referências. Lento devido aos cache misses.',
      linkedListType: 'bad',
    },
  ];

  const getStyleClass = (type: string) => {
    switch (type) {
      case 'best':
        return 'bg-secondary text-white font-mono font-bold border border-secondary px-2 py-0.5 text-[10px] tracking-wide inline-block rounded-sm';
      case 'average':
        return 'bg-zinc-100 text-zinc-800 font-mono font-bold border border-zinc-350 px-2 py-0.5 text-[10px] tracking-wide inline-block rounded-sm';
      case 'bad':
        return 'bg-zinc-950 text-white font-mono font-bold border border-zinc-950 px-2 py-0.5 text-[10px] tracking-wide inline-block rounded-sm';
      default:
        return 'bg-zinc-50 text-zinc-600 font-mono border border-zinc-200 px-2 py-0.5 text-[10px] tracking-wide inline-block rounded-sm';
    }
  };

  return (
    <div className="bg-surface rounded-sm border border-zinc-200 shadow-elevation-1 p-6 overflow-hidden animate-fade-in" id="complexity-section">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100">
        <div className="p-2 h-fit rounded-none bg-zinc-950 text-white">
          <Table className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-display font-bold text-base text-zinc-900 uppercase tracking-wider">Tabela de Complexidade Big-O</h2>
          <p className="text-xs text-zinc-500 font-sans mt-1">Análise teórica das duas estruturas em termos de instrução computacional.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-sans text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 text-[10px] font-bold uppercase tracking-wider bg-zinc-50">
              <th className="py-3 px-4 font-mono">Operação</th>
              <th className="py-3 px-4 font-mono text-center">ArrayList (Vetor Contínuo)</th>
              <th className="py-3 px-4 font-mono text-center">LinkedList (Nós Conectados)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {operations.map((op, idx) => (
              <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                <td className="py-4 px-4 font-semibold text-zinc-900 font-mono text-xs align-top">
                  {op.name}
                </td>
                <td className="py-4 px-4 align-top text-center border-r border-zinc-100/50 max-w-[260px] md:max-w-none">
                  <span className={getStyleClass(op.arrayListType)}>
                    {op.arrayList}
                  </span>
                  <p className="text-xs text-zinc-500 mt-2 text-left md:text-center leading-relaxed font-sans">{op.arrayListDesc}</p>
                </td>
                <td className="py-4 px-4 align-top text-center max-w-[260px] md:max-w-none">
                  <span className={getStyleClass(op.linkedListType)}>
                    {op.linkedList}
                  </span>
                  <p className="text-xs text-zinc-500 mt-2 text-left md:text-center leading-relaxed font-sans">{op.linkedListDesc}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-zinc-200 bg-zinc-50/50 -mx-6 -mb-6 p-6">
        <div className="flex gap-3">
          <div className="p-1.5 h-fit rounded-none bg-zinc-100 text-zinc-800 border border-zinc-200 mt-0.5">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-display">Uso de Memória</h4>
            <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
              <strong>ArrayList:</strong> Excelente densidade. Armazena apenas o array físico cru, com um pequeno espaço extra de buffer de capacidade para expansão posterior. <br/>
              <strong>LinkedList:</strong> Sobrecarga permanente (overhead). Cada item consome dados adicionais significativos só para guardar os links do ponteiro de memória para o próximo nó.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="p-1.5 h-fit rounded-none bg-zinc-100 text-zinc-800 border border-zinc-200 mt-0.5">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-display">Localidade de Referência (Cache CPU)</h4>
            <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
              <strong>ArrayList:</strong> Máximo rendimento prático. Sendo sequencial em memória, a CPU puxa dados adjacentes para a cache ultrarrápida L1/L2 de imediato (Hardware Prefetching). <br/>
              <strong>LinkedList:</strong> Desempenho limitado em loops. Apontar para endereços fragmentados na Heap gera <em>cache misses</em> severos, retardando execuções de busca sequencial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
