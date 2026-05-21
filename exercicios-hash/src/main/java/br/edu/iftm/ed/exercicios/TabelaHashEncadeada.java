package br.edu.iftm.ed.exercicios;

import java.util.Iterator;
import java.util.LinkedList;

public class TabelaHashEncadeada<K, V> {

    private static final int CAPACIDADE_PADRAO = 16;

    private LinkedList<Entrada<K, V>>[] buckets;
    private int tamanho;

    @SuppressWarnings("unchecked")
    public TabelaHashEncadeada(int capacidade) {
        if (capacidade <= 0) {
            throw new IllegalArgumentException("Capacidade deve ser maior que zero");
        }

        buckets = new LinkedList[capacidade];
        for (int i = 0; i < capacidade; i++) {
            buckets[i] = new LinkedList<>();
        }
        this.tamanho = 0;
    }

    public TabelaHashEncadeada() {
        this(CAPACIDADE_PADRAO);
    }

    private int indiceBucket(K k) {
        if (k == null) {
            throw new IllegalArgumentException("Chave nao pode ser nula");
        }
        return (k.hashCode() & 0x7fffffff) % buckets.length;
    }

    public void put(K chave, V valor) {
        int indice = indiceBucket(chave);
        LinkedList<Entrada<K, V>> bucket = buckets[indice];

        for (Entrada<K, V> entrada : bucket) {
            if (entrada.chave.equals(chave)) {
                entrada.valor = valor;
                return;
            }
        }

        bucket.add(new Entrada<>(chave, valor));
        tamanho++;
    }

    public V get(K chave) {
        int indice = indiceBucket(chave);

        for (Entrada<K, V> entrada : buckets[indice]) {
            if (entrada.chave.equals(chave)) {
                return entrada.valor;
            }
        }
        return null;
    }

    public boolean remove(K chave) {
        int indice = indiceBucket(chave);
        Iterator<Entrada<K, V>> iterator = buckets[indice].iterator();

        while (iterator.hasNext()) {
            Entrada<K, V> entrada = iterator.next();
            if (entrada.chave.equals(chave)) {
                iterator.remove();
                tamanho--;
                return true;
            }
        }
        return false;
    }

    public int tamanho() {
        return tamanho;
    }

    public boolean estaVazia() {
        return tamanho == 0;
    }

    private static class Entrada<K, V> {
        K chave;
        V valor;

        Entrada(K chave, V valor) {
            this.chave = chave;
            this.valor = valor;
        }
    }
}
