const BASE_URL = 'http://localhost:8080/api';

/**
 * Helper to process response and handle exceptions.
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = `HTTP error! Status: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // JSON parsing failed, fallback to HTTP status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  
  const apiResponse = await response.json();
  if (apiResponse && apiResponse.success === false) {
    throw new Error(apiResponse.message || 'Operation failed');
  }
  return apiResponse.data;
}

/**
 * Service representing REST endpoints for Devices and Alerts.
 */
export const DeviceApiService = {
  /**
   * Fetches all registered network devices.
   */
  async getDevices() {
    const res = await fetch(`${BASE_URL}/devices`);
    return handleResponse(res);
  },

  /**
   * Fetches a specific device.
   */
  async getDevice(id) {
    const res = await fetch(`${BASE_URL}/devices/${id}`);
    return handleResponse(res);
  },

  /**
   * Creates a new network device.
   */
  async createDevice(deviceData) {
    const res = await fetch(`${BASE_URL}/devices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deviceData),
    });
    return handleResponse(res);
  },

  /**
   * Updates an existing device.
   */
  async updateDevice(id, deviceData) {
    const res = await fetch(`${BASE_URL}/devices/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deviceData),
    });
    return handleResponse(res);
  },

  /**
   * Deletes a device from monitoring mapping.
   */
  async deleteDevice(id) {
    const res = await fetch(`${BASE_URL}/devices/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },
};

export const AlertApiService = {
  /**
   * Fetches all unresolved active alerts.
   */
  async getUnresolvedAlerts() {
    const res = await fetch(`${BASE_URL}/alerts/unresolved`);
    return handleResponse(res);
  },

  /**
   * Fetches full historical alert list.
   */
  async getAlertHistory() {
    const res = await fetch(`${BASE_URL}/alerts`);
    return handleResponse(res);
  },

  /**
   * Resolves/Acknowledges an active alert.
   */
  async resolveAlert(id) {
    const res = await fetch(`${BASE_URL}/alerts/${id}/resolve`, {
      method: 'POST',
    });
    return handleResponse(res);
  },
};
