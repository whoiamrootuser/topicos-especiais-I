package br.edu.iftm.ed.listas;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class Exercicio3FilaDuasPilhasTest {

    @Test
    @DisplayName("deve manter ordem FIFO")
    void deveManterOrdemFifo() {
        FilaDuasPilhas<Integer> fila = new FilaDuasPilhas<>();
        fila.enqueue(10);
        fila.enqueue(20);
        fila.enqueue(30);

        assertEquals(10, fila.dequeue());
        assertEquals(20, fila.dequeue());
        assertEquals(30, fila.dequeue());
    }

    @Test
    @DisplayName("deve falhar dequeue em fila vazia")
    void deveFalharDequeueFilaVazia() {
        FilaDuasPilhas<Integer> fila = new FilaDuasPilhas<>();
        assertThrows(NoSuchElementException.class, fila::dequeue);
    }

    @Test
    @DisplayName("peek nao remove elemento")
    void peekNaoRemove() {
        FilaDuasPilhas<String> fila = new FilaDuasPilhas<>();
        fila.enqueue("a");
        fila.enqueue("b");

        assertEquals("a", fila.peek());
        assertEquals(2, fila.size());
    }
}
