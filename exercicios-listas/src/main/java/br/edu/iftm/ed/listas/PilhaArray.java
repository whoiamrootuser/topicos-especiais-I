package br.edu.iftm.ed.listas;

import java.util.NoSuchElementException;

public class PilhaArray<T> implements Pilha<T> {

    private static final int CAPACIDADE_INICIAL = 16;

    private Object[] dados;
    private int topo;

    public PilhaArray() {
        this.dados = new Object[CAPACIDADE_INICIAL];
        this.topo = 0;
    }

    @Override
    public void push(T elemento) {
        garantirCapacidade();
        dados[topo++] = elemento;
    }

    @Override
    @SuppressWarnings("unchecked")
    public T pop() {
        if (isEmpty()) {
            throw new NoSuchElementException("Pilha vazia");
        }
        int indiceTopo = --topo;
        T valor = (T) dados[indiceTopo];
        dados[indiceTopo] = null;
        return valor;
    }

    @Override
    @SuppressWarnings("unchecked")
    public T peek() {
        if (isEmpty()) {
            throw new NoSuchElementException("Pilha vazia");
        }
        return (T) dados[topo - 1];
    }

    @Override
    public boolean isEmpty() {
        return topo == 0;
    }

    @Override
    public int size() {
        return topo;
    }

    private void garantirCapacidade() {
        if (topo < dados.length) {
            return;
        }
        Object[] novo = new Object[dados.length * 2];
        System.arraycopy(dados, 0, novo, 0, dados.length);
        dados = novo;
    }
}
