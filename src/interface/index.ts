import { ImageItem } from "../pages/queues";

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



type Status = 'pending' | 'pending_review' | 'waiting_payment' | 'payment_uploaded' | 'approved' | 'rejected';





export interface BorderQueue {
    id: number;
    driver_id: number;
    border_name: string;
    date: string;
    time_from: string;
    time_to: string;
    has_cmr: number;
    price: number;
    status: Status;
    created_at: string;
    updated_at: string;
    driver: Driver;
    files: File[]
    duration?: number;
    insurance_type?: 'unlimited' | 'limited';
    country?: string;
    type?: string;
    documents?: ImageItem[];
    
    
}

export interface DriverDocument {
    id: number;
    driver_id: number;
    name: string;
    path: string;
    file_type: string;
    extension: string;
    mime_type: string;
    status: 'approved' | 'rejected' | 'pending';
    comment: string | null;
    reviewed_by: number | null;
    reviewed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Driver {
    id: number;
    is_verified: 'pending' | 'completed' | 'inprogress' | 'rejected'
    in_egs: number;
    phone_number: string;
    telegram_chat_id: string;
    fio: string;
    number: string;
    source_db: string;
    is_existing_driver: boolean;
    additional_info: string;
    last_login_at: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    is_online: number;
    fcm_token: string;
    document?: ImageItem[];
    documents?: ImageItem[];
    external_id?:string
}


export interface File {
    id: number;
    queue_id: number;
    path: string;
    type: string;
    status: "approved" | "pending" | "rejected" | string;
    created_at: string; // yoki Date
    updated_at: string; // yoki Date
}

