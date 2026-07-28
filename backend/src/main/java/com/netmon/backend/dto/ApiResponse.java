package com.netmon.backend.dto;

import java.time.LocalDateTime;

/**
 * Standardized API response envelope for all REST endpoints in the system.
 *
 * @param <T> the type of the payload data
 */
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;

    /**
     * Default constructor initializing the timestamp.
     */
    public ApiResponse() {
        this.timestamp = LocalDateTime.now();
    }

    /**
     * Constructs a custom API response.
     *
     * @param success indicate if the request was handled successfully
     * @param message helpful summary message
     * @param data    payload data
     */
    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }

    /**
     * Helper to create a successful response envelope.
     *
     * @param data the response payload
     * @param message description message
     * @param <T> the data type
     * @return ApiResponse instance
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, message, data);
    }

    /**
     * Helper to create a failure response envelope.
     *
     * @param message error summary message
     * @param <T> the data type (usually null)
     * @return ApiResponse instance
     */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
