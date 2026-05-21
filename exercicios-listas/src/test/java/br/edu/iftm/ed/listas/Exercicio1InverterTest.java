package br.edu.iftm.ed.listas;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class Exercicio1InverterTest {

    @Test
    @DisplayName("deve inverter string comum")
    void deveInverterStringComum() {
        assertEquals("MTFI", ExerciciosCap8.inverter("IFTM"));
    }

    @Test
    @DisplayName("deve retornar vazio para string vazia")
    void deveRetornarVazio() {
        assertEquals("", ExerciciosCap8.inverter(""));
    }

    @Test
    @DisplayName("deve lancar excecao para nulo")
    void deveFalharComNulo() {
        assertThrows(IllegalArgumentException.class, () -> ExerciciosCap8.inverter(null));
    }
}
