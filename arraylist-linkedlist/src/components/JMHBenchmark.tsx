import React, { useState } from 'react';
import { FileCode, Copy, Check, Terminal, ExternalLink, BookOpen, Settings, Play, BarChart4, Code } from 'lucide-react';
import JMHVisualizer from './JMHVisualizer';

export default function JMHBenchmark() {
  const [copiedText, setCopiedText] = useState<'java' | 'pom' | 'run' | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<'results' | 'code'>('results');
  const [activeCodeTab, setActiveCodeTab] = useState<'java' | 'pom' | 'execution'>('java');

  const javaCode = `package br.edu.iftm;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.openjdk.jmh.annotations.Benchmark;
import org.openjdk.jmh.annotations.BenchmarkMode;
import org.openjdk.jmh.annotations.Fork;
import org.openjdk.jmh.annotations.Level;
import org.openjdk.jmh.annotations.Measurement;
import org.openjdk.jmh.annotations.Mode;
import org.openjdk.jmh.annotations.OutputTimeUnit;
import org.openjdk.jmh.annotations.Param;
import org.openjdk.jmh.annotations.Scope;
import org.openjdk.jmh.annotations.Setup;
import org.openjdk.jmh.annotations.State;
import org.openjdk.jmh.annotations.TearDown;
import org.openjdk.jmh.annotations.Warmup;

@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.NANOSECONDS)
@Warmup(iterations = 5)
@Measurement(iterations = 5, time = 1, timeUnit = TimeUnit.SECONDS)
@Fork(2)
public class ColecoesBenchmark {

    // Estado usado para benchmarks que variam tamanho entre 1K, 10K e 100K
    @State(Scope.Benchmark)
    public static class GeneralState {
        @Param({"1000", "10000", "100000"})
        public int tamanho;

        public List<Integer> arrayList;
        public LinkedList<Integer> linkedList;

        @Setup(Level.Trial)
        public void setup() {
            arrayList = new ArrayList<>();
            linkedList = new LinkedList<>();
            for (int i = 0; i < tamanho; i++) {
                arrayList.add(i);
                linkedList.add(i);
            }
        }

        @TearDown(Level.Invocation)
        public void tearDown() {
            // Restaura as listas ao estado inicial após cada invocação do benchmark
            arrayList.clear();
            linkedList.clear();
            for (int i = 0; i < tamanho; i++) {
                arrayList.add(i);
                linkedList.add(i);
            }
        }
    }

    // Estado separado para iteração completa — fixo em 100K
    @State(Scope.Benchmark)
    public static class IterationState {
        @Param({"100000"})
        public int tamanho;

        public List<Integer> arrayList;
        public LinkedList<Integer> linkedList;

        @Setup(Level.Trial)
        public void setup() {
            arrayList = new ArrayList<>();
            linkedList = new LinkedList<>();
            for (int i = 0; i < tamanho; i++) {
                arrayList.add(i);
                linkedList.add(i);
            }
        }

        @TearDown(Level.Invocation)
        public void tearDown() {
            // Restaura as listas ao estado inicial após cada invocação do benchmark
            arrayList.clear();
            linkedList.clear();
            for (int i = 0; i < tamanho; i++) {
                arrayList.add(i);
                linkedList.add(i);
            }
        }
    }

    // --- OPERAÇÃO 1: Acesso ao meio da lista ---
    @Benchmark
    public Integer arrayListGetMeio(GeneralState s) {
        return s.arrayList.get(s.tamanho / 2);
    }

    @Benchmark
    public Integer linkedListGetMeio(GeneralState s) {
        return s.linkedList.get(s.tamanho / 2);
    }

    // --- OPERAÇÃO 2: Inserção no início ---
    @Benchmark
    public void arrayListAddInicio(GeneralState s) {
        s.arrayList.add(0, 999);
    }

    @Benchmark
    public void linkedListAddInicio(GeneralState s) {
        s.linkedList.addFirst(999);
    }

    // --- OPERAÇÃO 3: Iteração completa (apenas 100K) ---
    @Benchmark
    public void arrayListIteracao(IterationState s) {
        for (Integer elemento : s.arrayList) {
            int atual = elemento;
        }
    }

    @Benchmark
    public void linkedListIteracao(IterationState s) {
        for (Integer elemento : s.linkedList) {
            int atual = elemento;
        }
    }

    // Método principal para executar o benchmark direto pela IDE ou terminal
    public static void main(String[] args) throws Exception {
        org.openjdk.jmh.runner.options.Options opt = new org.openjdk.jmh.runner.options.OptionsBuilder()
                .include(ColecoesBenchmark.class.getSimpleName())
                .build();

        new org.openjdk.jmh.runner.Runner(opt).run();
    }
}`;

  const pomXml = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>br.edu.iftm</groupId>
    <artifactId>benchmark-colecoes</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <jmh.version>1.37</jmh.version>
        <uberjar.name>benchmarks</uberjar.name>
    </properties>

    <dependencies>
        <!-- JMH Core Dependency -->
        <dependency>
            <groupId>org.openjdk.jmh</groupId>
            <artifactId>jmh-core</artifactId>
            <version>\${jmh.version}</version>
        </dependency>
        <!-- JMH Annotation Processor -->
        <dependency>
            <groupId>org.openjdk.jmh</groupId>
            <artifactId>jmh-generator-annprocess</artifactId>
            <version>\${jmh.version}</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <!-- Maven Compiler Plugin -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <source>\${maven.compiler.source}</source>
                    <target>\${maven.compiler.target}</target>
                </configuration>
            </plugin>

            <!-- Maven Shader Plugin para gerar o executável Uber-JAR contendo o JMH Runner -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-shade-plugin</artifactId>
                <version>3.5.0</version>
                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals>
                            <goal>shade</goal>
                        </goals>
                        <configuration>
                            <finalName>\${uberjar.name}</finalName>
                            <transformers>
                                <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                                    <mainClass>org.openjdk.jmh.Main</mainClass>
                                </transformer>
                                <transformer implementation="org.apache.maven.plugins.shade.resource.ServicesResourceTransformer"/>
                            </transformers>
                            <filters>
                                <filter>
                                    <artifact>*:*</artifact>
                                    <excludes>
                                        <exclude>META-INF/*.SF</exclude>
                                        <exclude>META-INF/*.DSA</exclude>
                                        <exclude>META-INF/*.RSA</exclude>
                                    </excludes>
                                </filter>
                            </filters>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>`;

  const executionCommands = `# 1. Compile e empacote as dependências usando Maven corporativo
mvn clean package

# 2. Execute o executável JAR gerado pelo JMH no terminal de comando
java -jar target/benchmarks.jar

# (Opcional) Guardar os resultados em um arquivo de relatório JSON para análise gráfica
java -jar target/benchmarks.jar -rf json -rff resultados.json`;

  const copyToClipboard = (text: string, type: 'java' | 'pom' | 'run') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="bg-surface rounded-sm border border-zinc-200 shadow-elevation-1 p-6 animate-fade-in" id="jmh-benchmark-panel">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-zinc-100">
        <div>
          <h2 className="font-display font-bold text-base text-zinc-900 uppercase tracking-wider flex items-center gap-2">
            <span className="p-1.5 bg-primary text-on-primary rounded-sm border border-primary">
              <FileCode className="w-4 h-4" />
            </span>
            Implementação Científica com Java Microbenchmark Harness (JMH)
          </h2>
          <p className="text-xs text-zinc-500 font-sans mt-0.5">
            Analise e confronte resultados de forma científica na máquina virtual (JVM) usando o harness definitivo do OpenJDK.
          </p>
        </div>

        {/* MENU PRINCIPAL DE NÍVEL 1: RELATÓRIO vs CODIGOS */}
        <div className="flex bg-zinc-100 p-0.5 rounded-sm border border-zinc-200 max-w-full">
          <button
            onClick={() => setActiveMainTab('results')}
            className={`px-4 py-2 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              activeMainTab === 'results'
                ? 'bg-primary text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/45'
            }`}
          >
            <BarChart4 className="w-3.5 h-3.5" /> 1. Relatório Analítico
          </button>
          <button
            onClick={() => setActiveMainTab('code')}
            className={`px-4 py-2 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              activeMainTab === 'code'
                ? 'bg-primary text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/45'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> 2. Códigos e Scripts (Submenu)
          </button>
        </div>
      </div>

      {/* PAINEL INFORMATIVO DO PASSO */}
      <div className="bg-zinc-50 rounded-sm border border-zinc-200 p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex gap-2 text-xs">
          <Settings className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-zinc-900 block font-mono">Configuração do Fork</span>
            <p className="text-zinc-500 mt-0.5">Executa @Fork(2) para rodar o benchmark em processos JVM independentes frios, mitigando o viés do compilador JIT.</p>
          </div>
        </div>
        <div className="flex gap-2 text-xs">
          <BookOpen className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-zinc-900 block font-mono">Fase de Warmup</span>
            <p className="text-zinc-500 mt-0.5">Configurado com 5 iterações prévias de aquecimento para permitir ao compilador otimizar e compilar a quente.</p>
          </div>
        </div>
        <div className="flex gap-2 text-xs">
          <Play className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-zinc-900 block font-mono">Variável Dinâmica @Param</span>
            <p className="text-zinc-500 mt-0.5">Define <code className="bg-zinc-200 px-1 py-0.2 rounded font-mono text-[10px] font-bold text-zinc-900">private int tamanho;</code> para testar ciclicamente 1K, 10K e 100K de forma sequencial automática.</p>
          </div>
        </div>
      </div>

      {/* EXIBIÇÃO DE CONTEÚDO BASEADO NO TAB PRINCIPAL */}
      <div className="relative">
        
        {/* CASO RELATÓRIO SELECIONADO */}
        {activeMainTab === 'results' && (
          <JMHVisualizer />
        )}

        {/* CASO CÓDIGO SELECIONADO - APRESENTA SUBMENU DE SUBTABS */}
        {activeMainTab === 'code' && (
          <div className="space-y-4">
            
            {/* SUBMENU DOS CÓDIGOS EM SI */}
            <div className="flex border-b border-zinc-200 gap-1 overflow-x-auto max-w-full pb-2">
              <button
                onClick={() => setActiveCodeTab('java')}
                className={`px-3 py-1.5 rounded-sm text-[10px] font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                  activeCodeTab === 'java'
                    ? 'border-b-2 border-primary text-primary font-extrabold'
                    : 'text-zinc-500 hover:text-zinc-950'
                }`}
              >
                ColecoesBenchmark.java
              </button>
              <button
                onClick={() => setActiveCodeTab('pom')}
                className={`px-3 py-1.5 rounded-sm text-[10px] font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                  activeCodeTab === 'pom'
                    ? 'border-b-2 border-primary text-primary font-extrabold'
                    : 'text-zinc-500 hover:text-zinc-950'
                }`}
              >
                pom.xml (Maven)
              </button>
              <button
                onClick={() => setActiveCodeTab('execution')}
                className={`px-3 py-1.5 rounded-sm text-[10px] font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                  activeCodeTab === 'execution'
                    ? 'border-b-2 border-primary text-primary font-extrabold'
                    : 'text-zinc-500 hover:text-zinc-950'
                }`}
              >
                Instruções de Execução
              </button>
            </div>

            {/* CONTEÚDO DO SUBMENU */}
            <div>
              {activeCodeTab === 'java' && (
                <div>
                  <div className="flex justify-between items-center bg-zinc-900 text-zinc-400 px-4 py-2 rounded-t-sm text-[10px] font-mono border-b border-zinc-800">
                    <span className="uppercase text-white font-bold select-none text-[9px]">JAVA SOURCE CODE (JMH 1.37)</span>
                    <button
                      onClick={() => copyToClipboard(javaCode, 'java')}
                      className="hover:text-white transition flex items-center gap-1 cursor-pointer bg-zinc-800 px-2 py-1 rounded-sm border border-zinc-700 hover:border-zinc-500 text-[10px]"
                    >
                      {copiedText === 'java' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copiar Código
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 bg-zinc-950 text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto rounded-b-sm border border-zinc-900 border-t-0 max-h-[500px]">
                    <code>{javaCode}</code>
                  </pre>
                </div>
              )}

              {activeCodeTab === 'pom' && (
                <div>
                  <div className="flex justify-between items-center bg-zinc-900 text-zinc-400 px-4 py-2 rounded-t-sm text-[10px] font-mono border-b border-zinc-800">
                    <span className="uppercase text-white font-bold select-none text-[9px]">pom.xml (MAVEN PROJECT CONFIG)</span>
                    <button
                      onClick={() => copyToClipboard(pomXml, 'pom')}
                      className="hover:text-white transition flex items-center gap-1 cursor-pointer bg-zinc-800 px-2 py-1 rounded-sm border border-zinc-700 hover:border-zinc-500 text-[10px]"
                    >
                      {copiedText === 'pom' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copiar Código
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 bg-zinc-950 text-indigo-300 font-mono text-[11px] leading-relaxed overflow-x-auto rounded-b-sm border border-zinc-900 border-t-0 max-h-[500px]">
                    <code>{pomXml}</code>
                  </pre>
                </div>
              )}

              {activeCodeTab === 'execution' && (
                <div className="space-y-6">
                  <div className="border border-zinc-200 rounded-sm">
                    <div className="flex justify-between items-center bg-zinc-900 text-zinc-400 px-4 py-2 rounded-t-sm text-[10px] font-mono border-b border-zinc-800">
                      <span className="text-white font-bold select-none text-[9px]">MANDAS DE COMPILAÇÃO E EXECUÇÃO</span>
                      <button
                        onClick={() => copyToClipboard(executionCommands, 'run')}
                        className="hover:text-white transition flex items-center gap-1 cursor-pointer bg-zinc-800 px-2 py-1 rounded-sm border border-zinc-700 hover:border-zinc-500 text-[10px]"
                      >
                        {copiedText === 'run' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" /> Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copiar Comandos
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-4 bg-zinc-950 text-zinc-100 font-mono text-[11px] leading-relaxed overflow-x-auto border border-zinc-900 border-t-0 rounded-b-sm">
                      <div className="text-zinc-500 mb-2">// Copie os comandos abaixo para o seu terminal raiz (onde reside o arquivo pom.xml)</div>
                      <code>{executionCommands}</code>
                    </div>
                  </div>

                  {/* GUIA DE REQUISITOS */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-sm p-4 animate-fade-in">
                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-sans">
                      <Terminal className="w-4 h-4 text-zinc-700" /> Requisitos do Ambiente de Desenvolvimento
                    </h4>
                    <ul className="text-xs text-zinc-650 list-inside list-disc space-y-2 mt-2 leading-relaxed">
                      <li><strong>Java JDK 17</strong> ou superior configurado no PATH do sistema operacional.</li>
                      <li><strong>Apache Maven</strong> instalado para compilar o ciclo shade-jar de dependências.</li>
                      <li>Para obter resultados de precisão nanométrica fidedignos, feche outros aplicativos pesados (navegadores, IDEs, jogos) durante a execução do JAR no terminal.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}
