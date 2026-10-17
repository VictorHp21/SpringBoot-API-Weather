package com.victor_w.demo.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeatherResponse {

    private String cidade;
    private Double temperatura;
    private Double possibilidadeChuva;
    private Double umidade;
    private Double velocidadeVento;
    private String description;
    private List<DayForecast> diasSemana;



    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayForecast{
        private String date;
        private Double tempmax;
        private Double tempmin;
        private String conditions;


        public void setDate(String date) {
            this.date = date;
        }

        public void setTempmax(Double tempmax) {
            this.tempmax = tempmax;
        }

        public void setTempmin(Double tempmin) {
            this.tempmin = tempmin;
        }

        public void setConditions(String conditions) {
            this.conditions = conditions;
        }
    }




}
