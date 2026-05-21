# Capitulo 8 e 9 - Estruturas Lineares

## 8. Exercicios Praticos

Para cada exercicio:
- escreva a solucao em Java
- escreva pelo menos 2 testes JUnit 5 (1 caso normal e 1 caso de borda)

### Exercicio 1 - Inversao de sequencia com Pilha

Implemente o metodo `inverter(String texto)` que inverte a string recebida usando exclusivamente as operacoes da interface `Pilha<Character>`.

Regras:
- nao usar `StringBuilder.reverse()`
- nao usar arrays auxiliares

Pergunta de analise:
- qual e a complexidade temporal e espacial da solucao?

```java
public static String inverter(String texto) {
    Pilha<Character> pilha = new PilhaArray<>();
    // Passo 1: empilhe cada caractere de texto
    // Passo 2: desempilhe e concatene em uma nova String
    // Implemente aqui
}

// Casos de teste esperados:
// inverter("IFTM") -> "MTFI"
// inverter("")     -> ""
// inverter("A")    -> "A"
```

### Exercicio 2 - Avaliador de expressoes pos-fixas

Expressoes pos-fixas (notacao polonesa reversa) eliminam a necessidade de parenteses: os operandos precedem o operador.

Exemplo:
- `"3 4 +"` equivale a `3 + 4 = 7`

O algoritmo usa uma unica pilha:
- ao encontrar numero, empilha
- ao encontrar operador, desempilha dois operandos, aplica operacao, empilha resultado

```java
public static double avaliarPosFixa(String expressao) {
    Pilha<Double> pilha = new PilhaArray<>();
    for (String token : expressao.split(" ")) {
        switch (token) {
            case "+" -> { double b = pilha.pop(), a = pilha.pop(); pilha.push(a + b); }
            case "-" -> { double b = pilha.pop(), a = pilha.pop(); pilha.push(a - b); }
            case "*" -> { double b = pilha.pop(), a = pilha.pop(); pilha.push(a * b); }
            case "/" -> {
                double b = pilha.pop(), a = pilha.pop();
                if (b == 0) throw new ArithmeticException("Divisao por zero");
                pilha.push(a / b);
            }
            default  -> pilha.push(Double.parseDouble(token));
        }
    }
    return pilha.pop();
}

// "3 4 +" -> 7.0
// "5 1 2 + 4 * + 3 -" -> 14.0   (= 5 + (1+2)*4 - 3)
// "15 7 1 1 + - / 3 * 2 1 1 + + -" -> 5.0
```

Extensao:
- suporte o operador `%` (modulo)

Pergunta de analise:
- por que `%` consome dois operandos, enquanto um operador de negacao unaria consumiria apenas um?

### Exercicio 3 - Fila usando duas Pilhas

Questao classica de entrevistas tecnicas (Amazon, Google, Meta): implemente uma `Fila` usando apenas duas instancias de `PilhaArray<T>`.

Ideia:
- `entrada` recebe os elementos
- `saida` serve as remocoes
- quando `saida` estiver vazia e `dequeue` for chamado, transferir tudo de `entrada` para `saida`
- essa transferencia inverte a ordem e restaura FIFO

```java
public class FilaDuasPilhas<T> implements Fila<T> {

    private final PilhaArray<T> entrada = new PilhaArray<>();
    private final PilhaArray<T> saida   = new PilhaArray<>();

    @Override
    public void enqueue(T elemento) {
        entrada.push(elemento);  // sempre empilha em entrada
    }

    @Override
    public T dequeue() {
        transferirSeNecessario();
        if (saida.isEmpty()) throw new java.util.NoSuchElementException();
        return saida.pop();
    }

    @Override
    public T peek() {
        transferirSeNecessario();
        if (saida.isEmpty()) throw new java.util.NoSuchElementException();
        return saida.peek();
    }

    @Override public boolean isEmpty() { return entrada.isEmpty() && saida.isEmpty(); }
    @Override public int size()        { return entrada.size() + saida.size(); }

    // Transferencia: move todos de entrada para saida (inverte a ordem)
    private void transferirSeNecessario() {
        if (saida.isEmpty()) {
            while (!entrada.isEmpty()) {
                saida.push(entrada.pop());
            }
        }
    }
}
```

Perguntas de analise:
- complexidade de `dequeue()` no pior caso e no caso amortizado
- em quais padroes de uso essa implementacao se torna ineficiente

### Exercicio 4 - Comparacao empirica com System.nanoTime()

Escreva um programa que mede o tempo de 1.000.000 de operacoes `push+pop` em:
- `PilhaArray`
- `PilhaLista`
- `ArrayDeque` (JCF)

Execute o teste 3 vezes e calcule a media (reduzir efeito de JIT e GC).

```java
long medir(Runnable tarefa) {
    tarefa.run();                          // aquecimento da JVM (JIT)
    long inicio = System.nanoTime();
    tarefa.run();
    return System.nanoTime() - inicio;
}

long tempoPilhaArray = medir(() -> {
    PilhaArray<Integer> p = new PilhaArray<>();
    for (int i = 0; i < 1_000_000; i++) { p.push(i); p.pop(); }
});
System.out.printf("PilhaArray: %.2f ms%n", tempoPilhaArray / 1e6);
```

Perguntas de analise:
- o resultado confirma a analise teorica?
- qual estrutura foi mais rapida e por que?
- relacione com localidade de cache entre array e lista encadeada

### Exercicio 5 - Rate Limiter com janela deslizante

O `RateLimiterService` abaixo usa `Deque<Long>` para manter timestamps das ultimas requisicoes por usuario.

Responda:
- (a) por que `peekFirst()` e chamado antes de `pollFirst()`?
- (b) por que `ConcurrentHashMap` em vez de `HashMap`?
- (c) o que acontece com dados de usuarios que pararam de requisitar? o mapa cresce indefinidamente?

```java
@Service
public class RateLimiterService {

    private static final int    MAX_REQS  = 10;
    private static final long   JANELA_MS = 60_000L;

    // ConcurrentHashMap: leituras e escritas thread-safe sem bloquear o mapa inteiro
    private final Map<String, Deque<Long>> historico = new ConcurrentHashMap<>();

    public boolean permitir(String userId) {
        long agora = System.currentTimeMillis();
        Deque<Long> fila = historico.computeIfAbsent(userId, k -> new ArrayDeque<>());

        // Remove timestamps fora da janela de 1 minuto
        // peekFirst() antes de pollFirst(): evita remover sem verificar
        while (!fila.isEmpty() && agora - fila.peekFirst() > JANELA_MS) {
            fila.pollFirst();   // O(1)
        }

        if (fila.size() < MAX_REQS) {
            fila.addLast(agora);   // O(1)
            return true;
        }
        return false;
    }
}
```

## 9. Desafios para Casa

Os desafios a seguir exigem autonomia e criatividade.

Requisito geral:
- cada desafio deve ter testes JUnit 5 com cobertura minima de 80% das branches

### Desafio 1 - Pilha com minimo em O(1)

Implemente uma pilha que, alem das operacoes padrao, oferece `min()` em Theta(1), sem percorrer todos os elementos.

Estrategia:
- pilha principal
- pilha espelho com o menor elemento observado em cada profundidade

```java
public class PilhaComMinimo<T extends Comparable<T>> {
    private final PilhaArray<T> principal = new PilhaArray<>();
    private final PilhaArray<T> minimos   = new PilhaArray<>();

    public void push(T elemento) {
        principal.push(elemento);
        // empilha em minimos o menor entre o elemento e o minimo atual
        if (minimos.isEmpty() || elemento.compareTo(minimos.peek()) <= 0)
            minimos.push(elemento);
        else
            minimos.push(minimos.peek());  // replica o minimo atual
    }

    public T pop() {
        minimos.pop();
        return principal.pop();
    }

    public T min()  { return minimos.peek(); }
    public T peek() { return principal.peek(); }
    public boolean isEmpty() { return principal.isEmpty(); }
}
```

Teste obrigatorio:
- validar `min()` apos cada `push` e apos cada `pop`
- validar caso em que o minimo e removido

### Desafio 2 - Buffer circular de logs

Implemente `BufferCircular<T>` com capacidade maxima fixa.

Comportamento:
- se cheio e novo elemento entra, o mais antigo e descartado automaticamente

Aplicacoes:
- ultimas N metricas de monitoramento
- buffers de audio/video
- janelas deslizantes de rate limiting

```java
public class BufferCircular<T> {
    private final Object[] dados;
    private int inicio, fim, quantidade;

    public BufferCircular(int capacidade) {
        dados = new Object[capacidade];
    }

    public void adicionar(T elemento) {
        dados[fim] = elemento;
        fim = (fim + 1) % dados.length;
        if (quantidade == dados.length)
            inicio = (inicio + 1) % dados.length;  // descarta o mais antigo
        else
            quantidade++;
    }

    // Implemente: removerMaisAntigo(), estaVazio(), estaCheio(), tamanho()
}

// Teste de uso:
BufferCircular<String> logs = new BufferCircular<>(3);
logs.adicionar("INFO: Servidor iniciado");
logs.adicionar("INFO: Conexao aceita");
logs.adicionar("WARN: Timeout na query");
logs.adicionar("ERROR: Falha na autenticacao");
// O primeiro log foi descartado - buffer contem os 3 mais recentes
```

### Desafio 3 - API REST com fila de tarefas e Spring Boot

Crie uma API REST com Spring Boot para simular processamento assincrono de tarefas.

Armazenamento:
- usar `FilaLista<Tarefa>` em memoria

Processamento automatico:
- adicionar `@Scheduled` para processar uma tarefa a cada 5 segundos

Endpoints:
- `POST /api/tarefas` -> adiciona tarefa na fila (`202 Accepted`)
- `GET /api/tarefas/proxima` -> processa/remove proxima tarefa (`200 OK`)
- `GET /api/tarefas/status` -> retorna quantidade de tarefas pendentes
- `GET /api/tarefas/historico` -> ultimas 10 tarefas processadas (usar pilha)

Reflexao final:
- quais problemas surgem em producao com modelo em memoria?
- como Spring AMQP + RabbitMQ resolve esses problemas?

### Desafio 4 - Problema de Josephus com lista circular

Use a `ListaCircular<T>` da Semana 5 para resolver Josephus.

```java
/**
 * Resolve o problema de Josephus com N pessoas e passo k.
 * @return posicao (0-indexada) do sobrevivente
 */
public static int josephus(int n, int k) {
    ListaCircular<Integer> circulo = new ListaCircular<>();
    for (int i = 0; i < n; i++) circulo.adicionar(i);

    while (circulo.tamanho() > 1) {
        // Gire k-1 vezes (o proximo a ser eliminado fica na frente)
        for (int i = 0; i < k - 1; i++) circulo.girar();
        circulo.removerInicio();
    }
    return circulo.primeiro();
}

// josephus(7, 3) -> 3  (posicao classica do problema original)
// josephus(6, 2) -> 4
```

## 10. Entrega - Capitulo 8 e Capitulo 9

### Capitulo 8 - Exercicios entregues

#### Exercicio 1 - Inversao com pilha
- implementacao: `ExerciciosCap8.inverter(String)`
- complexidade temporal: O(n)
- complexidade espacial: O(n)

#### Exercicio 2 - Avaliador pos-fixo
- implementacao: `ExerciciosCap8.avaliarPosFixa(String)`
- operadores suportados: `+`, `-`, `*`, `/`, `%`
- `%` e binario (`a % b`), por isso consome dois operandos
- operador unario de negacao consumiria um operando (`-a`)

#### Exercicio 3 - Fila com duas pilhas
- implementacao: `FilaDuasPilhas<T>`
- `dequeue()` pior caso: O(n)
- `dequeue()` amortizado: O(1)
- ponto de ineficiencia: alternancia extrema entre inserir/remover com transferencias frequentes

#### Exercicio 4 - Comparacao empirica com nanoTime
- implementacao: `BenchmarkPilhas`
- metodo `medir(Runnable)` com aquecimento simples
- metodo `medirMediaMs(repeticoes, operacoes)` para media das tres estruturas
- em geral, estruturas em array tendem a melhor localidade de cache

#### Exercicio 5 - Rate limiter com janela deslizante
- implementacao: `RateLimiterService`
- `peekFirst()` antes de `pollFirst()` evita remocao indevida
- `ConcurrentHashMap` permite acesso concorrente mais seguro e escalavel
- sem limpeza, mapa cresce com usuarios inativos
- complemento implementado: `limparUsuariosInativos()`

### Capitulo 9 - Desafios entregues

#### Desafio 1 - Pilha com minimo em O(1)
- implementacao: `PilhaComMinimo<T extends Comparable<T>>`
- estrategia: pilha principal + pilha espelho de minimos
- `min()` em O(1)

#### Desafio 2 - Buffer circular
- implementacao: `BufferCircular<T>`
- sobrescreve o elemento mais antigo quando cheio
- metodos implementados:
  - `adicionar(T)`
  - `removerMaisAntigo()`
  - `estaVazio()`
  - `estaCheio()`
  - `tamanho()`

### Testes JUnit 5
- todos os exercicios do capitulo 8 possuem testes com caso normal e caso de borda
- os dois desafios entregues tambem possuem testes de fluxo nominal e excecoes
