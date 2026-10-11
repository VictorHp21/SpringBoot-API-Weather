package com.victor_w.demo.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class ClimaService {

    @Value("${weather.api.key}")
    private String apiKey;

    private final RestClient restClient = RestClient.create();

    public String consultarClima(String cidade){

        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host("weather.visualcrossing.com")
                        .path("/VisualCrossingWebServices/rest/services/timeline/{cidade}")
                        .queryParam("unitGroup", "metric")
                        .queryParam("include", "current")
                        .queryParam("key", apiKey)
                        .queryParam("contentType", "json")
                        .build(cidade))
                .retrieve()
                .body(String.class);


    }

}
