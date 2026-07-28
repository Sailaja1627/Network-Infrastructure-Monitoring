package com.netmon.backend.controller;

import com.netmon.backend.service.SseService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * REST controller providing a real-time event stream mapping via Server-Sent Events (SSE).
 * Clients connect to `/api/stream` to receive server push notifications.
 */
@RestController
@RequestMapping("/api/stream")
public class SseController {

    private final SseService sseService;

    public SseController(SseService sseService) {
        this.sseService = sseService;
    }

    /**
     * Establish a persistent Server-Sent Event stream connection for a client.
     * Serves live telemetry metrics and alerts.
     *
     * @return a persistent SseEmitter stream configuration
     */
    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter getEventStream() {
        return sseService.subscribe();
    }
}
