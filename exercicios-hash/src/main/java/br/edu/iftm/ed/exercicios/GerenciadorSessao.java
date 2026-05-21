package br.edu.iftm.ed.exercicios;

public class GerenciadorSessao {

    private static final int CAPACIDADE_INICIAL = 128;

    private final TabelaHashEncadeada<String, Usuario> sessoes;

    public GerenciadorSessao() {
        this.sessoes = new TabelaHashEncadeada<>(CAPACIDADE_INICIAL);
    }

    public void registrar(String token, Usuario usuario) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token nao pode ser nulo ou vazio");
        }
        if (usuario == null) {
            throw new IllegalArgumentException("Usuario nao pode ser nulo");
        }
        sessoes.put(token, usuario);
    }

    public Usuario buscar(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token nao pode ser nulo ou vazio");
        }
        return sessoes.get(token);
    }

    public boolean invalidar(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token nao pode ser nulo ou vazio");
        }
        return sessoes.remove(token);
    }

    public boolean eValido(String token) {
        return buscar(token) != null;
    }
}
