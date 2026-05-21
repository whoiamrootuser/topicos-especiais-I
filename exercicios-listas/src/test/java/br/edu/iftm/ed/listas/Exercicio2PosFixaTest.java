package br.edu.iftm.ed.listas;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class Exercicio2PosFixaTest {

    @Test
    @DisplayName("deve avaliar expressao pos-fixa valida")
    void deveAvaliarExpressao() {
        assertEquals(14.0, ExerciciosCap8.avaliarPosFixa("5 1 2 + 4 * + 3 -"));
    }

    @Test
    @DisplayName("deve suportar operador modulo")
    void deveSuportarModulo() {
        assertEquals(1.0, ExerciciosCap8.avaliarPosFixa("10 3 %"));
    }

    @Test
    @DisplayName("deve falhar em divisao por zero")
    void deveFalharDivisaoPorZero() {
        assertThrows(ArithmeticException.class, () -> ExerciciosCap8.avaliarPosFixa("3 0 /"));
    }
}
