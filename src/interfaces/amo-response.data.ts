import { AxiosResponse } from 'axios';

export interface ResponceContactEmbeddedID extends AxiosResponse {
    data: {
        _embedded: {
            contacts: Contact[];
        };
    };
}

interface Contact {
    id: number;
}

export interface ResponceContactNotEmbedded extends AxiosResponse {
    data: {
        id: number;
    };
}
