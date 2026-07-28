package com.netmon.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Service managing client SSE (Server-Sent Events) subscriptions.
 * Holds active emitters and broadcasts real-time events to all connected web interfaces.
 */
@Service
public class SseService {

    private static final Logger log = LoggerFactory.getLogger(SseService.class);
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    /**
     * Subscribes a new web client to the SSE event stream.
     * Sets up lifecycle handlers to clean up resources when connection ends.
     *
     * @return the configured SseEmitter instance
     */
    public SseEmitter subscribe() {
        // Emitter timeout set to 1 hour (3600000ms)
        SseEmitter emitter = new SseEmitter(3600000L);

        this.emitters.add(emitter);
        log.info("Client subscribed to SSE stream. Total active connections: {}", emitters.size());

        emitter.onCompletion(() -> {
            this.emitters.remove(emitter);
            log.info("Client completed SSE connection. Active remaining: {}", emitters.size());
        });

        emitter.onTimeout(() -> {
            this.emitters.remove(emitter);
            log.info("Client SSE connection timed out. Active remaining: {}", emitters.size());
        });

        emitter.onError((ex) -> {
            this.emitters.remove(emitter);
            log.warn("Client SSE connection error. Active remaining: {}", emitters.size());
        });

        // Send a handshake event immediately so client knows connection is successful
        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECT")
                    .data("Connection established successfully"));
        } catch (IOException e) {
            this.emitters.remove(emitter);
            log.error("Failed to send initial SSE handshake, client removed", e);
        }

        return emitter;
    }

    /**
     * Broadcasts a payload event to all registered and active client streams.
     * Invalid/dead connections are removed automatically.
     *
     * @param eventName the name of the SSE event
     * @param data      the payload object (serialized to JSON)
     */
    public void broadcast(String eventName, Object data) {
        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(data));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }

        if (!deadEmitters.isEmpty()) {
            this.emitters.removeAll(deadEmitters);
            log.info("Cleaned up {} broken SSE emitters. Active connections: {}", deadEmitters.size(), emitters.size());
        }
    }
}
