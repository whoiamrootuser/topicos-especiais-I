package br.edu.iftm.estrutura_dados_web.benchmark;


import org.openjdk.jmh.annotations.*;
import org.openjdk.jmh.infra.Blackhole;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;

@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.NANOSECONDS)
@State(Scope.Benchmark)
@Warmup(iterations = 5, time = 1)
@Measurement(iterations = 10, time = 1)
@Fork(2)
public class MapBenchmark {

    private static final int TAMANHO = 100_000;
    private HashMap<String, Integer> hashMap;
    private TreeMap<String, Integer> treeMap;
    private LinkedHashMap<String, Integer> linkedHashMap;
    private List<String> chaves;
    private ArrayList<Integer> arrayList;
    private static final int ARRAY_TAMANHO = 10_000;

    @Setup(Level.Trial)
    public void setup() {
        hashMap = new HashMap<>(TAMANHO);
        treeMap = new TreeMap<>();
        linkedHashMap = new LinkedHashMap<>(TAMANHO);
        chaves = new ArrayList<>(TAMANHO);

        Random rand = new Random(42);
        for (int i = 0; i < TAMANHO; i++) {
            String chave = "produto-" + rand.nextInt(TAMANHO * 10);
            chaves.add(chave);
            hashMap.put(chave, i);
            treeMap.put(chave, i);
            linkedHashMap.put(chave, i);
        }

        // preparar ArrayList de inteiros para benchmark específico
        arrayList = new ArrayList<>(ARRAY_TAMANHO);
        for (int i = 0; i < ARRAY_TAMANHO; i++) {
            arrayList.add(i);
        }
    }

    @Benchmark
    public Integer hashMapGet(Blackhole bh) {
        String chave = chaves.get(ThreadLocalRandom.current().nextInt(chaves.size()));
        Integer val = hashMap.get(chave);
        bh.consume(val);
        return val;
    }

    @Benchmark
    public Integer treeMapGet(Blackhole bh) {
        String chave = chaves.get(ThreadLocalRandom.current().nextInt(chaves.size()));
        Integer val = treeMap.get(chave);
        bh.consume(val);
        return val;
    }

    @Benchmark
    public Integer linkedHashMapGet(Blackhole bh) {
        String chave = chaves.get(ThreadLocalRandom.current().nextInt(chaves.size()));
        Integer val = linkedHashMap.get(chave);
        bh.consume(val);
        return val;
    }

    @Benchmark
    public Integer arrayListGet(Blackhole bh) {
        int mid = arrayList.size() / 2;
        Integer val = arrayList.get(mid);
        bh.consume(val);
        return val;
    }

    // Benchmark de range query — vantagem do TreeMap
    @Benchmark
    public NavigableMap<String, Integer> treeMapRange(Blackhole bh) {
        NavigableMap<String, Integer> sub =
            treeMap.subMap("produto-1000", true, "produto-2000", true);
        bh.consume(sub);
        return sub;
    }
}
