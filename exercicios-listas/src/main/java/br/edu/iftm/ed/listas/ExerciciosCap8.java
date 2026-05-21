package br.edu.iftm.ed.listas;

import java.util.NoSuchElementException;

public final class ExerciciosCap8 {

    private ExerciciosCap8() {
    }

    public static String inverter(String texto) {
        if (texto == null) {
            throw new IllegalArgumentException("Texto nao pode ser nulo");
        }

        Pilha<Character> pilha = new PilhaArray<>();
        for (char c : texto.toCharArray()) {
            pilha.push(c);
        }

        StringBuilder invertida = new StringBuilder();
        while (!pilha.isEmpty()) {
            invertida.append(pilha.pop());
        }
        return invertida.toString();
    }

    public static double avaliarPosFixa(String expressao) {
        if (expressao == null || expressao.trim().isEmpty()) {
            throw new IllegalArgumentException("Expressao nao pode ser vazia");
        }

        Pilha<Double> pilha = new PilhaArray<>();
        for (String token : expressao.trim().split("\\s+")) {
            switch (token) {
                case "+": {
                    double b = popSeguro(pilha);
                    double a = popSeguro(pilha);
                    pilha.push(a + b);
                    break;
                }
                case "-": {
                    double b = popSeguro(pilha);
                    double a = popSeguro(pilha);
                    pilha.push(a - b);
                    break;
                }
                case "*": {
                    double b = popSeguro(pilha);
                    double a = popSeguro(pilha);
                    pilha.push(a * b);
                    break;
                }
                case "/": {
                    double b = popSeguro(pilha);
                    double a = popSeguro(pilha);
                    if (b == 0) {
                        throw new ArithmeticException("Divisao por zero");
                    }
                    pilha.push(a / b);
                    break;
                }
                case "%": {
                    double b = popSeguro(pilha);
                    double a = popSeguro(pilha);
                    if (b == 0) {
                        throw new ArithmeticException("Modulo por zero");
                    }
                    pilha.push(a % b);
                    break;
                }
                default:
                    pilha.push(Double.parseDouble(token));
            }
        }

        double resultado = popSeguro(pilha);
        if (!pilha.isEmpty()) {
            throw new IllegalArgumentException("Expressao pos-fixa invalida");
        }
        return resultado;
    }

    private static double popSeguro(Pilha<Double> pilha) {
        try {
            return pilha.pop();
        } catch (NoSuchElementException ex) {
            throw new IllegalArgumentException("Expressao pos-fixa invalida", ex);
        }
    }
}
