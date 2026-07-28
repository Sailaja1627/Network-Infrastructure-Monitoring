import { useEffect, useState, useRef } from 'react';

/**
 * Custom React hook for connecting to the Spring Boot Server-Sent Events (SSE) stream.
 * 
 * @param {Object} eventHandlers object containing callback functions key-mapped to SSE event names.
 * @returns {String} connectionStatus ('CONNECTED', 'RECONNECTING', 'DISCONNECTED')
 */
export function useSse(eventHandlers) {
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    let active = true;

    function connect() {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      setConnectionStatus('RECONNECTING');
      console.log('Connecting to Server-Sent Events stream...');
      
      const es = new EventSource('http://localhost:8080/api/stream');
      eventSourceRef.current = es;

      es.addEventListener('CONNECT', (e) => {
        if (active) {
          setConnectionStatus('CONNECTED');
          console.log('SSE Handshake: Connected successfully. Data:', e.data);
        }
      });

      // Bind all dynamic event handlers provided by the caller
      Object.keys(eventHandlers).forEach((eventName) => {
        es.addEventListener(eventName, (event) => {
          if (!active) return;
          try {
            const data = JSON.parse(event.data);
            if (eventHandlers[eventName]) {
              eventHandlers[eventName](data);
            }
          } catch (e) {
            // Some events might just be plain strings
            if (eventHandlers[eventName]) {
              eventHandlers[eventName](event.data);
            }
          }
        });
      });

      es.onerror = (err) => {
        if (!active) return;
        console.warn('SSE connection lost or error encountered. Reconnecting in 5 seconds...', err);
        setConnectionStatus('DISCONNECTED');
        es.close();

        // Attempt reconnection after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          if (active) connect();
        }, 5000);
      };
    }

    connect();

    return () => {
      active = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      console.log('SSE connection cleaned up.');
    };
  }, []);

  return connectionStatus;
}
