public class TempGcLoop {
    public static void main(String[] args) throws Exception {
        java.util.List<byte[]> list = new java.util.ArrayList<>();
        for (int i = 0; i < 100000; i++) {
            list.add(new byte[1024 * 50]); // ~50KB
            if (list.size() > 100) {
                list.remove(0);
            }
            if (i % 10 == 0) Thread.sleep(1);
        }
        Thread.sleep(2000);
    }
}
