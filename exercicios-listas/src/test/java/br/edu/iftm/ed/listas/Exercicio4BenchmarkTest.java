package br.edu.iftm.ed.listas;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class Exercicio4BenchmarkTest {

    @Test
    @DisplayName("medir deve retornar tempo nao negativo")
    void medirRetornaTempoNaoNegativo() {
        long tempo = BenchmarkPilhas.medir(() -> {
            int x = 0;
            x++;
        });
        assertTrue(tempo >= 0);
    }

    @Test
    @DisplayName("deve retornar medias para tres estruturas")
    void deveRetornarMedias() {
        Map<String, Double> medias = BenchmarkPilhas.medirMediaMs(2, 10_000);

        assertEquals(3, medias.size());
        assertTrue(medias.containsKey("PilhaArray"));
        assertTrue(medias.containsKey("PilhaLista"));
        assertTrue(medias.containsKey("ArrayDeque"));
    }
}
