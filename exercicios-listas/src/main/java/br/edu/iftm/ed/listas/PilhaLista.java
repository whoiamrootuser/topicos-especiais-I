package br.edu.iftm.ed.listas;

import java.util.NoSuchElementException;

public class PilhaLista<T> implements Pilha<T> {

    private No<T> topo;
    private int tamanho;

    @Override
    public void push(T elemento) {
        topo = new No<>(elemento, topo);
        tamanho++;
    }

    @Override
    public T pop() {
        if (isEmpty()) {
            throw new NoSuchElementException("Pilha vazia");
        }
        T valor = topo.valor;
        topo = topo.proximo;
        tamanho--;
        return valor;
    }

    @Override
    public T peek() {
        if (isEmpty()) {
            throw new NoSuchElementException("Pilha vazia");
        }
        return topo.valor;
    }

    @Override
    public boolean isEmpty() {
        return tamanho == 0;
    }

    @Override
    public int size() {
        return tamanho;
    }

    private static class No<T> {
        private final T valor;
        private final No<T> proximo;

        private No(T valor, No<T> proximo) {
            this.valor = valor;
            this.proximo = proximo;
        }
    }
}
