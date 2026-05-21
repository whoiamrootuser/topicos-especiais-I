# Topicos Especiais I

Lista de exercicios sobre tabelas hash em Java, organizada em 3 blocos.

- Bloco 1: hashCode(), equals() e encadeamento separado
- Bloco 2: enderecamento aberto, sondagem e rehashing
- Bloco 3: problemas contextualizados em sistemas web

## Bloco 1 - hashCode(), equals() e encadeamento separado (60 min)

## Exercicio 1.1 - Contrato hashCode()/equals() (15 min)

O codigo abaixo contem tres classes com contratos hashCode()/equals() incorretos ou incompletos.

Tarefa:
1. Identifique o problema em cada classe.
2. Corrija o codigo.
3. Explique por que a versao original quebra o funcionamento de HashMap e HashSet.

### Classe A - localizar o erro

```java
public class Produto {
    private String sku;
    private String nome;

    public Produto(String sku, String nome) {
        this.sku = sku;
        this.nome = nome;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Produto)) return false;
        Produto p = (Produto) o;
        return sku.equals(p.sku);
    }
    // hashCode() nao foi sobrescrito
}
```

### Classe B - localizar o erro

```java
public class Sessao {
    private final String token;

    public Sessao(String token) {
        this.token = token;
    }

    @Override
    public int hashCode() {
        return 42;
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Sessao)) return false;
        return token.equals(((Sessao) o).token);
    }
}
```

### Classe C - localizar o erro

```java
public class Coordenada {
    public double lat;
    public double lon;

    public Coordenada(double lat, double lon) {
        this.lat = lat;
        this.lon = lon;
    }

    @Override
    public int hashCode() {
        return Objects.hash(lat, lon);
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Coordenada)) return false;
        Coordenada c = (Coordenada) o;
        return lat == c.lat && lon == c.lon;
    }
}
```

## Exercicio 1.2 - Rastreamento manual: encadeamento separado (20 min)

Considere uma tabela hash com:
- Capacidade M = 7
- Funcao hash h(k) = k % 7
- Tratamento de colisao por encadeamento separado

Sequencia de insercoes:
- inserir(10)
- inserir(22)
- inserir(31)
- inserir(4)
- inserir(15)
- inserir(28)
- inserir(17)

Rastreamento inicial:

| Chave | h(k) = k % 7 | Bucket | Colisao? |
|---|---|---|---|
| 10 | 10 % 7 = 3 | 3 | Nao |
| 22 | 22 % 7 = 1 | 1 | Nao |
| 31 | 31 % 7 = 3 | 3 | Sim, encadeia com 10 |
| 4  | 4 % 7 = 4  | 4 | Nao |
| 15 | 15 % 7 = 1 | 1 | Sim, encadeia com 22 |
| 28 | 28 % 7 = 0 | 0 | Nao |
| 17 | 17 % 7 = 3 | 3 | Sim, encadeia com 10 -> 31 |

Responda:
1. Qual e o fator de carga lambda = n/M apos todas as insercoes?
2. Qual e o comprimento da cadeia mais longa? Qual operacao tem custo O(n) no pior caso quando isso acontece?
3. Se inserissemos a chave 38, em qual bucket ela seria alocada? Haveria colisao?
4. A funcao h(k) = k % 7 distribui bem as chaves desta sequencia? Proponha uma sequencia de 7 chaves que cause a pior distribuicao possivel para essa funcao.

## Exercicio 1.3 - Implementacao: TabelaHashEncadeada<K, V> (25 min)

Implemente os metodos put(), get() e remove() da classe abaixo.

Regras:
- Os comentarios indicam o comportamento esperado.
- Escreva tambem os 3 testes JUnit 5 descritos ao final.

### Esqueleto a completar

```java
public class TabelaHashEncadeada<K, V> {

    private static final int CAPACIDADE_PADRAO = 16;

    private LinkedList<Entrada<K, V>>[] buckets;
    private int tamanho;

    @SuppressWarnings("unchecked")
    public TabelaHashEncadeada(int capacidade) {
        buckets = new LinkedList[capacidade];
        for (int i = 0; i < capacidade; i++) {
            buckets[i] = new LinkedList<>();
        }
        this.tamanho = 0;
    }

    public TabelaHashEncadeada() {
        this(CAPACIDADE_PADRAO);
    }

    // Retorna o indice do bucket para a chave k.
    // Trate k == null explicitamente (lance IllegalArgumentException).
    private int indiceBucket(K k) {
        // TODO
    }

    // Insere ou atualiza o par (chave, valor).
    // Se a chave ja existir, substitui o valor e NAO incrementa tamanho.
    public void put(K chave, V valor) {
        // TODO
    }

    // Retorna o valor associado a chave, ou null se nao encontrado.
    public V get(K chave) {
        // TODO
    }

    // Remove o par com a chave dada.
    // Retorna true se removido, false se nao encontrado.
    public boolean remove(K chave) {
        // TODO
    }

    public int tamanho() { return tamanho; }
    public boolean estaVazia() { return tamanho == 0; }

    private static class Entrada<K, V> {
        K chave;
        V valor;
        Entrada(K chave, V valor) {
            this.chave = chave;
            this.valor = valor;
        }
    }
}
```

### Testes JUnit 5 a implementar

```java
class TabelaHashEncadeadaTest {

    private TabelaHashEncadeada<String, Integer> tabela;

    @BeforeEach
    void setUp() {
        tabela = new TabelaHashEncadeada<>(4);
    }

    @Test
    @DisplayName("put e get: chave inserida deve ser recuperada")
    void testPutGet() {
        // TODO: inserir "produto-42" -> 100; recuperar e verificar
    }

    @Test
    @DisplayName("put com atualizacao: tamanho nao deve aumentar")
    void testAtualizacaoNaoIncrementaTamanho() {
        // TODO: inserir mesma chave duas vezes com valores diferentes
        // verificar que tamanho() == 1 e que get retorna o valor mais recente
    }

    @Test
    @DisplayName("colisao: duas chaves no mesmo bucket devem ser recuperadas corretamente")
    void testColisao() {
        // Dica: com capacidade 4, quaisquer duas chaves com hashCode() % 4 igual
        // serao alocadas no mesmo bucket.
        // TODO
    }
}
```

Referencia de implementacao:
- indiceBucket deve usar Math.abs(chave.hashCode()) % buckets.length para evitar indice negativo, pois hashCode() pode retornar valores negativos em Java.

## Bloco 2 - Enderecamento aberto, rehashing e TabelaHash<K, V> generica (60 min)

## Exercicio 2.1 - Rastreamento manual: sondagem linear e quadratica (20 min)

Considere:
- Tabela hash com enderecamento aberto
- Capacidade M = 11
- Funcao hash base h(k) = k % 11

Sequencia de insercao:
- inserir(20)
- inserir(31)
- inserir(54)
- inserir(43)
- inserir(65)
- inserir(9)

Parte A - Sondagem linear:
- h(k, i) = (h(k) + i) % M

| Chave | h(k) | Sonda i = 0 | Sonda i = 1 | Sonda i = 2 | Slot final |
|---|---|---|---|---|---|
| 20 | 20 % 11 = 9  | 9 livre   | -          | -          | 9  |
| 31 | 31 % 11 = 9  | 9 ocupado | 10 livre   | -          | 10 |
| 54 | 54 % 11 = 10 | 10 ocupado| 0 livre    | -          | 0  |
| 43 | 43 % 11 = 10 | 10 ocupado| 0 ocupado  | 1 livre    | 1  |
| 65 | 65 % 11 = 10 | 10 ocupado| 0 ocupado  | 1 ocupado  | ... |
| 9  | 9 % 11 = 9   | 9 ocupado | 10 ocupado | 0 ocupado  | ... |

Complete as duas ultimas linhas e responda:
1. Qual e o fenomeno que ocorre quando chaves com o mesmo h(k) inicial formam um bloco contiguo? Como a sondagem quadratica atenua esse problema?
2. Calcule o fator de carga apos todas as insercoes. O valor esta dentro do limite recomendado para enderecamento aberto?

## Exercicio 2.2 - Double hashing (15 min)

Utilize double hashing para inserir as chaves:
- 76, 40, 48, 5, 55, 47

Em uma tabela com capacidade M = 11.

Funcoes de sondagem:
- h1(k) = k % 11
- h2(k) = 7 - (k % 7)
- h(k, i) = (h1(k) + i * h2(k)) % 11

Tarefa:
- Para cada chave, calcule h1, h2 e o slot final.
- Mostre as sondas intermediarias quando houver colisao.

## Exercicio 2.3 - Rehashing: analise e implementacao (25 min)

O trecho abaixo implementa put() em tabela com enderecamento aberto por sondagem linear, mas sem rehashing.

Sua tarefa:
1. Definir o limiar de fator de carga para disparar rehash.
2. Implementar rehash() dobrando capacidade e reinserindo todos os pares existentes.
3. Escrever 2 testes JUnit 5:
   - um teste que verifica disparo do rehash quando lambda >= 0,70
   - um teste que confirma migracao correta de todos os pares

Trecho base:

```java
public class TabelaHashAberta<K, V> {

    // Marcador de slot deletado (lazy deletion)
    private static final Object DELETADO = new Object();

    private Object[] chaves;
    private Object[] valores;
    private int tamanho;
    private int capacidade;

    public TabelaHashAberta(int capacidade) {
        this.capacidade = capacidade;
        this.chaves = new Object[capacidade];
        this.valores = new Object[capacidade];
        this.tamanho = 0;
    }

    private int sonda(K chave, int i) {
        return (Math.abs(chave.hashCode()) + i) % capacidade;
    }

    public void put(K chave, V valor) {
        // Nao dispara rehashing - IMPLEMENTE ESSA VERIFICACAO
        for (int i = 0; i < capacidade; i++) {
            int idx = sonda(chave, i);
            if (chaves[idx] == null || chaves[idx] == DELETADO) {
                chaves[idx] = chave;
                valores[idx] = valor;
                tamanho++;
                return;
            }
            if (chaves[idx].equals(chave)) {
                valores[idx] = valor;
                return;
            }
        }
        throw new IllegalStateException("Tabela cheia");
    }

    // IMPLEMENTE: dobra capacidade e reinserere todos os pares validos
    private void rehash() {
        // TODO
    }

    public double fatorDeCarga() {
        return (double) tamanho / capacidade;
    }
}
```

## Bloco 3 - Problemas contextualizados em sistemas web (60 min)

Os 3 problemas abaixo simulam situacoes reais de desenvolvimento com Spring Boot.

Para cada problema:
1. Leia o enunciado.
2. Escreva o codigo Java.
3. Responda as perguntas de analise.

## Problema 3.1 - Cache de sessoes HTTP (20 min)

Requisito:
- Armazenar sessoes em memoria com acesso O(1) amortizado.
- Chave: token (String UUID).
- Valor: Usuario com campos id (long) e perfil (String).

A tabela deve:
- Recuperar usuario por token.
- Invalidar sessao por token.
- Verificar validade de token.

Implemente GerenciadorSessao usando TabelaHashEncadeada<String, Usuario> do Exercicio 1.3.

Esqueleto:

```java
public class GerenciadorSessao {

    private final TabelaHashEncadeada<String, Usuario> sessoes;

    public GerenciadorSessao() {
        // Defina capacidade inicial adequada e justifique.
        // TODO
    }

    // Registra nova sessao. Lanca IllegalArgumentException se token for nulo ou vazio.
    public void registrar(String token, Usuario usuario) { /* TODO */ }

    // Retorna Usuario ou null se a sessao nao existir.
    public Usuario buscar(String token) { /* TODO */ }

    // Remove a sessao. Retorna true se existia, false se ja estava expirada/invalida.
    public boolean invalidar(String token) { /* TODO */ }

    // Retorna true se o token ainda e valido.
    public boolean eValido(String token) { /* TODO */ }
}
```

Perguntas de analise:
1. Qual e a complexidade esperada (caso medio) de registrar(), buscar() e invalidar() com encadeamento separado e lambda <= 0,75?
2. Por que String e uma boa escolha como chave de tabela hash em Java? Quais propriedades da classe String garantem isso?
3. Em producao, qual problema critico esse cache em memoria apresenta em ambientes com multiplos servidores? Qual tecnologia resolveria isso?

## Problema 3.2 - Indice invertido para busca de produtos (20 min)

Cenario:
- Cada palavra do nome do produto mapeia para uma lista de IDs de produtos que contem essa palavra.
- Exemplo:
  - produto 1 = cadeira ergonomica
  - produto 2 = mesa de escritorio
  - produto 3 = cadeira gamer
  - indice:
    - cadeira -> [1, 3]
    - ergonomica -> [1]
    - mesa -> [2]
    - escritorio -> [2]
    - gamer -> [3]

Esqueleto:

```java
public class IndiceInvertido {

    // chave: palavra normalizada (minuscula, sem acentos)
    // valor: lista de IDs de produtos que contem a palavra
    private final Map<String, List<Long>> indice = new HashMap<>();

    // Indexa o produto. Normaliza o nome antes de dividir em palavras.
    public void indexar(long idProduto, String nomeProduto) {
        // Dica: use nomeProduto.toLowerCase().split("\\s+") para dividir em palavras.
        // TODO
    }

    // Retorna a lista de IDs que contem a palavra, ou lista vazia se nao encontrada.
    public List<Long> buscar(String palavra) {
        // TODO
    }

    // Retorna os IDs que aparecem em TODAS as palavras da consulta (intersecao).
    // Exemplo: buscar("cadeira gamer") -> [3]
    public List<Long> buscarMultiplas(String consulta) {
        // TODO
    }

    public int totalPalavrasIndexadas() {
        return indice.size();
    }
}
```

Perguntas de analise:
1. Qual e a complexidade de indexar() em funcao do numero de palavras W do nome do produto?
2. Qual e a complexidade de buscarMultiplas() em funcao do numero de palavras na consulta Q e do tamanho maximo de uma lista de resultados R?
3. HashMap<String, List<Long>> vs TreeMap<String, List<Long>>: qual escolher para este indice e por que? Em que caso TreeMap seria preferivel?

## Problema 3.3 - Rate limiting por IP com janela deslizante (20 min)

Cenario:
- Limite de 100 requisicoes por minuto por IP.
- Janela deslizante simplificada: para cada IP, armazenar contador e timestamp de inicio da janela.

Esqueleto:

```java
public class RateLimiter {

    private static final int LIMITE = 100;
    private static final long JANELA_MS = 60_000L;

    // chave: IP do cliente (String)
    // valor: registro com contador e inicio da janela
    private final Map<String, Janela> contadores = new HashMap<>();

    // Retorna true se a requisicao for permitida, false se o limite foi atingido.
    public boolean permitir(String ip) {
        long agora = System.currentTimeMillis();
        Janela janela = contadores.get(ip);

        if (janela == null || agora - janela.inicioMs >= JANELA_MS) {
            // Janela expirou ou IP novo - reinicia a janela
            contadores.put(ip, new Janela(agora, 1));
            return true;
        }

        if (janela.contador < LIMITE) {
            janela.contador++;
            return true;
        }

        return false;
    }

    // IMPLEMENTE: remove entradas de IPs cuja janela ja expirou.
    // Dica: nao modifique o Map durante iteracao direta; use removeIf ou iterator.remove().
    public void limparExpirados() {
        // TODO
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
```

Perguntas de analise:
1. Qual e a complexidade de permitir() no caso medio? E de limparExpirados() em funcao do numero N de IPs ativos?
2. Por que nao se deve usar Map.entrySet().forEach() com map.remove() dentro do lambda para limpar entradas? Qual excecao seria lancada?
3. Em sistema com 1 milhao de IPs distintos por hora, a tabela pode crescer indefinidamente. Alem de limparExpirados(), cite uma estrutura do JCF que e base comum para implementacoes de cache LRU com expiracao por acesso.
