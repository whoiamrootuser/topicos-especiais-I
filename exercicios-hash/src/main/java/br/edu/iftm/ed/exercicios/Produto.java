package br.edu.iftm.ed.exercicios;

import java.util.Objects;

public class Produto {

    private final String sku;
    private final String nome;

    public Produto(String sku, String nome) {
        if (sku == null || sku.trim().isEmpty()) {
            throw new IllegalArgumentException("SKU nao pode ser nulo ou vazio");
        }
        this.sku = sku;
        this.nome = nome;
    }

    public String getSku() {
        return sku;
    }

    public String getNome() {
        return nome;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Produto)) {
            return false;
        }
        Produto produto = (Produto) o;
        return Objects.equals(sku, produto.sku);
    }

    @Override
    public int hashCode() {
        return Objects.hash(sku);
    }
}
