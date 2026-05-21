package br.edu.iftm.ed.exercicios;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class IndiceInvertido {

    private final Map<String, List<Long>> indice = new HashMap<>();

    public void indexar(long idProduto, String nomeProduto) {
        if (nomeProduto == null || nomeProduto.trim().isEmpty()) {
            throw new IllegalArgumentException("Nome do produto nao pode ser nulo ou vazio");
        }

        String[] palavras = normalizar(nomeProduto).split("\\s+");

        for (String palavra : palavras) {
            if (palavra.isEmpty()) {
                continue;
            }
            List<Long> ids = indice.computeIfAbsent(palavra, k -> new ArrayList<>());
            if (!ids.contains(idProduto)) {
                ids.add(idProduto);
            }
        }
    }

    public List<Long> buscar(String palavra) {
        if (palavra == null || palavra.trim().isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> encontrados = indice.get(normalizar(palavra));
        if (encontrados == null) {
            return Collections.emptyList();
        }
        return Collections.unmodifiableList(encontrados);
    }

    public List<Long> buscarMultiplas(String consulta) {
        if (consulta == null || consulta.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String[] palavras = normalizar(consulta).split("\\s+");
        Set<Long> intersecao = null;

        for (String palavra : palavras) {
            if (palavra.isEmpty()) {
                continue;
            }

            List<Long> ids = indice.get(palavra);
            if (ids == null) {
                return Collections.emptyList();
            }

            if (intersecao == null) {
                intersecao = new LinkedHashSet<>(ids);
            } else {
                intersecao.retainAll(ids);
            }

            if (intersecao.isEmpty()) {
                return Collections.emptyList();
            }
        }

        if (intersecao == null) {
            return Collections.emptyList();
        }

        return new ArrayList<>(intersecao);
    }

    public int totalPalavrasIndexadas() {
        return indice.size();
    }

    private String normalizar(String texto) {
        String semAcento = Normalizer.normalize(texto, Normalizer.Form.NFD)
            .replaceAll("\\p{M}+", "");
        return semAcento.toLowerCase().trim();
    }
}
