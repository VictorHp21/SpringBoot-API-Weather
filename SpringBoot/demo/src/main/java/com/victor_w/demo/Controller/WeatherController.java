package com.victor_w.demo.Controller;

import com.victor_w.demo.model.WeatherResponse;
import com.victor_w.demo.services.WeatherService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/weather")
@CrossOrigin(origins = "*")
public class WeatherController {

    private final WeatherService service;

    public WeatherController(WeatherService service) {
        this.service = service;
    }

    @GetMapping
    public WeatherResponse getWeather(@RequestParam String city, @RequestParam String country) {
        return service.getWeather(city, country);
    }
}



