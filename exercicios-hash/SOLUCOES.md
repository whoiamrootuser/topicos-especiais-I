# Solucoes dos Exercicios de Hash

## Exercicio 1.1 - Contrato hashCode()/equals()

### Classe A (Produto)
Problema original: sobrescrevia equals(), mas nao sobrescrevia hashCode().

Consequencia: dois objetos com mesmo sku podiam ser "iguais" para equals(), mas cair em buckets diferentes no HashMap/HashSet, quebrando busca/remocao.

Correcao: hashCode() agora usa o mesmo campo de igualdade (sku).

### Classe B (Sessao)
Problema original: hashCode() retornava constante 42.

Consequencia: todos os elementos caiam no mesmo bucket, degradando operacoes para custo linear no tamanho da tabela.

Correcao: hashCode() agora usa token.

### Classe C (Coordenada)
Problema original: comparacao de double com ==.

Consequencia: falhas de igualdade por representacao binaria de ponto flutuante e casos especiais.

Correcao: equals() agora usa Double.compare(lat, c.lat) e Double.compare(lon, c.lon).

## Exercicio 1.2 - Encadeamento separado

Com as insercoes 10, 22, 31, 4, 15, 28, 17 em M = 7:

- bucket 0: 28
- bucket 1: 22 -> 15
- bucket 2: vazio
- bucket 3: 10 -> 31 -> 17
- bucket 4: 4
- bucket 5: vazio
- bucket 6: vazio

Respostas:
1. Fator de carga: lambda = n / M = 7 / 7 = 1.0.
2. Maior cadeia: comprimento 3 (bucket 3). No pior caso, put/get/remove podem chegar a O(n) quando muitas chaves concentram na mesma cadeia.
3. 38 vai para bucket 3 (38 % 7 = 3). Havera colisao.
4. Pior distribuicao possivel para h(k)=k%7 (7 chaves no mesmo bucket): 0, 7, 14, 21, 28, 35, 42.

## Exercicio 2.1 - Enderecamento aberto

### Parte A - Sondagem linear

Tabela final para a sequencia 20, 31, 54, 43, 65, 9 em M = 11:

- 20 -> slot 9
- 31 -> slot 10
- 54 -> slot 0
- 43 -> slot 1
- 65 -> slot 2
- 9 -> slot 3

Linhas finais completadas:
- 65: h=10, i0=10 ocupado, i1=0 ocupado, i2=1 ocupado, i3=2 livre, slot final 2.
- 9: h=9, i0=9 ocupado, i1=10 ocupado, i2=0 ocupado, i3=1 ocupado, i4=2 ocupado, i5=3 livre, slot final 3.

Respostas:
1. Fenomeno: primary clustering (formacao de blocos contiguos). A sondagem quadratica reduz esse efeito ao espacamento nao linear das sondas.
2. Fator de carga apos 6 insercoes: lambda = 6/11 ~= 0.545. Esta dentro do limite recomendado para enderecamento aberto (tipicamente abaixo de 0.7).

## Exercicio 2.2 - Double hashing (M = 11)

Funcoes:
- h1(k)=k%11
- h2(k)=7-(k%7)
- h(k,i)=(h1 + i*h2)%11

Insercao das chaves 76, 40, 48, 5, 55, 47:

1. 76: h1=10, h2=1, i0=10 livre -> slot 10
2. 40: h1=7, h2=2, i0=7 livre -> slot 7
3. 48: h1=4, h2=1, i0=4 livre -> slot 4
4. 5: h1=5, h2=2, i0=5 livre -> slot 5
5. 55: h1=0, h2=1, i0=0 livre -> slot 0
6. 47: h1=3, h2=2, i0=3 livre -> slot 3

Nao houve colisao nessa sequencia especifica.

## Exercicio 3.1 - Analise (GerenciadorSessao)

1. Com encadeamento separado e lambda <= 0.75, registrar(), buscar() e invalidar() tem custo esperado O(1) amortizado.
2. String e boa chave porque e imutavel e implementa equals()/hashCode() de forma consistente com seu conteudo.
3. Em multiplos servidores, cache em memoria local causa inconsistencia de sessoes entre nos. Solucao comum: cache distribuido (ex.: Redis).

## Exercicio 3.2 - Analise (Indice invertido)

1. indexar() com W palavras: O(W) para inserir no indice (desconsiderando custo de contains em listas longas).
2. buscarMultiplas() com Q palavras e lista maxima R: O(Q * R) no pior caso para intersecoes sucessivas.
3. HashMap vs TreeMap:
   - HashMap: melhor para busca media O(1), ideal para indice invertido.
   - TreeMap: O(log n), util quando precisa de ordenacao de chaves e consultas por faixa.

## Exercicio 3.3 - Analise (Rate limiting)

1. permitir() no caso medio: O(1). limparExpirados() para N IPs: O(N).
2. Nao se deve remover via map.remove() dentro de entrySet().forEach() porque altera a colecao durante iteracao e pode lancar ConcurrentModificationException.
3. Estrutura JCF usada como base para expiracao/LRU: LinkedHashMap com accessOrder=true, geralmente sobrescrevendo removeEldestEntry().
