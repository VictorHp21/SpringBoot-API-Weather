package com.victor_w.demo.configuration;

import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class TesteApiKey {

    public TesteApiKey(Environment env) {
        String chave = System.getenv("WEATHER_API_KEY");

        System.out.println(
                "API Key carregada: "
                        + (chave != null && !chave.isBlank())
        );
    }
}