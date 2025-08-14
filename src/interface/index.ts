export interface DriverLocation {
    driver_id: number;
    number: string;
    latitude: number;
    longitude: number;
    tracked_at: string;
}

export interface DriverDetails {
    driver_id: number;
    number: string;
    latitude: string;
    longitude: string;
    tracked_at: string;
    id: number;
    avatar: string | null;
    fio: string;
    phone_number: string;
    length: string;
    width: string;
    height: string;
    trailer_number: string;
    capacity: string;
    carrying: string;
    brand: string;
    condition: number;
    type: number;
    tex_passport: string;
    photos: string;
    employee_id: number;
    rating: number;
    created_at: string;
    updated_at: string;
    source: string;
}
