package br.edu.iftm.ed.listas;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class Desafio1PilhaComMinimoTest {

    @Test
    @DisplayName("minimo deve acompanhar pushes")
    void minimoAcompanhaPushes() {
        PilhaComMinimo<Integer> pilha = new PilhaComMinimo<>();

        pilha.push(5);
        assertEquals(5, pilha.min());
        pilha.push(3);
        assertEquals(3, pilha.min());
        pilha.push(7);
        assertEquals(3, pilha.min());
    }

    @Test
    @DisplayName("minimo deve atualizar quando antigo minimo sai")
    void minimoAtualizaAposPop() {
        PilhaComMinimo<Integer> pilha = new PilhaComMinimo<>();

        pilha.push(4);
        pilha.push(2);
        pilha.push(6);

        assertEquals(2, pilha.min());
        pilha.pop();
        assertEquals(2, pilha.min());
        pilha.pop();
        assertEquals(4, pilha.min());
    }

    @Test
    @DisplayName("min em pilha vazia deve falhar")
    void minVazioFalha() {
        PilhaComMinimo<Integer> pilha = new PilhaComMinimo<>();
        assertThrows(NoSuchElementException.class, pilha::min);
    }
}
