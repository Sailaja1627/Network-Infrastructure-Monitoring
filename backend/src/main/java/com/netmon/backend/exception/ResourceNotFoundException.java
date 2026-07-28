package com.netmon.backend.exception;

/**
 * Custom runtime exception thrown when a requested network resource (e.g. Device, Alert)
 * cannot be found in the database.
 */
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Constructs a new exception with a specific detail message.
     *
     * @param message description of the missing entity
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
