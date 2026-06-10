package br.edu.iftm.estrutura_dados_web.web;

import br.edu.iftm.estrutura_dados_web.model.Transacao;
import br.edu.iftm.estrutura_dados_web.repository.TransacaoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/transacoes")
public class TransacaoController {

    private final TransacaoRepository repository;

    public TransacaoController(TransacaoRepository repository) {
        this.repository = repository;
    }

    // Endpoint that will exhibit N+1 when accessing lazy usuario
    @GetMapping
    public ResponseEntity<List<Transacao>> listWithPossibleNPlusOne() {
        List<Transacao> trans = repository.findTop20ByOrderByIdAsc();
        // touch usuario to show N+1 in logs when the JSON serializer accesses it
        trans.forEach(t -> { if (t.getUsuario()!=null) t.getUsuario().getNome(); });
        return ResponseEntity.ok(trans);
    }

    // Endpoint that uses JOIN FETCH / EntityGraph to avoid N+1
    @GetMapping("/with-users")
    public ResponseEntity<List<Transacao>> listWithUsers() {
        List<Transacao> trans = repository.findTop20WithJoinFetch();
        return ResponseEntity.ok(trans);
    }
}
