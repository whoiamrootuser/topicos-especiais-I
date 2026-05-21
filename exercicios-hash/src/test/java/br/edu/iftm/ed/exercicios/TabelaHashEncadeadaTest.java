package br.edu.iftm.ed.exercicios;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TabelaHashEncadeadaTest {

    private TabelaHashEncadeada<String, Integer> tabela;

    @BeforeEach
    void setUp() {
        tabela = new TabelaHashEncadeada<>(4);
    }

    @Test
    @DisplayName("put e get: chave inserida deve ser recuperada")
    void testPutGet() {
        tabela.put("produto-42", 100);

        assertEquals(100, tabela.get("produto-42"));
    }

    @Test
    @DisplayName("put com atualizacao: tamanho nao deve aumentar")
    void testAtualizacaoNaoIncrementaTamanho() {
        tabela.put("chave", 10);
        tabela.put("chave", 99);

        assertEquals(1, tabela.tamanho());
        assertEquals(99, tabela.get("chave"));
    }

    @Test
    @DisplayName("colisao: duas chaves no mesmo bucket devem ser recuperadas corretamente")
    void testColisao() {
        tabela.put("A", 1);
        tabela.put("E", 2);

        assertEquals(1, tabela.get("A"));
        assertEquals(2, tabela.get("E"));
        assertEquals(2, tabela.tamanho());
    }
}
