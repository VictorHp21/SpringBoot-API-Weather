package com.victor_w.demo.services;


import com.victor_w.demo.model.WeatherResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Value;


import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WeatherService {

    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${weather.api.key}")
    private String apiKey;

    @Value("${weather.api.url}")
    private String apiUrl;

    private final ObjectMapper mapper = new ObjectMapper();

    public WeatherResponse getWeather(String city, String country){
        String cacheKey = (city + " - " + country).toLowerCase();

        WeatherResponse cached = (WeatherResponse) redisTemplate.opsForValue().get(cacheKey);

        if (cached != null) return cached;

        try{
            RestTemplate restTemplate = new RestTemplate();

            String url = String.format("%s/%s,%s?unitGroup=metric&key=%s&contentType=json",
                    apiUrl, city, country, apiKey);

            String response = restTemplate.getForObject(url, String.class);

            JsonNode json = mapper.readTree(response);

            WeatherResponse weather = new WeatherResponse();
            weather.setCity(json.get("resolvedAddres").asString());
            weather.setCurrentTemp(json.get("currentConditions").get("temp").asDouble());

            weather.setDescription(json.get("CurrentConditions").get("Conditions").asString());

            // lista de previsões diárias

            List<WeatherResponse.DayForecast> days = new ArrayList<>();

            for (JsonNode day : json.get("days")) {
                days.add(new WeatherResponse.DayForecast(
                        day.get("datetime").asString(),
                        day.get("tempmax").asDouble(),
                        day.get("tempmin").asDouble(),
                        day.get("conditions").asString()
                ));
            }

            weather.setDays(days.subList(0,5));

            redisTemplate.opsForValue().set(cacheKey, weather, Duration.ofHours(12));

            return weather;


        }catch (Exception e){
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar os dados");
        }


    }


    }

