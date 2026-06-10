package br.edu.iftm.estrutura_dados_web.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "transacoes", indexes = {
        @Index(name = "idx_conta_id", columnList = "conta_id")
})
public class Transacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conta_id")
    private Long contaId;

    private BigDecimal valor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    public Transacao() {}

    public Transacao(Long contaId, BigDecimal valor, Usuario usuario) {
        this.contaId = contaId;
        this.valor = valor;
        this.usuario = usuario;
    }

    public Long getId() {
        return id;
    }

    public Long getContaId() {
        return contaId;
    }

    public void setContaId(Long contaId) {
        this.contaId = contaId;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}
