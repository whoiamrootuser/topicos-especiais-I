package br.edu.iftm.ed.exercicios;

public class TabelaHashAberta<K, V> {

    private static final Object DELETADO = new Object();
    private static final double LIMIAR_REHASH = 0.70;

    private Object[] chaves;
    private Object[] valores;
    private int tamanho;
    private int capacidade;

    public TabelaHashAberta(int capacidade) {
        if (capacidade <= 0) {
            throw new IllegalArgumentException("Capacidade deve ser maior que zero");
        }
        this.capacidade = capacidade;
        this.chaves = new Object[capacidade];
        this.valores = new Object[capacidade];
        this.tamanho = 0;
    }

    private int sonda(K chave, int i) {
        return ((chave.hashCode() & 0x7fffffff) + i) % capacidade;
    }

    public void put(K chave, V valor) {
        if (chave == null) {
            throw new IllegalArgumentException("Chave nao pode ser nula");
        }

        for (int i = 0; i < capacidade; i++) {
            int idx = sonda(chave, i);
            if (chaves[idx] != null && chaves[idx] != DELETADO && chaves[idx].equals(chave)) {
                valores[idx] = valor;
                return;
            }
        }

        if (((double) (tamanho + 1) / capacidade) >= LIMIAR_REHASH) {
            rehash();
        }

        inserirSemRehash(chave, valor);
    }

    @SuppressWarnings("unchecked")
    public V get(K chave) {
        if (chave == null) {
            throw new IllegalArgumentException("Chave nao pode ser nula");
        }

        for (int i = 0; i < capacidade; i++) {
            int idx = sonda(chave, i);
            if (chaves[idx] == null) {
                return null;
            }
            if (chaves[idx] != DELETADO && chaves[idx].equals(chave)) {
                return (V) valores[idx];
            }
        }
        return null;
    }

    private void rehash() {
        Object[] chavesAntigas = chaves;
        Object[] valoresAntigos = valores;

        capacidade = capacidade * 2;
        chaves = new Object[capacidade];
        valores = new Object[capacidade];

        int tamanhoAnterior = tamanho;
        tamanho = 0;

        for (int i = 0; i < chavesAntigas.length; i++) {
            if (chavesAntigas[i] != null && chavesAntigas[i] != DELETADO) {
                @SuppressWarnings("unchecked")
                K chave = (K) chavesAntigas[i];
                @SuppressWarnings("unchecked")
                V valor = (V) valoresAntigos[i];
                inserirSemRehash(chave, valor);
            }
        }

        if (tamanho != tamanhoAnterior) {
            throw new IllegalStateException("Falha ao migrar elementos no rehash");
        }
    }

    private void inserirSemRehash(K chave, V valor) {
        for (int i = 0; i < capacidade; i++) {
            int idx = sonda(chave, i);
            if (chaves[idx] == null || chaves[idx] == DELETADO) {
                chaves[idx] = chave;
                valores[idx] = valor;
                tamanho++;
                return;
            }
        }
        throw new IllegalStateException("Tabela cheia");
    }

    public double fatorDeCarga() {
        return (double) tamanho / capacidade;
    }

    public int tamanho() {
        return tamanho;
    }

    public int capacidade() {
        return capacidade;
    }
}
