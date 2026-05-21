package br.edu.iftm.ed.exercicios;

import java.util.Objects;

public class Sessao {

    private final String token;

    public Sessao(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token nao pode ser nulo ou vazio");
        }
        this.token = token;
    }

    public String getToken() {
        return token;
    }

    @Override
    public int hashCode() {
        return Objects.hash(token);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Sessao)) {
            return false;
        }
        Sessao sessao = (Sessao) o;
        return Objects.equals(token, sessao.token);
    }
}
