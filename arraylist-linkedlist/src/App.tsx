import React, { useState, useEffect, useRef } from 'react';
import {
  FerrisWheel,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Search,
  Eye,
  Plus,
  Trash2,
  Sliders,
  TrendingUp,
  Award,
  HelpCircle,
  LayoutGrid,
  List,
  FileCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Importando os componentes customizados
import ArrayListVisualizer from './components/ArrayListVisualizer';
import LinkedListVisualizer from './components/LinkedListVisualizer';
import ComplexityTable from './components/ComplexityTable';
import UseCases from './components/UseCases';
import JMHBenchmark from './components/JMHBenchmark';

// Importando utilitários e tipos
import { generateSteps } from './utils/stepsGenerator';
import { runBenchmarkSuite } from './utils/benchmark';
import { VisualStep, BenchmarkResult } from './types';

export default function App() {
  // --- ESTADO DA LISTA INTERATIVA ---
  const [currentList, setCurrentList] = useState<string[]>(['A', 'B', 'C', 'D']);
  const [inputValue, setInputValue] = useState<string>('E');
  const [inputIndex, setInputIndex] = useState<number>(2);
  const [searchVal, setSearchVal] = useState<string>('C');

  // --- ESTADO DA ANIMAÇÃO (PASSO A PASSO) ---
  const [steps, setSteps] = useState<VisualStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1200); // ms por passo
  const [lastOperation, setLastOperation] = useState<string>('');
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- ESTADO DO BENCHMARK ---
  const [benchmarkSize, setBenchmarkSize] = useState<number>(10000);
  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[]>([]);
  const [benchmarkViewMode, setBenchmarkViewMode] = useState<'cards' | 'list'>('cards');
  const [activeTab, setActiveTab] = useState<'visual' | 'performance' | 'usecases' | 'bigo' | 'jmh'>('visual');

  // --- AUTO-PLAY EFFECT ---
  useEffect(() => {
    if (isPlaying && steps.length > 0) {
      playTimerRef.current = setTimeout(() => {
        if (currentStepIdx < steps.length - 1) {
          setCurrentStepIdx((prev) => prev + 1);
        } else {
          setIsPlaying(false); // Fim da animação
        }
      }, playSpeed);
    } else {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    }

    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [isPlaying, currentStepIdx, steps, playSpeed]);

  // --- INICIADOR DE OPERAÇÕES ---
  const handleStartOperation = (type: string, value?: string, index?: number) => {
    setIsPlaying(false);
    
    // Configura os parâmetros
    let targetIndex = index !== undefined ? index : inputIndex;
    let targetValue = value !== undefined ? value : inputValue.toUpperCase().trim() || 'X';

    // Clampar o index
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex > currentList.length) targetIndex = currentList.length;

    // Gerar passos da animação com base no estado atual da lista
    const generatedSteps = generateSteps(currentList, {
      type,
      value: targetValue,
      index: targetIndex,
    });

    setSteps(generatedSteps);
    setCurrentStepIdx(0);
    setLastOperation(getOperationLabel(type, targetValue, targetIndex));
    
    // Agenda a aplicação do novo array ao final do último passo
    const finalStep = generatedSteps[generatedSteps.length - 1];
    if (finalStep) {
      // Extrair os valores válidos do último passo do ArrayList
      const newValues = finalStep.arrayListState.cells
        .filter(c => c.value !== '')
        .map(c => c.value);
      
      // Aplicamos de forma reativa quando a animação termina ou quando gerada
      if (type !== 'search' && type !== 'access') {
        setCurrentList(newValues);
      }
    }

    // Auto iniciar o playback
    setTimeout(() => {
      setIsPlaying(true);
    }, 150);
  };

  const getOperationLabel = (type: string, val: string, idx: number) => {
    switch (type) {
      case 'insert_head': return `Inserir '${val}' no início (Índice 0)`;
      case 'insert_tail': return `Inserir '${val}' no fim (Índice ${currentList.length})`;
      case 'insert_index': return `Inserir '${val}' na posição específica (Índice ${idx})`;
      case 'remove_head': return `Remover do início (Índice 0)`;
      case 'remove_tail': return `Remover do fim (Índice ${currentList.length - 1})`;
      case 'remove_index': return `Remover na posição (Índice ${idx})`;
      case 'search': return `Buscar valor '${val}'`;
      case 'access': return `Acessar índice ${idx}`;
      default: return '';
    }
  };

  // --- REINICIAR AO ESTADO INICIAL ---
  const handleResetList = () => {
    setIsPlaying(false);
    setCurrentList(['A', 'B', 'C', 'D']);
    setSteps([]);
    setCurrentStepIdx(0);
    setLastOperation('');
  };

  // --- EXECUTAR BENCHMARK REAL ---
  const handleRunBenchmarks = () => {
    setIsBenchmarking(true);
    setBenchmarkResults([]);
    
    // Timeout para renderizar o estado de carregamento antes de travar a thread levemente
    setTimeout(() => {
      const results = runBenchmarkSuite(benchmarkSize);
      setBenchmarkResults(results);
      setIsBenchmarking(false);
    }, 400);
  };

  // Auto-run benchmark inicial uma vez
  useEffect(() => {
    if (benchmarkResults.length === 0 && !isBenchmarking) {
      handleRunBenchmarks();
    }
  }, []);

  // Dados visuais default (se passos não estiverem rodando)
  const defaultArrayListState = {
    cells: Array.from({ length: 8 }, (_, i) => ({
      value: currentList[i] !== undefined ? currentList[i] : '',
      isHighlighted: false,
    })),
    capacity: 8,
    size: currentList.length,
  };

  const defaultLinkedListState = {
    nodes: currentList.map((val, idx) => ({
      id: `node-${val}-${idx}`,
      value: val,
      isHighlighted: false,
      nextId: idx < currentList.length - 1 ? `node-${currentList[idx+1]}-${idx+1}` : null,
    })),
    headId: currentList.length > 0 ? `node-${currentList[0]}-0` : null,
  };

  const activeStep = steps[currentStepIdx];
  const arrayStateToRender = activeStep ? activeStep.arrayListState : defaultArrayListState;
  const linkedListStateToRender = activeStep ? activeStep.linkedListState : defaultLinkedListState;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-850 font-sans antialiased pb-12 selection:bg-zinc-900 selection:text-white geometric-grid-bg">
      
      {/* HEADER DE ALTA PRECISÃO ESTÉTICA */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.02)] font-sans" id="app-header">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary text-on-primary rounded-sm border border-primary">
              <FerrisWheel className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm text-zinc-950 tracking-wider uppercase leading-none">
                ArrayList vs LinkedList
              </h1>
              <p className="text-[9px] text-zinc-400 font-mono font-bold mt-1 uppercase tracking-widest">
                Visualizador Algorítmico & Benchmarking
              </p>
            </div>
          </div>

          {/* ACESSO RÁPIDO ABAS */}
          <nav className="flex bg-zinc-100 p-0.5 rounded-sm border border-zinc-200" id="tabs-navigation">
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-3 py-1.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wide transition-all duration-150 cursor-pointer ${
                activeTab === 'visual'
                  ? 'bg-primary text-white border-primary border'
                  : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/40'
              }`}
            >
              Playground Visual
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-3 py-1.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wide transition-all duration-150 cursor-pointer ${
                activeTab === 'performance'
                  ? 'bg-primary text-white border-primary border'
                  : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/40'
              }`}
            >
              Testes de Performance
            </button>
            <button
              onClick={() => setActiveTab('bigo')}
              className={`px-3 py-1.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wide transition-all duration-150 cursor-pointer ${
                activeTab === 'bigo'
                  ? 'bg-primary text-white border-primary border'
                  : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/40'
              }`}
            >
              Complexidade Big-O
            </button>
            <button
              onClick={() => setActiveTab('usecases')}
              className={`px-3 py-1.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wide transition-all duration-150 cursor-pointer ${
                activeTab === 'usecases'
                  ? 'bg-primary text-white border-primary border'
                  : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/40'
              }`}
            >
              Casos Reais
            </button>
            <button
              onClick={() => setActiveTab('jmh')}
              className={`px-3 py-1.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wide transition-all duration-150 cursor-pointer ${
                activeTab === 'jmh'
                  ? 'bg-primary text-white border-primary border'
                  : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/40'
              }`}
            >
              Implementação & Relatório JMH
            </button>
          </nav>
        </div>
      </header>

      {/* ÁREA DE CONTEÚDO PRINCIPAL COM LAYOUT BENTO GRID EM CADA TAB */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* ================================= ABAL PLAYGROUND VISUAL ================================= */}
        {activeTab === 'visual' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* PARENT PANEL: CONTROLES DE ESCRITA & BUSCA (4 COLS) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* CARD DE OPÇÕES DE ELEMENTO */}
              <div className="bg-surface rounded-sm border border-zinc-200 shadow-elevation-1 p-5" id="control-panel-card">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-100">
                  <Sliders className="w-3.5 h-3.5 text-zinc-950" />
                  <h3 className="font-display font-bold text-xs text-zinc-900 uppercase tracking-wider">Painel de Operações</h3>
                </div>

                {/* Submódulo de Inserção */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 font-mono block uppercase mb-1.5 tracking-wider">
                      Conteúdo do Novo Nó
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={3}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value.slice(0, 3))}
                        className="bg-white border border-zinc-300 rounded-sm px-3 py-1.5 text-xs font-mono font-bold text-center w-20 focus:outline-none focus:border-zinc-950 text-zinc-800"
                      />
                      <button
                        onClick={() => handleStartOperation('insert_head', inputValue)}
                        disabled={currentList.length >= 8}
                        className="flex-1 bg-zinc-900 border border-zinc-900 text-white font-mono font-bold text-[10px] uppercase tracking-wider py-2 rounded-sm hover:bg-zinc-800 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3 h-3 inline mr-1" /> No Início
                      </button>
                      <button
                        onClick={() => handleStartOperation('insert_tail', inputValue)}
                        disabled={currentList.length >= 8}
                        className="flex-1 bg-zinc-900 border border-zinc-900 text-white font-mono font-bold text-[10px] uppercase tracking-wider py-2 rounded-sm hover:bg-zinc-800 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3 h-3 inline mr-1" /> No Fim
                      </button>
                    </div>
                  </div>

                  {/* Operação com Índice Específico */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 font-mono block uppercase tracking-wider">
                      Inserir no Índice Alvo
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-sm px-2 w-20">
                        <span className="text-[9px] text-zinc-400 font-mono mr-1">IDX:</span>
                        <input
                           type="number"
                          min={0}
                          max={currentList.length}
                          value={inputIndex}
                          onChange={(e) => setInputIndex(Math.max(0, Math.min(currentList.length, parseInt(e.target.value) || 0)))}
                          className="w-full text-xs font-bold text-zinc-800 font-mono focus:outline-none bg-transparent"
                        />
                      </div>
                      <button
                        onClick={() => handleStartOperation('insert_index', inputValue, inputIndex)}
                        disabled={currentList.length >= 8}
                        className="flex-1 bg-secondary text-white font-mono font-bold text-[10px] uppercase tracking-wider py-2 hover:bg-secondary/90 rounded-sm transition cursor-pointer border border-secondary disabled:opacity-40"
                      >
                        Inserir na Posição
                      </button>
                    </div>
                  </div>

                  {/* Submódulo de Remoção */}
                  <div className="pt-3 border-t border-zinc-100">
                    <label className="text-[10px] font-bold text-zinc-400 font-mono block uppercase mb-1.5 tracking-wider">
                      Remover Elementos
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <button
                        onClick={() => handleStartOperation('remove_head')}
                        disabled={currentList.length === 0}
                        className="bg-white border border-zinc-200 text-zinc-700 font-mono font-bold text-[10px] uppercase tracking-wider py-2 rounded-sm hover:bg-zinc-50 hover:text-red-600 hover:border-zinc-300 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                      >
                        <Trash2 className="w-3 h-3" /> Do Início
                      </button>
                      <button
                        onClick={() => handleStartOperation('remove_tail')}
                        disabled={currentList.length === 0}
                        className="bg-white border border-zinc-200 text-zinc-700 font-mono font-bold text-[10px] uppercase tracking-wider py-2 rounded-sm hover:bg-zinc-50 hover:text-red-600 hover:border-zinc-300 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                      >
                        <Trash2 className="w-3 h-3" /> Do Fim
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartOperation('remove_index', undefined, inputIndex)}
                        disabled={currentList.length === 0 || inputIndex >= currentList.length}
                        className="flex-1 bg-white border border-zinc-300 text-zinc-800 font-mono font-bold text-[10px] uppercase tracking-wide py-2 rounded-sm hover:bg-zinc-50 hover:text-red-600 hover:border-red-400 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                      >
                        Remover no Índice {inputIndex}
                      </button>
                    </div>
                  </div>

                  {/* Submódulo de Leitura e Busca */}
                  <div className="pt-3 border-t border-zinc-100 space-y-3">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-zinc-400 font-mono block uppercase mb-1 tracking-wider">
                          Pesquisar Valor
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            maxLength={3}
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value.slice(0, 3))}
                            className="bg-white border border-zinc-200 rounded-sm px-2 py-1 text-xs font-bold text-center w-14 focus:outline-none font-mono text-zinc-800"
                          />
                          <button
                            onClick={() => handleStartOperation('search', searchVal)}
                            disabled={currentList.length === 0}
                            className="flex-1 bg-zinc-100 border border-zinc-200 text-zinc-700 font-mono font-bold text-[9px] uppercase tracking-wider py-1 rounded-sm hover:bg-zinc-200 transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Search className="w-3 h-3" /> Buscar
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 border-l border-zinc-100 pl-3">
                        <label className="text-[10px] font-bold text-zinc-400 font-mono block uppercase mb-1 tracking-wider">
                          Acesso Direto
                        </label>
                        <button
                          onClick={() => handleStartOperation('access', undefined, inputIndex)}
                          disabled={currentList.length === 0 || inputIndex >= currentList.length}
                          className="w-full bg-zinc-100 border border-zinc-200 text-zinc-700 font-mono font-bold text-[9px] uppercase tracking-wider py-1 rounded-sm hover:bg-zinc-200 transition h-[26px] flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                        >
                          <Eye className="w-3 h-3" /> Acessar IDX {inputIndex}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD DE INFORMAÇÕES DE ESTADO ATUAL */}
              <div className="bg-surface rounded-sm border border-zinc-200 shadow-elevation-1 p-5" id="state-summary-card">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-display">Sequência Atual</h4>
                  <button
                    onClick={handleResetList}
                    className="text-[9px] font-mono font-bold text-zinc-700 hover:text-zinc-900 flex items-center gap-1 cursor-pointer bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-sm"
                  >
                    <RotateCcw className="w-3 h-3" /> REINICIAR
                  </button>
                </div>
                {/* Visual da sequência lógica pura */}
                <div className="flex flex-wrap gap-2 items-center min-h-[40px] bg-zinc-50 p-3 rounded-sm border border-zinc-200">
                  {currentList.length === 0 ? (
                    <span className="text-xs text-zinc-400 font-mono italic">Vazia []</span>
                  ) : (
                    currentList.map((val, idx) => (
                      <div key={idx} className="flex items-center font-mono text-xs">
                        <span className="bg-white border border-zinc-200 rounded-sm px-2 py-0.5 text-zinc-850 font-bold shadow-sm">
                          {val}
                        </span>
                        {idx < currentList.length - 1 && (
                          <ChevronRight className="w-3 h-3 text-zinc-400 mx-0.5" />
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-400 font-sans">
                  <HelpCircle className="w-3 h-3 text-slate-300" />
                  <span>Limite do visualizer: máximo de 8 elementos.</span>
                </div>
              </div>
            </div>

            {/* MAIN PLAYGROUND VISUAL (8 COLS) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* COMPONENT DE REPRODUÇÃO PASSO-A-PASSO (CONTROLLERS NO CENTRO) */}
              {steps.length > 0 && (
                <div className="bg-zinc-950 text-white rounded-sm p-5 shadow-elevation-2 border border-zinc-900" id="stepper-banner-player">
                  <div className="flex justify-between items-center pb-3 border-b border-zinc-800 mb-4 h-8">
                    <span className="text-[9px] font-bold font-mono tracking-wider text-zinc-400 uppercase">
                      Simulação Ativa: {lastOperation}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-sm">
                      PASSOS: {currentStepIdx + 1} / {steps.length}
                    </span>
                  </div>

                  {/* Texto Explicativo Principal do Passo Atual */}
                  <div className="min-h-[56px] text-xs font-sans text-zinc-300 leading-relaxed font-normal mb-6 flex gap-3">
                    <div className="p-1 px-2.5 rounded-sm bg-zinc-900 text-zinc-400 border border-zinc-800 h-fit font-mono font-bold text-xs select-none">
                      i
                    </div>
                    <div>
                      {activeStep?.description}
                    </div>
                  </div>

                  {/* Barra de progresso visual */}
                  <div className="w-full bg-zinc-900 h-1 rounded-sm mb-5 overflow-hidden border border-zinc-800">
                    <div
                      className="bg-primary h-full rounded-sm transition-all duration-300"
                      style={{ width: `${((currentStepIdx + 1) / steps.length) * 100}%` }}
                    />
                  </div>

                  {/* Controladores de velocidade e reprodução */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentStepIdx((p) => Math.max(0, p - 1));
                        }}
                        disabled={currentStepIdx === 0}
                        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white p-2 rounded-sm transition disabled:opacity-40 cursor-pointer"
                        title="Passo Anterior"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {isPlaying ? (
                        <button
                          onClick={() => setIsPlaying(false)}
                          className="bg-primary hover:bg-primary/90 text-on-primary font-mono font-bold px-4 py-1.5 rounded-sm text-xs border border-primary transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Pause className="w-3.5 h-3.5" /> Pausar
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (currentStepIdx === steps.length - 1) {
                              setCurrentStepIdx(0);
                            }
                            setIsPlaying(true);
                          }}
                          className="bg-white hover:bg-zinc-100 text-zinc-950 font-mono font-bold px-4 py-1.5 rounded-sm text-xs transition flex items-center gap-1.5 cursor-pointer border border-zinc-300"
                        >
                          <Play className="w-3.5 h-3.5" /> {currentStepIdx === steps.length - 1 ? 'Reiniciar' : 'Iniciar'}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentStepIdx((p) => Math.min(steps.length - 1, p + 1));
                        }}
                        disabled={currentStepIdx === steps.length - 1}
                        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white p-2 rounded-sm transition disabled:opacity-40 cursor-pointer"
                        title="Próximo Passo"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Slider de velocidade */}
                    <div className="flex items-center bg-zinc-900 px-3 py-1.5 rounded-sm border border-zinc-800">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold mr-3">Velocidade:</span>
                      <div className="flex gap-1.5 text-[9px] font-mono font-bold">
                        {[
                          { val: 1800, label: 'LENTO' },
                          { val: 1200, label: 'MÉDIO' },
                          { val: 600, label: 'RÁPIDO' },
                        ].map((speed) => (
                          <button
                            key={speed.val}
                            onClick={() => setPlaySpeed(speed.val)}
                            className={`px-2 py-0.5 rounded-sm cursor-pointer border transition ${
                              playSpeed === speed.val
                                ? 'bg-zinc-950 text-white border-zinc-700'
                                : 'text-zinc-400 border-transparent hover:text-white'
                            }`}
                          >
                            {speed.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* RENDERIZADOR ARRAYS & LINKEDLISTS LADO A LADO/vertical */}
              <ArrayListVisualizer
                cells={arrayStateToRender.cells}
                capacity={arrayStateToRender.capacity}
                size={arrayStateToRender.size}
              />

              <LinkedListVisualizer
                nodes={linkedListStateToRender.nodes}
                headId={linkedListStateToRender.headId}
                activePointer={linkedListStateToRender.activePointer}
              />
            </div>
          </div>
        )}

        {/* ================================= ABA PERFORMANCE (BENCHMARK) ================================= */}
        {activeTab === 'performance' && (
          <div className="bg-surface rounded-sm border border-zinc-200 shadow-elevation-1 p-6" id="performance-dashboard">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-zinc-100">
              <div>
                <h2 className="font-display font-bold text-base text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="p-1.5 bg-primary text-on-primary rounded-sm border border-primary">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                  Comparador de Velocidade Real
                </h2>
                <p className="text-xs text-zinc-500 font-sans mt-2">Mede o tempo gasto em loops de milhares de iterações em microssegundos (µs).</p>
              </div>

              {/* Seletor de tamanho + Botão de Trigger */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-sm px-3 py-1.5 sm:w-56 justify-between w-full">
                  <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider">Elementos:</span>
                  <select
                    value={benchmarkSize}
                    onChange={(e) => setBenchmarkSize(parseInt(e.target.value))}
                    className="bg-transparent text-xs font-bold font-mono text-zinc-855 focus:outline-none cursor-pointer pl-1.5 w-full text-right"
                  >
                    <option value={1000}>1.000 Itens</option>
                    <option value={5000}>5.000 Itens</option>
                    <option value={10000}>10.000 Itens</option>
                    <option value={30000}>30.000 Itens</option>
                    <option value={50000}>50.000 Itens</option>
                    <option value={100000}>100.000 Itens</option>
                  </select>
                </div>

                <button
                  onClick={handleRunBenchmarks}
                  disabled={isBenchmarking}
                  className="bg-primary hover:bg-primary/95 text-on-primary text-[10px] font-mono font-bold uppercase tracking-wider px-5 py-2.5 rounded-sm border border-primary transition cursor-pointer min-w-[150px] disabled:opacity-50 shadow-sm"
                >
                  {isBenchmarking ? 'Processando...' : 'Rodar Benchmark'}
                </button>
              </div>
            </div>

            {/* EXIBIÇÃO DE PERFORMANCE E COMPARAÇÃO */}
            {isBenchmarking ? (
              <div className="py-20 flex flex-col items-center justify-center bg-zinc-50 border border-zinc-200 rounded-sm">
                <div className="w-10 h-10 rounded-sm border-[3px] border-zinc-200 border-t-primary animate-spin mb-4" />
                <p className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-tight animate-pulse">
                  Instanciando dados e processando loops na Heap...
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* GOURMET SVG BAR CHART */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-sm p-6" id="benchmark-chart-card">
                  <h3 className="font-display font-bold text-xs text-zinc-500 uppercase tracking-wider mb-4 font-mono select-none">
                    Gráfico Comparativo de Frequência Temporal (Menor tempo é melhor)
                  </h3>

                  {/* Plot do gráfico SVG responsivo */}
                  <div className="w-full h-80 relative mt-4">
                    <svg viewBox="0 0 800 320" className="w-full h-full font-mono text-[9px] text-zinc-400 select-none">
                      {/* Grid Lines Horizontais */}
                      <line x1="120" y1="40" x2="760" y2="40" stroke="#f4f4f5" strokeWidth="2" strokeDasharray="3 3" />
                      <line x1="120" y1="100" x2="760" y2="100" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="120" y1="160" x2="760" y2="160" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="120" y1="220" x2="760" y2="220" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="120" y1="260" x2="760" y2="260" stroke="#e4e4e7" strokeWidth="2" />

                      {/* Eixos */}
                      <line x1="120" y1="40" x2="120" y2="260" stroke="#e4e4e7" strokeWidth="2" />

                      {/* Grid labels de tempo */}
                      <text x="110" y="44" textAnchor="end" className="fill-zinc-400 text-[8px]">Escala Linear</text>
                      <text x="110" y="104" textAnchor="end" className="fill-zinc-400 text-[8px]">Médio Alto</text>
                      <text x="110" y="164" textAnchor="end" className="fill-zinc-400 text-[8px]">Moderado</text>
                      <text x="110" y="224" textAnchor="end" className="fill-zinc-400 text-[8px]">Rápido</text>
                      <text x="110" y="264" textAnchor="end" className="fill-zinc-500 font-bold text-[8px]">0 µs (Inst)</text>

                      {/* Loops de render de Colunas por Operação */}
                      {benchmarkResults.map((res, index) => {
                        // Calcula proporção de altura
                        const maxVal = Math.max(...benchmarkResults.flatMap(r => [r.arrayListTime, r.linkedListTime]));
                        const scale = 180 / (maxVal || 1); // deixa margem acima

                        const xGroup = 140 + index * 125;
                        const barWidth = 30;

                        // Altura das barras (limita menor altura visual para não sumir)
                        const hArr = Math.max(2, res.arrayListTime * scale);
                        const hLL = Math.max(2, res.linkedListTime * scale);

                        const yArr = 260 - hArr;
                        const yLL = 260 - hLL;

                        return (
                          <g key={index}>
                            {/* Nome da categoria em diagonal/baixo */}
                            <text
                              x={xGroup + 32}
                              y="280"
                              textAnchor="middle"
                              className="fill-zinc-700 font-sans font-bold text-[9px]"
                            >
                              {res.operation.split(' (')[0]}
                            </text>

                            {/* Barra de ArrayList (Secondary Blue) */}
                            <motion.rect
                              initial={{ y: 260, height: 0 }}
                              animate={{ y: yArr, height: hArr }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                              x={xGroup}
                              width={barWidth}
                              className="fill-secondary/95 hover:fill-secondary/80 transition-colors cursor-pointer"
                              rx="1"
                            />
                            <text
                              x={xGroup + barWidth / 2}
                              y={yArr - 6}
                              textAnchor="middle"
                              className="fill-secondary font-bold text-[8px]"
                            >
                              {res.arrayListTime >= 1000 ? `${(res.arrayListTime / 1000).toFixed(1)}ms` : `${res.arrayListTime.toFixed(0)}µs`}
                            </text>

                            {/* Barra de LinkedList (Primary Orange/Zinc) */}
                            <motion.rect
                              initial={{ y: 260, height: 0 }}
                              animate={{ y: yLL, height: hLL }}
                              transition={{ duration: 0.5, delay: index * 0.1 + 0.05 }}
                              x={xGroup + barWidth + 6}
                              width={barWidth}
                              className="fill-zinc-950 hover:fill-zinc-850 transition-colors cursor-pointer"
                              rx="1"
                            />
                            <text
                              x={xGroup + barWidth + 6 + barWidth / 2}
                              y={yLL - 6}
                              textAnchor="middle"
                              className="fill-zinc-800 font-bold text-[8px]"
                            >
                              {res.linkedListTime >= 1000 ? `${(res.linkedListTime / 1000).toFixed(1)}ms` : `${res.linkedListTime.toFixed(0)}µs`}
                            </text>

                            {/* Badges de complexidades abaixo */}
                            <text x={xGroup + barWidth / 2} y="295" textAnchor="middle" className="fill-secondary font-bold text-[8px] font-mono">
                              {res.complexityArray}
                            </text>
                            <text x={xGroup + barWidth + 6 + barWidth / 2} y="295" textAnchor="middle" className="fill-zinc-700 font-bold text-[8px] font-mono">
                              {res.complexityList}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Legenda do Gráfico */}
                  <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-zinc-200 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-3 bg-secondary rounded-sm" />
                      <span className="text-zinc-600 font-bold">ArrayList (Acesso Direto Contínuo)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-3 bg-zinc-950 rounded-sm" />
                      <span className="text-zinc-600 font-bold">LinkedList (Nós e Ponteiros Fragmentados)</span>
                    </div>
                  </div>
                </div>

                {/* BARRA DE CONTROLE DE MODO DE VISUALIZAÇÃO */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-primary rounded-xs" />
                    <h3 className="font-display font-medium text-xs text-zinc-500 uppercase tracking-wider font-mono select-none">
                      Resultados Individuais ({benchmarkResults.length} Operações Analisadas)
                    </h3>
                  </div>
                  <div className="flex bg-zinc-100 p-0.5 rounded-sm border border-zinc-200 self-start sm:self-auto">
                    <button
                      onClick={() => setBenchmarkViewMode('cards')}
                      className={`px-3 py-1.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wide transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                        benchmarkViewMode === 'cards'
                          ? 'bg-primary text-white border-primary border'
                          : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/40'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" /> Cards
                    </button>
                    <button
                      onClick={() => setBenchmarkViewMode('list')}
                      className={`px-3 py-1.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wide transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                        benchmarkViewMode === 'list'
                          ? 'bg-primary text-white border-primary border'
                          : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/40'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" /> Lista
                    </button>
                  </div>
                </div>

                {/* DETALHAMENTO DE CADA BENCHMARK - CARDS OU LISTA */}
                {benchmarkViewMode === 'cards' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {benchmarkResults.map((res, index) => {
                      const ratio = res.arrayListTime > 0 ? res.linkedListTime / res.arrayListTime : 0;
                      const isArrBetter = res.arrayListTime < res.linkedListTime;
                      const magnitude = isArrBetter
                        ? (res.linkedListTime / (res.arrayListTime || 0.1)).toFixed(0)
                        : (res.arrayListTime / (res.linkedListTime || 0.1)).toFixed(0);

                      return (
                        <div
                          key={index}
                          className="bg-surface border border-zinc-200 rounded-sm p-5 flex flex-col justify-between shadow-elevation-1"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 px-2 py-0.5 border border-zinc-200 rounded-sm">
                                Operação #{index + 1}
                              </span>
                              <span className="text-xs font-mono font-bold text-zinc-400">
                                {benchmarkSize.toLocaleString()} ITENS
                              </span>
                            </div>
                            <h4 className="font-display font-bold text-sm text-zinc-900 leading-snug mb-2 uppercase tracking-wide">{res.operation}</h4>
                            <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                              Simula e mede {benchmarkSize.toLocaleString()} iterações desta função computacional.
                            </p>
                          </div>

                          <div className="mt-4 pt-4 border-t border-zinc-100 space-y-2">
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-zinc-500">ArrayList:</span>
                              <span className="font-bold text-secondary">
                                {res.arrayListTime >= 1000 ? `${(res.arrayListTime / 1000).toFixed(2)} ms` : `${res.arrayListTime} µs`} ({res.complexityArray})
                              </span>
                            </div>
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-zinc-500">LinkedList:</span>
                              <span className="font-bold text-zinc-900">
                                {res.linkedListTime >= 1000 ? `${(res.linkedListTime / 1000).toFixed(2)} ms` : `${res.linkedListTime} µs`} ({res.complexityList})
                              </span>
                            </div>

                            <div className="mt-3 pt-3 border-t border-zinc-200 bg-zinc-50 p-2.5 rounded-sm border border-zinc-200 flex items-center gap-2">
                              <div className="p-1 rounded-sm bg-zinc-950 text-white">
                                <Award className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-[10px] font-mono text-zinc-600 leading-normal">
                                {isArrBetter ? 'ArrayList' : 'LinkedList'} foi {' '}
                                <strong className={`${isArrBetter ? 'text-secondary' : 'text-zinc-950'} font-bold`}>{magnitude}x</strong> {' '}
                                mais rápido neste cenário de estresse.
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    {benchmarkResults.map((res, index) => {
                      const isArrBetter = res.arrayListTime < res.linkedListTime;
                      const magnitude = isArrBetter
                        ? (res.linkedListTime / (res.arrayListTime || 0.1)).toFixed(0)
                        : (res.arrayListTime / (res.linkedListTime || 0.1)).toFixed(0);

                      return (
                        <div
                          key={index}
                          className="bg-surface border border-zinc-200 rounded-sm p-4 hover:border-zinc-300 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          {/* Identificação e Nome da Operação */}
                          <div className="flex items-start gap-3 md:w-1/3">
                            <div className="text-[10px] font-mono font-bold uppercase bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-sm border border-zinc-200 shrink-0">
                              #{index + 1}
                            </div>
                            <div>
                              <h4 className="font-display font-medium text-sm text-zinc-900 uppercase tracking-wide">
                                {res.operation}
                              </h4>
                              <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                                Volume: {benchmarkSize.toLocaleString()} elementos
                              </p>
                            </div>
                          </div>

                          {/* Medições Lado a Lado */}
                          <div className="grid grid-cols-2 gap-4 text-xs font-mono md:w-1/3 w-full border-t border-b border-dashed border-zinc-100 py-3 md:py-0 md:border-none">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-zinc-400 font-sans uppercase font-medium mb-0.5">ArrayList</span>
                              <span className="font-bold text-secondary text-sm">
                                {res.arrayListTime >= 1000 ? `${(res.arrayListTime / 1000).toFixed(2)} ms` : `${res.arrayListTime} µs`}
                                <span className="text-[9px] text-zinc-400 font-semibold ml-1 font-mono">({res.complexityArray})</span>
                              </span>
                            </div>
                            <div className="flex flex-col border-l border-zinc-200 pl-4">
                              <span className="text-[10px] text-zinc-400 font-sans uppercase font-medium mb-0.5">LinkedList</span>
                              <span className="font-bold text-zinc-950 text-sm">
                                {res.linkedListTime >= 1000 ? `${(res.linkedListTime / 1000).toFixed(2)} ms` : `${res.linkedListTime} µs`}
                                <span className="text-[9px] text-zinc-400 font-semibold ml-1 font-mono">({res.complexityList})</span>
                              </span>
                            </div>
                          </div>

                          {/* Vencedor / Verdict */}
                          <div className="md:w-1/3 flex items-center md:justify-end">
                            <div className="bg-zinc-50 border border-zinc-200 rounded-sm px-3 py-2 flex items-center gap-2 max-w-full w-full md:w-auto">
                              <div className={`p-1 rounded-sm shrink-0 ${isArrBetter ? 'bg-secondary text-white' : 'bg-zinc-950 text-white'}`}>
                                <Award className="w-3.5 h-3.5" />
                              </div>
                              <p className="text-[11px] font-mono text-zinc-600 leading-tight">
                                <strong className={`${isArrBetter ? 'text-secondary' : 'text-zinc-950'} font-bold`}>
                                  {isArrBetter ? 'ArrayList' : 'LinkedList'}
                                </strong>{' '}
                                foi <strong className="font-bold text-zinc-900">{magnitude}x</strong> mais rápido.
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================================= ABA COMPACTA COMPUTAÇÃO BIG-O ================================= */}
        {activeTab === 'bigo' && (
          <div className="space-y-6">
            <ComplexityTable />
          </div>
        )}

        {/* ================================= ABA CASOS DE USO REAIS ================================= */}
        {activeTab === 'usecases' && (
          <div className="space-y-6">
            <UseCases />
          </div>
        )}

        {/* ================================= ABA COM CÓDIGO JMH JAVA (PASSO 1) ================================= */}
        {activeTab === 'jmh' && (
          <div className="space-y-6">
            <JMHBenchmark />
          </div>
        )}

      </main>

      {/* FOOTER POLIDO COM ESTÉTICA ACADÊMICA */}
      <footer className="max-w-7xl mx-auto px-6 border-t border-zinc-200 mt-16 pt-8 text-center" id="app-footer-brand">
        <p className="text-[11px] text-zinc-500 font-sans tracking-wide leading-relaxed">
          <strong>Visualizador ArrayList & LinkedList</strong> • Estrutura de Dados.
        </p>
        <p className="text-[9px] text-zinc-400 font-mono mt-1 uppercase tracking-widest font-semibold">
          IFTM • Campus Uberlândia Centro • Minas Gerais
        </p>
      </footer>
    </div>
  );
}
