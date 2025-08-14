// services/truckApi.ts
import type { DriverDetails, DriverLocation } from "../interface";

export class TruckAPI {
  private token: string;
  private baseUrl = "https://mobile.izisol.uz/api";

  constructor(token: string) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    return {
      Accept: "application/json",
      Authorization: `Bearer ${this.token}`,
      "X-CSRF-TOKEN": "",
    };
  }

  async getDriverLocations(): Promise<DriverLocation[]> {
    const response = await fetch(`${this.baseUrl}/drivers-locations`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getDriverDetails(driverId: number): Promise<DriverDetails> {
    const response = await fetch(`${this.baseUrl}/driver-location/${driverId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: { status: boolean; driver: DriverDetails; message: string } = await response.json();

    if (!data.status || !data.driver) {
      throw new Error(data.message || "Failed to fetch driver details");
    }

    return data.driver;
  }

  updateToken(newToken: string) {
    this.token = newToken;
  }
}

// Default instance example (tokenni App ichida `useAuth()` dan olgan holda yangilanadi)
export const truckAPI = new TruckAPI(""); // Bo‘sh token, keyin updateToken() orqali o‘rnatiladi
