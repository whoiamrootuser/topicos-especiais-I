package br.edu.iftm.estrutura_dados_web.repository;

import br.edu.iftm.estrutura_dados_web.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
}
