package com.victor_w.demo.Controller;

import com.victor_w.demo.model.WeatherResponse;
import com.victor_w.demo.services.ClimaService;

import org.springframework.web.bind.annotation.*;

@RestController
//@RequestMapping("api/weather")
//@CrossOrigin(origins = "*")
public class ClimaController {

    private final ClimaService service;

    public ClimaController(ClimaService service) {
        this.service = service;
    }

    @GetMapping("/clima")
    public WeatherResponse consultarClima(
            @RequestParam String cidade) {

        return service.consultarClima(cidade);
    }
}



