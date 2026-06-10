package br.edu.iftm.estrutura_dados_web.config;

import br.edu.iftm.estrutura_dados_web.model.Transacao;
import br.edu.iftm.estrutura_dados_web.model.Usuario;
import br.edu.iftm.estrutura_dados_web.repository.TransacaoRepository;
import br.edu.iftm.estrutura_dados_web.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    @Transactional
    CommandLineRunner init(UsuarioRepository usuarioRepo, TransacaoRepository repo) {
        return args -> {
            List<Usuario> usuarios = new ArrayList<>();
            for (int i = 1; i <= 50; i++) {
                Usuario u = new Usuario("user" + i);
                usuarios.add(u);
            }
            usuarioRepo.saveAll(usuarios);

            List<Transacao> transacoes = new ArrayList<>();
            for (long i = 1; i <= 200; i++) {
                Usuario u = usuarios.get((int)((i-1) % usuarios.size()));
                Transacao t = new Transacao(i % 10 + 1, BigDecimal.valueOf((i * 10) % 1000), u);
                transacoes.add(t);
            }
            repo.saveAll(transacoes);
        };
    }
}
