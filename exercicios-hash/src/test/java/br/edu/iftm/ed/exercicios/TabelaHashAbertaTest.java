package br.edu.iftm.ed.exercicios;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TabelaHashAbertaTest {

    @Test
    @DisplayName("rehashing deve disparar quando fator de carga atinge 0.70")
    void testRehashDisparaNoLimiar() {
        TabelaHashAberta<Integer, String> tabela = new TabelaHashAberta<>(10);

        tabela.put(1, "a");
        tabela.put(2, "b");
        tabela.put(3, "c");
        tabela.put(4, "d");
        tabela.put(5, "e");
        tabela.put(6, "f");
        tabela.put(7, "g");

        assertEquals(20, tabela.capacidade());
        assertEquals(7, tabela.tamanho());
    }

    @Test
    @DisplayName("rehashing deve migrar corretamente todos os pares")
    void testRehashMigraTodosPares() {
        TabelaHashAberta<Integer, String> tabela = new TabelaHashAberta<>(4);

        tabela.put(1, "um");
        tabela.put(2, "dois");
        tabela.put(3, "tres");
        tabela.put(4, "quatro");

        assertEquals("um", tabela.get(1));
        assertEquals("dois", tabela.get(2));
        assertEquals("tres", tabela.get(3));
        assertEquals("quatro", tabela.get(4));
        assertEquals(4, tabela.tamanho());
    }
}
