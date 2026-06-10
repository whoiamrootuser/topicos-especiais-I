package br.edu.iftm;

import org.openjdk.jmh.annotations.*;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.Random;
import java.util.concurrent.TimeUnit;

/**
 * Passo 1 - Implementação do Benchmark de Coleções em Java (JMH 1.37)
 * Projeto: IFTM - Campus Uberlândia Centro
 * Disciplina: Estrutura de Dados
 * 
 * Este arquivo usa o parâmetro @Param para forçar tamanhos distintos no mesmo
 * benchmark (isto gera automaticamente 6 linhas no relatório final sem duplicar código).
 */
@State(Scope.Benchmark)
@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.NANOSECONDS)
@Warmup(iterations = 5, time = 1, timeUnit = TimeUnit.SECONDS)
@Measurement(iterations = 5, time = 1, timeUnit = TimeUnit.SECONDS)
@Fork(2)
public class ColecoesBenchmark {

    @Param({"1000", "10000", "100000"})
    private int tamanho;

    private ArrayList<Integer> arrayList;
    private LinkedList<Integer> linkedList;
    private int elemento;

    @Setup(Level.Trial)
    public void setup() {
        arrayList = new ArrayList<>(tamanho);
        linkedList = new LinkedList<>();
        Random random = new Random();
        elemento = random.nextInt();

        // Popula as coleções de acordo com o tamanho corrente do @Param
        for (int i = 0; i < tamanho; i++) {
            int val = random.nextInt();
            arrayList.add(val);
            linkedList.add(val);
        }
    }

    // --- BENCHMARK 1: GET NO MEIO ---
    @Benchmark
    public int arrayListGetMeio() {
        return arrayList.get(tamanho / 2);
    }

    @Benchmark
    public int linkedListGetMeio() {
        return linkedList.get(tamanho / 2);
    }

    // --- BENCHMARK 2: ADD NO INÍCIO ---
    @Benchmark
    public void arrayListAddInicio() {
        // Insere na primeira posição (provoca shift dos demais elementos)
        arrayList.add(0, elemento);
        // Remove para evitar consumo ilimitado de memória e manter o tamanho estável
        arrayList.remove(0);
    }

    @Benchmark
    public void linkedListAddInicio() {
        // Insere usando ponteiro direto O(1) na cabeça
        linkedList.addFirst(elemento);
        // Remove para manter o tamanho idêntico do setup
        linkedList.removeFirst();
    }

    // --- BENCHMARK 3: ITERAÇÃO COMPLETA (Apenas para tamanho 100K) ---
    @Benchmark
    public int arrayListIteracao() {
        // Restrição pedagógica: medir apenas para tamanho 100K
        if (tamanho != 100000) {
            return 0;
        }
        int sum = 0;
        for (Integer item : arrayList) {
            sum += item;
        }
        return sum;
    }

    @Benchmark
    public int linkedListIteracao() {
        // Restrição pedagógica: medir apenas para tamanho 100K
        if (tamanho != 100000) {
            return 0;
        }
        int sum = 0;
        for (Integer item : linkedList) {
            sum += item;
        }
        return sum;
    }
}