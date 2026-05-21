package br.edu.iftm.ed.listas;

import java.util.NoSuchElementException;

public class BufferCircular<T> {

    private final Object[] dados;
    private int inicio;
    private int fim;
    private int quantidade;

    public BufferCircular(int capacidade) {
        if (capacidade <= 0) {
            throw new IllegalArgumentException("Capacidade deve ser maior que zero");
        }
        this.dados = new Object[capacidade];
    }

    public void adicionar(T elemento) {
        dados[fim] = elemento;
        fim = (fim + 1) % dados.length;
        if (quantidade == dados.length) {
            inicio = (inicio + 1) % dados.length;
        } else {
            quantidade++;
        }
    }

    @SuppressWarnings("unchecked")
    public T removerMaisAntigo() {
        if (estaVazio()) {
            throw new NoSuchElementException("Buffer vazio");
        }
        T valor = (T) dados[inicio];
        dados[inicio] = null;
        inicio = (inicio + 1) % dados.length;
        quantidade--;
        return valor;
    }

    public boolean estaVazio() {
        return quantidade == 0;
    }

    public boolean estaCheio() {
        return quantidade == dados.length;
    }

    public int tamanho() {
        return quantidade;
    }
}
