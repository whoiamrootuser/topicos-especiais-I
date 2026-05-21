package br.edu.iftm.ed.listas;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class Desafio2BufferCircularTest {

    @Test
    @DisplayName("deve descartar mais antigo quando cheio")
    void descartaMaisAntigoQuandoCheio() {
        BufferCircular<String> buffer = new BufferCircular<>(3);
        buffer.adicionar("A");
        buffer.adicionar("B");
        buffer.adicionar("C");
        buffer.adicionar("D");

        assertEquals(3, buffer.tamanho());
        assertEquals("B", buffer.removerMaisAntigo());
        assertEquals("C", buffer.removerMaisAntigo());
        assertEquals("D", buffer.removerMaisAntigo());
    }

    @Test
    @DisplayName("deve sinalizar estado vazio e cheio")
    void sinalizaEstados() {
        BufferCircular<Integer> buffer = new BufferCircular<>(2);
        assertTrue(buffer.estaVazio());
        assertFalse(buffer.estaCheio());

        buffer.adicionar(1);
        buffer.adicionar(2);
        assertTrue(buffer.estaCheio());
    }

    @Test
    @DisplayName("remover em buffer vazio deve falhar")
    void removerVazioFalha() {
        BufferCircular<Integer> buffer = new BufferCircular<>(2);
        assertThrows(NoSuchElementException.class, buffer::removerMaisAntigo);
    }
}
