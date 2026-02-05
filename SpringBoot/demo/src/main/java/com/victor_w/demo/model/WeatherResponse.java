package com.victor_w.demo.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeatherResponse {

    private String city;
    private Double currentTemp;
    private String description;
    private List<DayForecast> days;



    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayForecast{
        private String date;
        private Double tempmax;
        private Double tempmin;
        private String conditions;


    }


}
