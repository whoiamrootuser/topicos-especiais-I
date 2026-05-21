package br.edu.iftm.ed.exercicios;

import java.util.Objects;

public class Coordenada {

    private final double lat;
    private final double lon;

    public Coordenada(double lat, double lon) {
        this.lat = lat;
        this.lon = lon;
    }

    public double getLat() {
        return lat;
    }

    public double getLon() {
        return lon;
    }

    @Override
    public int hashCode() {
        return Objects.hash(lat, lon);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Coordenada)) {
            return false;
        }
        Coordenada c = (Coordenada) o;
        return Double.compare(lat, c.lat) == 0 && Double.compare(lon, c.lon) == 0;
    }
}
