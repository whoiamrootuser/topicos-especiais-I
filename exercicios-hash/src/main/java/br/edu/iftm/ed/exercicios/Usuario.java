package br.edu.iftm.ed.exercicios;

public class Usuario {

    private final long id;
    private final String perfil;

    public Usuario(long id, String perfil) {
        this.id = id;
        this.perfil = perfil;
    }

    public long getId() {
        return id;
    }

    public String getPerfil() {
        return perfil;
    }
}
