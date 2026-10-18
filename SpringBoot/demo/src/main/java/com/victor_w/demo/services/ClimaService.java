
package com.victor_w.demo.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.victor_w.demo.model.WeatherResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Service
public class ClimaService {

    @Value("${weather.api.key}")
    private String apiKey;

    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public WeatherResponse consultarClima(String cidade) {

        String json = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host("weather.visualcrossing.com")
                        .path("/VisualCrossingWebServices/rest/services/timeline/{cidade}")
                        .queryParam("unitGroup", "metric")
                        .queryParam("include", "current,days")
                        .queryParam("elements",
                                "temp,precipprob,humidity,windspeed,conditions,description,datetime,tempmax,tempmin")
                        .queryParam("key", apiKey)
                        .queryParam("contentType", "json")
                        .build(cidade))
                .retrieve()
                .body(String.class);

        try {
            JsonNode raiz = objectMapper.readTree(json);

            JsonNode atual = raiz.path("currentConditions");
            JsonNode dias = raiz.path("days");

            WeatherResponse resposta = new WeatherResponse();

            resposta.setCidade(
                    raiz.path("resolvedAddress").asText(cidade)
            );

            resposta.setTemperatura(
                    atual.path("temp").isNumber()
                            ? atual.path("temp").asDouble()
                            : null
            );

            resposta.setUmidade(
                    atual.path("humidity").isNumber()
                            ? atual.path("humidity").asDouble()
                            : null
            );

            resposta.setVelocidadeVento(
                    atual.path("windspeed").isNumber()
                            ? atual.path("windspeed").asDouble()
                            : null
            );

            resposta.setDescription(
                    atual.path("conditions").asText("")
            );

            // Probabilidade de chuva prevista para o dia atual
            JsonNode diaAtual = dias.path(0);

            resposta.setPossibilidadeChuva(
                    diaAtual.path("precipprob").isNumber()
                            ? diaAtual.path("precipprob").asDouble()
                            : null
            );

            // limitar para 7 dias

            int limite = Math.min(dias.size(), 7);



            List<WeatherResponse.DayForecast> previsoes =
                    new ArrayList<>();

            for (int i = 0; i < limite; i++) {
                JsonNode dia = dias.get(i);

                WeatherResponse.DayForecast previsao =
                        new WeatherResponse.DayForecast();

                previsao.setDate(dia.path("datetime").asText());
                previsao.setTempmax(dia.path("tempmax").asDouble());
                previsao.setTempmin(dia.path("tempmin").asDouble());
                previsao.setConditions(dia.path("conditions").asText());

                previsao.setPossibilidadeChuva(dia.path("precipprob").isNumber()
                        ? dia.path("precipprob").asDouble()
                        : null)
                ;
                previsao.setUmidade(dia.path("humidity").isNumber()
                        ? dia.path("humidity").asDouble()
                        : null);

                previsao.setVelocidadeVento(dia.path("windspeed").isNumber()
                        ? dia.path("windspeed").asDouble()
                        : null);

                previsoes.add(previsao);
            }

            resposta.setDiasSemana(previsoes);

            return resposta;

        } catch (Exception e) {
            throw new RuntimeException(
                    "Erro ao processar os dados meteorológicos.", e
            );
        }
    }
}
