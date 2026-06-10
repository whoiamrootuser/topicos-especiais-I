import React, { useEffect, useState, useRef } from 'react';
import { Upload, FileJson, Award, Server, Cpu, Layers, HelpCircle, ArrowLeftRight, Check, AlertCircle, TrendingUp, BarChart4, Activity, Sparkles, Code, LineChart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line as RechartsLine,
  BarChart as RechartsBarChart,
  Bar as RechartsBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend
} from 'recharts';

interface JMHPrimaryMetric {
  score: number;
  scoreError: number;
  scoreUnit: string;
  scoreConfidence: number[];
  rawData: number[][];
}

interface JMHRecord {
  jmhVersion: string;
  benchmark: string;
  mode: string;
  threads: number;
  forks: number;
  jvm: string;
  jdkVersion: string;
  vmName: string;
  vmVersion: string;
  params?: {
    size?: string;
    tamanho?: string;
  };
  primaryMetric: JMHPrimaryMetric;
}

const DEFAULT_RESULTS_PATH = '/resultados.json';

const isValidJmhPayload = (value: unknown): value is JMHRecord[] => {
  if (!Array.isArray(value) || value.length === 0) {
    return false;
  }

  const first = value[0] as Partial<JMHRecord>;
  return typeof first.benchmark === 'string' && !!first.primaryMetric;
};

export default function JMHVisualizer() {
  const [data, setData] = useState<JMHRecord[]>([]);
  const [defaultResults, setDefaultResults] = useState<JMHRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('100000'); // Default to 100K to show all 3 benchmark features including iteracao
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados dos gráficos comparativos avançados
  const [selectedChartOp, setSelectedChartOp] = useState<'get_meio' | 'add_inicio' | 'iteracao'>('get_meio');
  const [chartScale, setChartScale] = useState<'linear' | 'log'>('log');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  useEffect(() => {
    const loadDefaults = async () => {
      try {
        const response = await fetch(DEFAULT_RESULTS_PATH);
        if (!response.ok) {
          throw new Error('Arquivo default não encontrado em /public.');
        }

        const payload = (await response.json()) as unknown;
        if (!isValidJmhPayload(payload)) {
          throw new Error('Formato inválido para relatório default do JMH.');
        }

        setDefaultResults(payload);
        setData(payload);
      } catch (err) {
        setError('Falha ao carregar resultados padrão de /resultados.json. Faça upload manual do arquivo.');
      }
    };

    void loadDefaults();
  }, []);

  // Helper de parsing de arquivo enviado
  const handleFileUpload = (file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string) as unknown;
        if (isValidJmhPayload(json)) {
          setData(json);
        } else {
          setError('O formato do arquivo JSON não parece ser um relatório válido do OpenJDK JMH.');
        }
      } catch (err) {
        setError('Erro ao processar o arquivo JSON. Certifique-se de que é um JSON válido.');
      }
    };
    reader.readAsText(file);
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const loadDefault = () => {
    setData(defaultResults);
    setError(null);
  };

  // Processamento e Agrupamento dos Dados do Benchmark para a Visualização
  // Vamos agrupar as operações correspondentes para ArrayList vs LinkedList no tamanho de dados selecionado
  const getOpDisplayName = (benchmark: string) => {
    const name = benchmark.split('.').pop() || '';
    if (name.includes('arrayListAddInicio')) return 'Inserção no Início (ArrayList)';
    if (name.includes('linkedListAddInicio')) return 'Inserção no Início (LinkedList)';
    if (name.includes('arrayListGetMeio')) return 'Busca no Elemento do Meio (ArrayList)';
    if (name.includes('linkedListGetMeio')) return 'Busca no Elemento do Meio (LinkedList)';
    if (name.includes('arrayListIteracao')) return 'Iteração Completa (ArrayList)';
    if (name.includes('linkedListIteracao')) return 'Iteração Completa (LinkedList)';
    return name;
  };

  // Devolve o grupo pedagógico (add, get, iteracao)
  const getOpGroup = (benchmark: string) => {
    const name = benchmark.split('.').pop() || '';
    if (name.toLowerCase().includes('addinicio')) return 'add_inicio';
    if (name.toLowerCase().includes('getmeio')) return 'get_meio';
    if (name.toLowerCase().includes('iteracao')) return 'iteracao';
    return 'outros';
  };

  // Filtra logs baseados no tamanho escolhido
  const getRecordSize = (record: JMHRecord) => {
    const params = record.params as { tamanho?: string; size?: string } | undefined;
    return params?.tamanho || params?.size || '';
  };

  const recordsForSize = data.filter(r => {
    return getRecordSize(r) === selectedSize;
  });

  // Métodos utilitários para buscar scores no JSON independentemente da chave do map
  const getScoreForSizeAndKey = (size: string, key: string) => {
    const record = data.find(r => {
      const pSize = getRecordSize(r);
      const pKey = r.benchmark.split('.').pop() || '';
      return pSize === size && pKey === key;
    });
    return record ? record.primaryMetric.score : null;
  };

  // Agrupa comparativos: { groupName: string, arrayList: JMHRecord, linkedList: JMHRecord }
  const comparisonGroups = [
    {
      id: 'get_meio',
      name: 'Acesso / Busca no Meio (get(size/2))',
      description: 'Mede o tempo médio para obter um elemento posicionado exatamente na metade da lista.',
      arrayKey: 'arrayListGetMeio',
      linkedKey: 'linkedListGetMeio',
    },
    {
      id: 'add_inicio',
      name: 'Inserção no Início (addFirst / add(0, x))',
      description: 'Mede o custo de inserir um novo item no início da coleção.',
      arrayKey: 'arrayListAddInicio',
      linkedKey: 'linkedListAddInicio',
    },
    {
      id: 'iteracao',
      name: 'Iteração Sequencial (for-each completo)',
      description: 'Varre todos os elementos medindo a eficiência de travessia.',
      arrayKey: 'arrayListIteracao',
      linkedKey: 'linkedListIteracao',
    }
  ].map(group => {
    const arrayRecord = recordsForSize.find(r => (r.benchmark.split('.').pop() || '') === group.arrayKey);
    const linkedRecord = recordsForSize.find(r => (r.benchmark.split('.').pop() || '') === group.linkedKey);
    return {
      ...group,
      arrayList: arrayRecord,
      linkedList: linkedRecord
    };
  }).filter(g => g.arrayList || g.linkedList); // Apenas se houver pelo menos um dos dados

  // Informações de ambiente do JMH lidos no cabeçalho/JSON
  const environmentInfo = data.length > 0 ? {
    jdk: data[0].jdkVersion || 'N/A',
    vmName: data[0].vmName || 'N/A',
    vmVersion: data[0].vmVersion || 'N/A',
    jmhVersion: data[0].jmhVersion || '1.37',
    forks: data[0].forks || 2,
    mode: data[0].mode === 'avgt' ? 'Average Time (avgt)' : data[0].mode
  } : null;

  return (
    <div className="space-y-6">
      
      {/* SEÇÃO CARD DE CONTROLE DE ARQUIVO */}
      <div className="bg-surface rounded-sm border border-zinc-200 shadow-elevation-1 p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <span className="text-[9px] font-mono font-bold uppercase bg-primary text-white px-2 py-0.5 rounded-sm border border-primary mr-2">
              Análise Avançada
            </span>
            <span className="text-xs font-mono font-bold text-zinc-400">JMH REPORT CARRIER</span>
            <h3 className="font-display font-bold text-base text-zinc-900 uppercase tracking-wide mt-1">
              Visualizador Científico de Relatórios JMH (.json)
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Faça o upload do arquivo <code className="bg-zinc-100 px-1 py-0.5 rounded-sm text-zinc-800">resultados.json</code> gerado pelo Maven no terminal para confrontar seus resultados reais computados de forma interativa.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            {data !== defaultResults && defaultResults.length > 0 && (
              <button
                onClick={loadDefault}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-sm border border-zinc-300 transition cursor-pointer"
              >
                Reset para Default
              </button>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary hover:bg-primary/90 text-on-primary text-[10px] font-mono font-bold uppercase tracking-wider px-4 py-1.5 rounded-sm border border-primary transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" /> Enviar JSON
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* DRAG AND DROP ZONE */}
        <div
          onDragEnter={onDrag}
          onDragOver={onDrag}
          onDragLeave={onDrag}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-sm p-4 text-center transition-all ${
            dragActive 
              ? 'border-primary bg-primary/5 text-primary' 
              : 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 text-zinc-400'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-1.5 py-2">
            <FileJson className={`w-8 h-8 ${dragActive ? 'text-primary' : 'text-zinc-400'}`} />
            <p className="text-xs font-medium text-zinc-850">
              Arraste seu arquivo <span className="font-mono text-zinc-950 font-bold">resultados.json</span> aqui ou clique no botão acima.
            </p>
            <p className="text-[10px] text-zinc-400 font-mono">
              Processado 100% no cliente. Dados de telemetria seguros.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-sm text-red-600 text-xs flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Falha no parsing:</strong> {error}
            </div>
          </div>
        )}
      </div>

      {/* METRICAS DE AMBIENTE DETALHADAS */}
      {environmentInfo && (
        <div className="bg-zinc-950 text-white rounded-sm border border-zinc-900 p-4 grid grid-cols-2 md:grid-cols-4 gap-4" id="jmh-env-cards">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm bg-zinc-900 border border-zinc-800 text-primary shrink-0">
              <Cpu className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-[9px] text-zinc-400 font-mono uppercase block font-semibold">JVM Runtime</span>
              <span className="text-xs font-bold font-sans text-zinc-100">{environmentInfo.jdk}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0">
              <Server className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <span className="text-[9px] text-zinc-400 font-mono uppercase block font-semibold">VM Name & Versão</span>
              <span className="text-xs font-bold font-sans text-zinc-100 truncate block max-w-[150px]" title={environmentInfo.vmName}>
                {environmentInfo.vmName.replace('Server VM', '')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm bg-zinc-900 border border-zinc-800 shrink-0">
              <Layers className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <span className="text-[9px] text-zinc-400 font-mono uppercase block font-semibold">Configuração Forks</span>
              <span className="text-xs font-bold font-sans text-zinc-100">@Fork({environmentInfo.forks}) (2 trials)</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0">
              <HelpCircle className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <span className="text-[9px] text-zinc-400 font-mono uppercase block font-semibold">Modo & Métrica</span>
              <span className="text-xs font-bold font-sans text-zinc-100">Tempo Médio (ns/op)</span>
            </div>
          </div>
        </div>
      )}

      {/* FILTRO DE TAMANHO DE DADOS COLECIONADOS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-50 border border-zinc-200 rounded-sm p-4">
        <div>
          <span className="text-xs font-bold text-zinc-900 block font-mono">Controle de Volume Paramétrico</span>
          <p className="text-[11px] text-zinc-500 leading-normal font-sans">Compare as eficiências com o volume de elementos injetado na HashMap / Heap JVM.</p>
        </div>
        
        <div className="flex bg-zinc-100 p-0.5 rounded-sm border border-zinc-200 self-stretch sm:self-auto justify-between">
          {[
            { val: '1000', label: '1.000 Itens (1K)' },
            { val: '10000', label: '10.000 Itens (10K)' },
            { val: '100000', label: '100.000 Itens (100K)' }
          ].map(opt => (
            <button
              key={opt.val}
              onClick={() => setSelectedSize(opt.val)}
              className={`px-3 py-1.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wide transition-all duration-150 cursor-pointer flex-1 sm:flex-initial text-center ${
                selectedSize === opt.val
                  ? 'bg-primary text-white border-primary border shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/40'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* BLOCO CENTRAL DE GRÁFICOS E INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* GRAPH & CHART COMPARATOR (Scale & Big-O Analysis) */}
        <div className="lg:col-span-12">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-surface rounded-sm border border-zinc-200 shadow-elevation-1 p-5 space-y-6 animate-fade-in"
            id="jmh-chart-deck"
          >
            {/* Header com Metas e Títulos */}
            <div className="border-b border-zinc-150 pb-4 flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase bg-zinc-900 text-white px-2 py-0.5 rounded-sm mr-2 select-none flex items-center gap-1 w-fit">
                  <Sparkles className="w-2.5 h-2.5 text-secondary animate-pulse" /> Curva de Crescimento Empírica
                </span>
                <span className="text-xs font-mono font-bold text-zinc-400">BENCHMARK SCALE TREND PLOT</span>
                <h3 className="font-display font-bold text-base text-zinc-950 uppercase mt-1 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-secondary" /> Gráficos de Trajetória Temporal e Notação Big-O
                </h3>
                <p className="text-xs text-zinc-500 mt-1 font-sans leading-normal leading-relaxed">
                  Compare visualmente como as estruturas escalam do tamanho 1K ao 100K. Veja a diferença entre complexidades assintóticas constantes e lineares desenhadas em tempo real.
                </p>
              </div>
            </div>

            {/* BARRA DE BOTÕES E DE CONTROLES */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-zinc-50/70 p-4 border border-zinc-155 rounded-sm">
              
              {/* Seletor 1: Operação */}
              <div className="md:col-span-6 space-y-1.5">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-zinc-500 block">
                  1. Selecione a Operação de Benchmark:
                </span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: 'get_meio', label: 'Acesso no Meio (get)', desc: 'ArrayList O(1) vs LinkedList O(N)' },
                    { id: 'add_inicio', label: 'Inserção no Início (add)', desc: 'ArrayList O(N) vs LinkedList O(1)' },
                    { id: 'iteracao', label: 'Iteração Sequencial (iterator)', desc: 'Cache Locality (L1/L2)' }
                  ].map((op) => (
                    <button
                      key={op.id}
                      onClick={() => setSelectedChartOp(op.id as any)}
                      className={`px-3 py-2 rounded-sm text-[10px] font-mono font-bold uppercase transition-all duration-150 cursor-pointer flex-1 text-center border ${
                        selectedChartOp === op.id
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-white text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 border-zinc-200'
                      }`}
                    >
                      <span className="block">{op.label}</span>
                      <span className={`text-[8.5px] font-sans font-normal opacity-70 block mt-0.5 ${selectedChartOp === op.id ? 'text-zinc-100' : 'text-zinc-450'}`}>{op.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seletor 2: Escala do Eixo Y */}
              <div className="md:col-span-3 space-y-1.5">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-zinc-500 block">
                  2. Escala Vertical (Métrica):
                </span>
                <div className="flex bg-white p-0.5 rounded-sm border border-zinc-200 w-full">
                  {[
                    { id: 'linear', label: 'Linear (ns)' },
                    { id: 'log', label: 'Big-O Log10' }
                  ].map((sc) => (
                    <button
                      key={sc.id}
                      onClick={() => setChartScale(sc.id as any)}
                      className={`px-2.5 py-2 rounded-xs text-[9.5px] font-mono font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer flex-1 text-center ${
                        chartScale === sc.id
                          ? 'bg-zinc-900 text-white shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100'
                      }`}
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seletor 3: Modelo de Gráfico */}
              <div className="md:col-span-3 space-y-1.5">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-zinc-500 block">
                  3. Formato de Exibição:
                </span>
                <div className="flex bg-white p-0.5 rounded-sm border border-zinc-200 w-full">
                  {[
                    { id: 'line', label: 'Linha/Curva' },
                    { id: 'bar', label: 'Colunas' }
                  ].map((tp) => (
                    <button
                      key={tp.id}
                      onClick={() => setChartType(tp.id as any)}
                      className={`px-2.5 py-2 rounded-xs text-[9.5px] font-mono font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer flex-1 text-center ${
                        chartType === tp.id
                          ? 'bg-zinc-900 text-white shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100'
                      }`}
                    >
                      {tp.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* ÁREA DOS GRÁFICOS DO RECHARTS */}
            <div className="p-4 bg-zinc-50/20 border border-zinc-150 rounded-sm">
              <div className="h-[280px] w-full text-zinc-900 pr-4">
                <ResponsiveContainer width="100%" height="100%">
                  {(() => {
                    const sizes = ['1000', '10000', '100000'];
                    let arrayKey = '';
                    let linkedKey = '';
                    if (selectedChartOp === 'get_meio') {
                      arrayKey = 'arrayListGetMeio';
                      linkedKey = 'linkedListGetMeio';
                    } else if (selectedChartOp === 'add_inicio') {
                      arrayKey = 'arrayListAddInicio';
                      linkedKey = 'linkedListAddInicio';
                    } else if (selectedChartOp === 'iteracao') {
                      arrayKey = 'arrayListIteracao';
                      linkedKey = 'linkedListIteracao';
                    }

                    const chartDataSource = sizes.map(sz => {
                      const arrVal = getScoreForSizeAndKey(sz, arrayKey);
                      const linkVal = getScoreForSizeAndKey(sz, linkedKey);
                      
                      const displayArrVal = arrVal !== null ? parseFloat(arrVal.toFixed(2)) : 0;
                      const displayLinkVal = linkVal !== null ? parseFloat(linkVal.toFixed(2)) : 0;
                      
                      const logArr = arrVal !== null && arrVal > 0 ? parseFloat(Math.log10(arrVal).toFixed(3)) : 0;
                      const logLink = linkVal !== null && linkVal > 0 ? parseFloat(Math.log10(linkVal).toFixed(3)) : 0;

                      return {
                        sizeLabel: sz === '1000' ? '1K elements' : sz === '10000' ? '10K elements' : '100K elements',
                        ArrayList: chartScale === 'log' ? logArr : displayArrVal,
                        LinkedList: chartScale === 'log' ? logLink : displayLinkVal,
                        ArrayListRaw: arrVal,
                        LinkedListRaw: linkVal,
                      };
                    });

                    // Formata os ticks do eixo Y
                    const yAxisFormatter = (value: number) => {
                      if (chartScale === 'log') {
                        if (value <= 0) return '1 ns';
                        if (value >= 5) return '100 μs';
                        if (value >= 4) return '10 μs';
                        if (value >= 3) return '1 μs';
                        if (value >= 2) return '100 ns';
                        if (value >= 1) return '10 ns';
                        return `${Math.pow(10, value).toFixed(0)} ns`;
                      }
                      if (value >= 100000) return `${(value / 1000).toFixed(0)} µs`;
                      if (value >= 1000) return `${(value / 1000).toFixed(1)} µs`;
                      return `${value.toFixed(0)} ns`;
                    };

                    // Formata os tooltips customizados para unificar log e linear
                    const tooltipFormatter = (value: any, name: string, props: any) => {
                      const rawVal = name === 'ArrayList' ? props.payload?.ArrayListRaw : props.payload?.LinkedListRaw;
                      if (rawVal === undefined || rawVal === null) return [`${value} ns/op`, name];
                      
                      const formattedUnit = rawVal >= 100000 
                        ? `${(rawVal / 1000).toFixed(2)} µs/op` 
                        : rawVal >= 1000 
                          ? `${(rawVal / 1000).toFixed(2)} µs/op` 
                          : `${rawVal.toFixed(2)} ns/op`;

                      if (chartScale === 'log') {
                        return [`${formattedUnit} (Exponente log: ${parseFloat(value).toFixed(2)})`, name];
                      }
                      return [formattedUnit, name];
                    };

                    const labelFormatter = (label: string) => {
                      return `Volume Técnico: ${label}`;
                    };

                    if (chartType === 'line') {
                      return (
                        <RechartsLineChart data={chartDataSource} margin={{ top: 15, right: 10, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                          <XAxis dataKey="sizeLabel" stroke="#71717a" fontSize={10} fontFamily="JetBrains Mono" />
                          <YAxis 
                            stroke="#71717a" 
                            fontSize={10} 
                            fontFamily="JetBrains Mono" 
                            tickFormatter={yAxisFormatter}
                            domain={chartScale === 'log' ? [0, 'auto'] : [0, 'auto']} 
                          />
                          <RechartsTooltip 
                            formatter={tooltipFormatter} 
                            labelFormatter={labelFormatter}
                            contentStyle={{ backgroundColor: '#18181b', color: '#fff', borderRadius: '4px', border: 'none', fontSize: '11px', fontFamily: 'sans-serif' }}
                          />
                          <RechartsLegend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontFamily: 'sans-serif' }} />
                          <RechartsLine 
                            name="ArrayList" 
                            type="monotone" 
                            dataKey="ArrayList" 
                            stroke="#10b981" 
                            strokeWidth={3} 
                            activeDot={{ r: 8, strokeWidth: 0 }} 
                            dot={{ stroke: '#10b981', strokeWidth: 2, r: 4 }}
                          />
                          <RechartsLine 
                            name="LinkedList" 
                            type="monotone" 
                            dataKey="LinkedList" 
                            stroke="#18181b" 
                            strokeWidth={3} 
                            activeDot={{ r: 8, strokeWidth: 0 }} 
                            dot={{ stroke: '#18181b', strokeWidth: 2, r: 4 }}
                          />
                        </RechartsLineChart>
                      );
                    } else {
                      return (
                        <RechartsBarChart data={chartDataSource} margin={{ top: 15, right: 10, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                          <XAxis dataKey="sizeLabel" stroke="#71717a" fontSize={10} fontFamily="JetBrains Mono" />
                          <YAxis 
                            stroke="#71717a" 
                            fontSize={10} 
                            fontFamily="JetBrains Mono" 
                            tickFormatter={yAxisFormatter}
                          />
                          <RechartsTooltip 
                            formatter={tooltipFormatter} 
                            labelFormatter={labelFormatter}
                            contentStyle={{ backgroundColor: '#18181b', color: '#fff', borderRadius: '4px', border: 'none', fontSize: '11px', fontFamily: 'sans-serif' }}
                          />
                          <RechartsLegend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontFamily: 'sans-serif' }} />
                          <RechartsBar name="ArrayList" dataKey="ArrayList" fill="#10b981" radius={[2, 2, 0, 0]} />
                          <RechartsBar name="LinkedList" dataKey="LinkedList" fill="#18181b" radius={[2, 2, 0, 0]} />
                        </RechartsBarChart>
                      );
                    }
                  })()}
                </ResponsiveContainer>
              </div>
            </div>

            {/* INTERPRETATIVE EXPLANATION OF CURVE ACTIONS */}
            <motion.div 
              key={selectedChartOp}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-zinc-50 border border-zinc-200/80 p-4 rounded-sm flex items-start gap-3.5"
            >
              <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-sm shrink-0">
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xs space-y-1.5 leading-relaxed font-sans text-zinc-650">
                <span className="font-bold text-zinc-900 uppercase tracking-wide text-[10px] font-mono block">
                  Laudo do Engenheiro de Software (Diagnóstico da JVM)
                </span>
                {selectedChartOp === 'get_meio' && (
                  <p>
                    <strong>Busca no Meio:</strong> O gráfico mostra claramente o contraste assintótico. A linha do <strong className="text-zinc-950 font-semibold">ArrayList (verde)</strong> permanece rigorosamente estável e plana, confirmando sua complexidade <strong className="text-secondary font-bold">O(1)</strong> com tempo de apenas <strong>~2 ns</strong> (uma operação simples de cálculo de offset direto em endereços de memória). Já a linha do <strong className="text-zinc-950 font-semibold">LinkedList (zinc)</strong> decola vertiginosamente de forma estritamente linear <strong className="text-zinc-950 font-bold">O(N)</strong>, escalando de 633 ns para mais de 101.500 ns por busca, comprovando que o JDK é obrigado a navegar fisicamente por cerca de <strong>N/2</strong> referências na Heap para encontrar a célula do meio.
                  </p>
                )}
                {selectedChartOp === 'add_inicio' && (
                  <p>
                    <strong>Inserção no Início:</strong> Aqui as forças se invertem! O <strong className="text-zinc-650 font-semibold">LinkedList (zinc)</strong> se estabiliza em rápidos <strong>~22 ns</strong>, manifestando comportamento assintótico constante <strong className="text-zinc-950 font-bold">O(1)</strong>: criar uma nova instância na Heap e reorganizar dois ponteiros é extremamente veloz. Por outro lado, o <strong className="text-secondary font-semibold">ArrayList (verde)</strong> cresce linearmente em <strong className="text-secondary font-bold">O(N)</strong>, subindo de 126 ns para 19.030 ns. Isso ocorre porque o vetor da linguagem Java necessita migrar (shift) cada um dos 100 mil elementos vizinhos para a posição à direita, gerando cópias maciças na memória RAM física.
                  </p>
                )}
                {selectedChartOp === 'iteracao' && (
                  <p>
                    <strong>Iteração Sequencial (Completa):</strong> Embora teoricamente ambos os passeios em coleções sejam caracterizados como <strong className="text-zinc-800 font-semibold">O(N) (tempo linear total)</strong>, a evidência empírica neste gráfico mostra que o <strong className="text-secondary font-semibold">ArrayList (verde)</strong> performa <strong>3.5x mais rápido</strong> no tamanho 100K (104.472 ns vs 354.937 ns no LinkedList). Esse gap ocorre pelas especificidades físicas de hardware: o ArrayList é um array contíguo de memória com alta <strong>Cache Locality</strong>, beneficiando-se do preenchimento preemptivo de dados na CPU (L1/L2 prefetch). O LinkedList é disperso pela Heap e sofre constantes <strong>Cache Misses</strong> para resgatar referências pulverizadas.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* COMPARISON CARDS IN DEPTH */}
        <div className="lg:col-span-12 space-y-6">
          
          {comparisonGroups.length === 0 ? (
            <div className="bg-surface rounded-sm border border-zinc-200 p-12 text-center text-zinc-400">
              Nenhuma métrica correspondente encontrada para o tamanho de {parseInt(selectedSize).toLocaleString()} elementos.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comparisonGroups.map((group) => {
                const arrScore = group.arrayList?.primaryMetric.score || 0;
                const limitArrErr = group.arrayList?.primaryMetric.scoreError || 0;
                const linkScore = group.linkedList?.primaryMetric.score || 0;
                const limitLinkErr = group.linkedList?.primaryMetric.scoreError || 0;

                const isArrBetter = arrScore < linkScore;
                const magnitude = isArrBetter
                  ? (linkScore / (arrScore || 0.1)).toFixed(1)
                  : (arrScore / (linkScore || 0.1)).toFixed(1);

                // Normalização para renderizar a barra SVG (escala logarítmica ou linear adaptada rápida para tempos que variam de 1ns a 350.000ns!)
                // Usando uma escala pseudo-log para manter legível mesmo quando um é 1ns e o outro é 350.000ns
                const maxVal = Math.max(arrScore, linkScore, 1);
                const minVal = Math.min(arrScore, linkScore, 1);
                
                // Função de largura adaptativa baseada em proporção visual confortável
                // Função de largura adaptativa baseada em proporção visual confortável
                const getPct = (val: number) => {
                  if (val === 0) return 0;
                  if (maxVal === minVal) return 100;
                  // Se a disparidade for gigante (ex: get no ArrayList é 2ns vs LinkedList 100.000ns), usamos proporção logarítmica
                  if (maxVal / minVal > 50) {
                    const logMax = Math.log10(maxVal);
                    const logMin = Math.log10(minVal);
                    const logVal = Math.log10(val);
                    return 10 + 90 * ((logVal - logMin) / (logMax - logMin || 1));
                  }
                  return 10 + 90 * (val / maxVal);
                };

                return (
                  <motion.div 
                    key={group.id} 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    whileHover={{ y: -5, scale: 1.015, boxShadow: "0 12px 30px -5px rgba(0,0,0,0.08), 0 8px 12px -6px rgba(0,0,0,0.04)" }}
                    className="bg-surface border border-zinc-200 rounded-sm p-5 flex flex-col justify-between shadow-elevation-1 transition-all duration-350"
                  >
                    <div>
                      {/* Titulo */}
                      <div className="pb-3 border-b border-zinc-100 mb-4">
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">JMH Benchmark</h4>
                        <h3 className="font-display font-medium text-[13px] text-zinc-900 font-bold uppercase mt-1 leading-snug">{group.name}</h3>
                        <p className="text-[11px] text-zinc-550 font-sans mt-1 leading-normal leading-relaxed">{group.description}</p>
                      </div>

                      {/* Gráfico de Barras Horizontal */}
                      <div className="space-y-4 my-2">
                        {/* ArrayList Bar */}
                        {group.arrayList && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-mono font-bold text-zinc-700">
                              <span>ArrayList:</span>
                              <span className="text-secondary font-bold">
                                {arrScore.toFixed(3)} ns/op <span className="text-[9px] text-zinc-405 font-light">±{limitArrErr.toFixed(1)}</span>
                              </span>
                            </div>
                            <div className="w-full bg-zinc-100 h-6 rounded-sm relative overflow-hidden border border-zinc-200">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${getPct(arrScore)}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="bg-secondary/20 border-r-2 border-secondary h-full flex items-center px-2"
                              >
                                <span className="text-[9px] font-mono font-bold text-secondary-dark uppercase truncate">O(1) Direct</span>
                              </motion.div>
                            </div>
                          </div>
                        )}

                        {/* LinkedList Bar */}
                        {group.linkedList && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-mono font-bold text-zinc-800">
                              <span>LinkedList:</span>
                              <span className="font-bold">
                                {linkScore.toFixed(3)} ns/op <span className="text-[9px] text-zinc-405 font-light">±{limitLinkErr.toFixed(1)}</span>
                              </span>
                            </div>
                            <div className="w-full bg-zinc-100 h-6 rounded-sm relative overflow-hidden border border-zinc-200">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${getPct(linkScore)}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="bg-zinc-950/15 border-r-2 border-zinc-950 h-full flex items-center px-2"
                              >
                                <span className="text-[9px] font-mono font-bold text-zinc-800 uppercase truncate">
                                  {group.id === 'get_meio' ? 'O(N) Traversal' : group.id === 'add_inicio' ? 'O(1) Node' : 'Sequential'}
                                </span>
                              </motion.div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Veredito Acadêmico */}
                    <div className="mt-5 pt-4 border-t border-zinc-100">
                      <div className="bg-zinc-50 p-3 rounded-sm border border-zinc-200/60 flex items-start gap-2.5">
                        <div className={`p-1 rounded-sm text-white shrink-0 ${isArrBetter ? 'bg-secondary' : 'bg-zinc-950'}`}>
                          <Award className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-[10px] font-mono leading-relaxed text-zinc-650">
                          <strong className="text-zinc-900 block font-sans font-extrabold uppercase tracking-wide text-[9px] mb-0.5">
                            Fator de Rendimento
                          </strong>
                          O compilador JVM JVM-JIT otimizou o {isArrBetter ? 'ArrayList' : 'LinkedList'}, tornando-o{' '}
                          <strong className={`${isArrBetter ? 'text-secondary font-extrabold' : 'text-zinc-950 font-extrabold'}`}>
                            {magnitude}x
                          </strong>{' '}
                          mais rápido neste tamanho de dados.
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

        </div>

        {/* TABELA COMPARATIVA DE CRESCIMENTO EM ESCALA (TODOS OS TAMANHOS) */}
        <div className="lg:col-span-12">
          <div className="bg-surface rounded-sm border border-zinc-200 shadow-elevation-1 p-5 overflow-hidden animate-fade-in">
            <div className="border-b border-zinc-150 pb-3 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase bg-zinc-900 text-white px-2 py-0.5 rounded-sm mr-2 select-none">
                  Visão de Escala Geral
                </span>
                <span className="text-xs font-mono font-bold text-zinc-400">BIG-O COMPREHENSIVE MATRIX</span>
                <h4 className="font-display font-bold text-sm text-zinc-950 uppercase mt-1 leading-snug">
                  Matriz Comparativa de Desempenho Real vs Notação Teórica Big-O
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5 font-sans">
                  Uma compilação unificada de todos os tamanhos parametrizados. Veja como o tempo cresce para confirmar empiricamente a complexidade de algoritmos.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-650 font-mono text-[9px] uppercase tracking-wider">
                    <th className="py-3 px-3">Operação Medida</th>
                    <th className="py-3 px-3">Nº de Elementos</th>
                    <th className="py-3 px-3 text-right">Tempo ArrayList (avgt)</th>
                    <th className="py-3 px-3 text-right">Tempo LinkedList (avgt)</th>
                    <th className="py-3 px-3 text-center">Fator Multiplicador</th>
                    <th className="py-3 px-3 text-center">Estrutura Vencedora</th>
                    <th className="py-3 px-3">Explicação Física (JVM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-mono text-[11px]">
                  {[
                    {
                      label: 'Busca no Meio: get(size/2)',
                      id: 'get_meio',
                      arrayKey: 'arrayListGetMeio',
                      linkedKey: 'linkedListGetMeio',
                      sizes: ['1000', '10000', '100000'],
                      complexity: { array: 'O(1) - Direto', linked: 'O(N) - Sequencial' }
                    },
                    {
                      label: 'Inserção no Início: add(0, x)',
                      id: 'add_inicio',
                      arrayKey: 'arrayListAddInicio',
                      linkedKey: 'linkedListAddInicio',
                      sizes: ['1000', '10000', '100000'],
                      complexity: { array: 'O(N) - Shift', linked: 'O(1) - Enlace' }
                    },
                    {
                      label: 'Iteração Sequencial: for-each',
                      id: 'iteracao',
                      arrayKey: 'arrayListIteracao',
                      linkedKey: 'linkedListIteracao',
                      sizes: ['100000'], // Iteração testada preferencialmente em 100K
                      complexity: { array: 'O(N) - Contíguo', linked: 'O(N) - Disperso' }
                    }
                  ].map((row) => (
                    row.sizes.map((sz, sizeIdx) => {
                      const arrVal = getScoreForSizeAndKey(sz, row.arrayKey);
                      const linkVal = getScoreForSizeAndKey(sz, row.linkedKey);
                      
                      if (arrVal === null && linkVal === null) return null;

                      const isArrWinner = arrVal !== null && linkVal !== null ? arrVal < linkVal : arrVal !== null;
                      const ratio = arrVal !== null && linkVal !== null && arrVal > 0 && linkVal > 0
                        ? (isArrWinner ? linkVal / arrVal : arrVal / linkVal).toFixed(1)
                        : null;

                      const formattedArr = arrVal !== null ? `${arrVal.toFixed(2)} ns/op` : 'Não medido';
                      const formattedLink = linkVal !== null ? `${linkVal.toFixed(2)} ns/op` : 'Não medido';

                      return (
                        <tr key={`${row.id}-${sz}`} className="hover:bg-zinc-50/50 transition-colors">
                          {sizeIdx === 0 ? (
                            <td className="py-4 px-3 font-medium font-sans text-zinc-900 border-r border-zinc-150/60 w-[24%]" rowSpan={row.sizes.length}>
                              <div className="font-extrabold text-zinc-900">{row.label}</div>
                              <div className="text-[10px] text-zinc-400 font-normal mt-0.5">Assíntota teórica:</div>
                              <div className="text-[9.5px] mt-1 space-y-0.5">
                                <span className="block text-secondary font-bold">ArrayList: {row.complexity.array}</span>
                                <span className="block text-zinc-650 font-medium">LinkedList: {row.complexity.linked}</span>
                              </div>
                            </td>
                          ) : null}
                          <td className="py-2.5 px-3 text-zinc-600 font-sans font-bold">
                            {parseInt(sz).toLocaleString()} itens
                          </td>
                          <td className={`py-2.5 px-3 text-right ${isArrWinner ? 'text-secondary font-bold' : 'text-zinc-600'}`}>
                            {formattedArr}
                          </td>
                          <td className={`py-2.5 px-3 text-right ${!isArrWinner ? 'text-zinc-950 font-bold' : 'text-zinc-600'}`}>
                            {formattedLink}
                          </td>
                          <td className="py-2.5 px-3 text-center text-zinc-600 font-sans font-medium">
                            {ratio ? `${parseFloat(ratio).toLocaleString('pt-BR')}x mais rápido` : 'N/A'}
                          </td>
                          <td className="py-2.5 px-3 text-center select-none">
                            <span className={`inline-block px-2 py-0.5 text-[9px] font-sans font-extrabold uppercase rounded-sm border ${
                              isArrWinner
                                ? 'bg-secondary/15 text-secondary border-secondary/35'
                                : 'bg-zinc-950/15 text-zinc-800 border-zinc-950/25'
                            }`}>
                              {isArrWinner ? 'ArrayList 🏆' : 'LinkedList 🏆'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-zinc-500 font-sans leading-relaxed text-[11px] max-w-[280px]">
                            {row.id === 'get_meio' ? (
                              isArrWinner 
                                ? 'Cálculo de offset O(1) direto com ponteiro adjacente.' 
                                : 'Percorreu cerca de N/2 nós na Heap via ponteiros.'
                            ) : row.id === 'add_inicio' ? (
                              !isArrWinner 
                                ? 'Apenas instanciou e encadeou o nó na cabeça O(1).' 
                                : 'Precisou copiar todos os elementos existentes no array com shift.'
                            ) : (
                              isArrWinner 
                                ? 'Aproveitamento perfeito de pré-carregamento de cache L1.' 
                                : 'Gera cache misses sequenciais na memória principal.'
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-zinc-50 border border-zinc-200/60 p-3 rounded-sm mt-4 text-[11px] leading-relaxed text-zinc-550 font-sans">
              <span className="font-bold text-zinc-850 uppercase text-[9.5px] block mb-1">💡 Conclusão Empírica Baseada na Prática:</span>
              Repare como os tempos de busca no <strong className="text-zinc-900">LinkedList</strong> multiplicam-se por 10 conforme o tamanho do vetor escala de 1K para 10K (de ~633ns para ~6.300ns), caracterizando perfeitamente uma curva linear <strong className="text-zinc-900">O(N)</strong>. No <strong className="text-zinc-900">ArrayList</strong>, o tempo permanece virtualmente constante (~1.6ns a ~2.2ns), validando a eficiência assintótica insuperável de <strong className="text-zinc-900">O(1)</strong> para localização direta de posições de memória.
            </div>
          </div>
        </div>

        {/* INSIGHTS COMPUTACIONAIS PEDAGÓGICOS (Abaixo dos Gráficos) */}
        <div className="lg:col-span-12">
          <div className="bg-zinc-50 border border-zinc-200 rounded-sm p-5">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-4 flex items-center gap-1.5 font-sans">
              <ArrowLeftRight className="w-4 h-4 text-zinc-700" /> Comparativo de Complexidade Prática com Resultados Reais
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-zinc-900 block font-mono">1. Operação Get no Meio (arrayListGetMeio vs linkedListGetMeio)</span>
                <p className="text-zinc-550 leading-relaxed font-sans">
                  Repare nos valores no tamanho <strong>100K</strong>: o ArrayList performou em apenas <strong>2,2 ns/op</strong>, enquanto o LinkedList demorou <strong>101.569 ns (101 microssegundos) por busca!</strong>
                </p>
                <div className="p-2 py-1 bg-amber-50 text-amber-800 border border-amber-200/60 font-mono text-[9px] uppercase font-bold rounded-xs">
                  ArrayList é ~45.000x mais rápido (Acesso Direto vs Ponteiro por Ponteiro)
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-zinc-900 block font-mono">2. Inserção no Início (arrayListAddInicio vs linkedListAddInicio)</span>
                <p className="text-zinc-550 leading-relaxed font-sans">
                  No LinkedList, inserir no início é <strong>O(1)</strong> gastando constantes <strong>22 ns</strong> estáveis de 1K a 100K. No ArrayList ele salta de <strong>126 ns (1K) para 19.036 ns (100K)</strong> devido ao shift linear de memória na Array.
                </p>
                <div className="p-2 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200/60 font-mono text-[9px] uppercase font-bold rounded-xs">
                  LinkedList é ~800x mais rápido no tamanho 100.000 (Sem Deslocalizar Memória)
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-zinc-900 block font-mono">3. Iteração Completa (for-each)</span>
                <p className="text-zinc-550 leading-relaxed font-sans">
                  Ambos são <strong>O(N)</strong>, mas no tamanho 100K o ArrayList gastou <strong>104.472 ns</strong>, enquanto o LinkedList levou <strong>354.937 ns (3.5x mais lento)</strong>. Isso ocorre devido à <strong>Cache Locality</strong> do L1/L2, pois nós dispersos na Heap geram Cache Misses sequenciais.
                </p>
                <div className="p-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-mono text-[9px] uppercase font-bold rounded-xs">
                  ArrayList aproveita a proximidade física na Memória RAM Física
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
