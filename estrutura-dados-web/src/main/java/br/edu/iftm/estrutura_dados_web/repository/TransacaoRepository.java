package br.edu.iftm.estrutura_dados_web.repository;

import br.edu.iftm.estrutura_dados_web.model.Transacao;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransacaoRepository extends JpaRepository<Transacao, Long> {

    List<Transacao> findTop20ByOrderByIdAsc();

    

    @Query(value = "SELECT t.* FROM transacoes t JOIN usuario u ON t.usuario_id = u.id ORDER BY t.id ASC LIMIT 20", nativeQuery = true)
    List<Transacao> findTop20WithJoinFetch();
}
