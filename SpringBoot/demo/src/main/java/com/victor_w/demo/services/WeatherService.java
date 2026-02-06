package com.victor_w.demo.services;

import com.victor_w.demo.model.WeatherResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

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

    public WeatherResponse getWeather(String city, String country) {
        String cacheKey = (city + " - " + country).toLowerCase();

        // WeatherResponse cached = (WeatherResponse) redisTemplate.opsForValue().get(cacheKey);
        // if (cached != null) return cached;

        try {
            RestTemplate restTemplate = new RestTemplate();

            String url = String.format("%s/%s,%s?unitGroup=metric&key=%s&contentType=json",
                    apiUrl, city, country, apiKey);

            System.out.println(">>> URL chamada: " + url);

            String response = restTemplate.getForObject(url, String.class);
            JsonNode json = mapper.readTree(response);

            WeatherResponse weather = new WeatherResponse();
            
            weather.setCity(json.get("resolvedAddress").asText());
            weather.setCurrentTemp(json.get("currentConditions").get("temp").asDouble());
            weather.setDescription(json.get("currentConditions").get("conditions").asText());


            List<WeatherResponse.DayForecast> days = new ArrayList<>();

            for (JsonNode day : json.get("days")) {
                days.add(new WeatherResponse.DayForecast(
                        day.get("datetime").asText(),
                        day.get("tempmax").asDouble(),
                        day.get("tempmin").asDouble(),
                        day.get("conditions").asText()
                ));
            }

            weather.setDays(days.subList(0, 5));

            // redisTemplate.opsForValue().set(cacheKey, weather, Duration.ofHours(12));

            return weather;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar os dados: " + e.getMessage());
        }
    }
}
