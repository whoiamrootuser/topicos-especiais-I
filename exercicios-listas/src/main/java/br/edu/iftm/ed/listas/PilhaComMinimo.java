package br.edu.iftm.ed.listas;

public class PilhaComMinimo<T extends Comparable<T>> {

    private final PilhaArray<T> principal = new PilhaArray<>();
    private final PilhaArray<T> minimos = new PilhaArray<>();

    public void push(T elemento) {
        principal.push(elemento);
        if (minimos.isEmpty() || elemento.compareTo(minimos.peek()) <= 0) {
            minimos.push(elemento);
        } else {
            minimos.push(minimos.peek());
        }
    }

    public T pop() {
        minimos.pop();
        return principal.pop();
    }

    public T min() {
        return minimos.peek();
    }

    public T peek() {
        return principal.peek();
    }

    public boolean isEmpty() {
        return principal.isEmpty();
    }

    public int size() {
        return principal.size();
    }
}
