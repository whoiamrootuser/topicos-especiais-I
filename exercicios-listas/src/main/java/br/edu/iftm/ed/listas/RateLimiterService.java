package br.edu.iftm.ed.listas;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class RateLimiterService {

    private static final int MAX_REQS = 10;
    private static final long JANELA_MS = 60_000L;

    private final Map<String, Deque<Long>> historico = new ConcurrentHashMap<>();

    public boolean permitir(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId invalido");
        }

        long agora = System.currentTimeMillis();
        Deque<Long> fila = historico.computeIfAbsent(userId, k -> new ArrayDeque<>());

        synchronized (fila) {
            while (!fila.isEmpty() && agora - fila.peekFirst() > JANELA_MS) {
                fila.pollFirst();
            }

            if (fila.size() < MAX_REQS) {
                fila.addLast(agora);
                return true;
            }
            return false;
        }
    }

    public int totalUsuariosMonitorados() {
        return historico.size();
    }

    public void limparUsuariosInativos() {
        long agora = System.currentTimeMillis();
        Iterator<Map.Entry<String, Deque<Long>>> iterator = historico.entrySet().iterator();

        while (iterator.hasNext()) {
            Map.Entry<String, Deque<Long>> entry = iterator.next();
            Deque<Long> fila = entry.getValue();
            synchronized (fila) {
                while (!fila.isEmpty() && agora - fila.peekFirst() > JANELA_MS) {
                    fila.pollFirst();
                }
                if (fila.isEmpty()) {
                    iterator.remove();
                }
            }
        }
    }
}
