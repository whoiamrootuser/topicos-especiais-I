package br.edu.iftm.ed.exercicios;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class RateLimiter {

    private static final int LIMITE = 100;
    private static final long JANELA_MS = 60_000L;

    private final Map<String, Janela> contadores = new HashMap<>();

    public boolean permitir(String ip) {
        if (ip == null || ip.trim().isEmpty()) {
            throw new IllegalArgumentException("IP nao pode ser nulo ou vazio");
        }

        long agora = System.currentTimeMillis();
        Janela janela = contadores.get(ip);

        if (janela == null || agora - janela.inicioMs >= JANELA_MS) {
            contadores.put(ip, new Janela(agora, 1));
            return true;
        }

        if (janela.contador < LIMITE) {
            janela.contador++;
            return true;
        }

        return false;
    }

    public void limparExpirados() {
        long agora = System.currentTimeMillis();
        Iterator<Map.Entry<String, Janela>> iterator = contadores.entrySet().iterator();

        while (iterator.hasNext()) {
            Map.Entry<String, Janela> entry = iterator.next();
            if (agora - entry.getValue().inicioMs >= JANELA_MS) {
                iterator.remove();
            }
        }
    }

    private static class Janela {
        long inicioMs;
        int contador;

        Janela(long inicioMs, int contador) {
            this.inicioMs = inicioMs;
            this.contador = contador;
        }
    }
}
