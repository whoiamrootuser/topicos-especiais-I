package br.edu.iftm.ed.listas;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class Exercicio5RateLimiterTest {

    @Test
    @DisplayName("deve permitir ate o limite e bloquear excedente")
    void deveRespeitarLimite() {
        RateLimiterService service = new RateLimiterService();

        for (int i = 0; i < 10; i++) {
            assertTrue(service.permitir("u1"));
        }
        assertFalse(service.permitir("u1"));
    }

    @Test
    @DisplayName("deve validar userId")
    void deveValidarUserId() {
        RateLimiterService service = new RateLimiterService();
        assertThrows(IllegalArgumentException.class, () -> service.permitir(" "));
    }

    @Test
    @DisplayName("usuarios diferentes possuem contagem independente")
    void contagemIndependentePorUsuario() {
        RateLimiterService service = new RateLimiterService();
        for (int i = 0; i < 10; i++) {
            assertTrue(service.permitir("u1"));
        }
        assertFalse(service.permitir("u1"));
        assertTrue(service.permitir("u2"));
    }
}
