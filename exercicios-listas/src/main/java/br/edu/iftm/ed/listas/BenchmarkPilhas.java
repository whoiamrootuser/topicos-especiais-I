package br.edu.iftm.ed.listas;

import java.util.ArrayDeque;
import java.util.LinkedHashMap;
import java.util.Map;

public final class BenchmarkPilhas {

    private BenchmarkPilhas() {
    }

    public static long medir(Runnable tarefa) {
        tarefa.run();
        long inicio = System.nanoTime();
        tarefa.run();
        return System.nanoTime() - inicio;
    }

    public static Map<String, Double> medirMediaMs(int repeticoes, int operacoes) {
        if (repeticoes <= 0 || operacoes <= 0) {
            throw new IllegalArgumentException("Repeticoes e operacoes devem ser maiores que zero");
        }

        double somaArray = 0;
        double somaLista = 0;
        double somaDeque = 0;

        for (int rodada = 0; rodada < repeticoes; rodada++) {
            somaArray += medir(() -> {
                PilhaArray<Integer> p = new PilhaArray<>();
                for (int i = 0; i < operacoes; i++) {
                    p.push(i);
                    p.pop();
                }
            }) / 1e6;

            somaLista += medir(() -> {
                PilhaLista<Integer> p = new PilhaLista<>();
                for (int i = 0; i < operacoes; i++) {
                    p.push(i);
                    p.pop();
                }
            }) / 1e6;

            somaDeque += medir(() -> {
                ArrayDeque<Integer> p = new ArrayDeque<>();
                for (int i = 0; i < operacoes; i++) {
                    p.push(i);
                    p.pop();
                }
            }) / 1e6;
        }

        Map<String, Double> medias = new LinkedHashMap<>();
        medias.put("PilhaArray", somaArray / repeticoes);
        medias.put("PilhaLista", somaLista / repeticoes);
        medias.put("ArrayDeque", somaDeque / repeticoes);
        return medias;
    }
}
