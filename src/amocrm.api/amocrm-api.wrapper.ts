import tokens from 'tokens.json';
import {
    AMOCRM_API_ACCESS_TOKEN,
    AMOCRM_API_BASE_URL,
    AMOCRM_API_CONTACTS,
    AMOCRM_API_LEAD,
    AMOCRM_REDIRECT_URL,
    CLIENT_ID,
    CLIENT_SECRET,
} from './consts';
import { FindContactDto } from '../contact/dto/find-contact.dto';
import { catchError, firstValueFrom } from 'rxjs';
import { HttpException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import fs from 'fs';
import { AxiosResponse } from 'axios';

@Injectable()
export class AmoCRMApi {
    constructor(private readonly httpService: HttpService) {}

    private requestHeaders = {
        'Content-Type': 'application/json',
        Authorization: `${tokens.token_type} ${tokens.access_token}`,
    };

    private amocrm_url = AMOCRM_API_BASE_URL;

    public async TryRefreshToken() {
        // eslint-disable-next-line prettier/prettier
        if (!this.isTokenExpired())
            return

        const url = this.amocrm_url + AMOCRM_API_ACCESS_TOKEN;
        const body = this.makeRefreshBody();

        const res = await firstValueFrom(
            this.httpService.post(url, body).pipe(
                catchError((e) => {
                    throw new HttpException(e.response.data, e.response.status);
                }),
            ),
        );

        this.writeNewTokenJson(res);
    }

    public GetContactByQuery(query: string) {
        const requestParams = {
            query: query,
        };
        const url = this.amocrm_url + AMOCRM_API_CONTACTS;
        return firstValueFrom(
            this.httpService
                .get(url, {
                    headers: this.requestHeaders,
                    params: requestParams,
                })
                .pipe(
                    catchError((e) => {
                        throw new HttpException(
                            e.response.data,
                            e.response.status,
                        );
                    }),
                ),
        );
    }

    public CreateContact(Contact: FindContactDto) {
        const requestBody = this.makeRequestBodyContactCreate(Contact);
        const url = this.amocrm_url + AMOCRM_API_CONTACTS;
        return firstValueFrom(
            this.httpService
                .post(url, requestBody, {
                    headers: this.requestHeaders,
                })
                .pipe(
                    catchError((e) => {
                        throw new HttpException(
                            e.response.data,
                            e.response.status,
                        );
                    }),
                ),
        );
    }

    public CreateLead(contactID: number) {
        const requestBody = this.makeRequestBodyLeadCreate(contactID);
        const url = this.amocrm_url + AMOCRM_API_LEAD;

        return firstValueFrom(
            this.httpService
                .post(url, requestBody, {
                    headers: this.requestHeaders,
                })
                .pipe(
                    catchError((e) => {
                        throw new HttpException(
                            e.response.data,
                            e.response.status,
                        );
                    }),
                ),
        );
    }

    public UpdateByContactID(id: number, Contact: FindContactDto) {
        const requestBody = this.makeRequestBodyContactUpdate(id, Contact);
        const url = AMOCRM_API_BASE_URL + AMOCRM_API_CONTACTS + '/' + id;

        return firstValueFrom(
            this.httpService
                .patch(url, requestBody, {
                    headers: this.requestHeaders,
                })
                .pipe(
                    catchError((e) => {
                        throw new HttpException(
                            e.response.data,
                            e.response.status,
                        );
                    }),
                ),
        );
    }

    private makeRequestBodyContactCreate(ContactDto: FindContactDto) {
        return [
            {
                name: ContactDto.name,
                custom_fields_values: [
                    {
                        field_id: 1443017,
                        values: [
                            {
                                value: ContactDto.phone,
                            },
                        ],
                    },
                    {
                        field_id: 1443019,
                        values: [
                            {
                                value: ContactDto.email,
                            },
                        ],
                    },
                ],
            },
        ];
    }

    private makeRequestBodyLeadCreate(id: number) {
        return [
            {
                _embedded: {
                    contacts: [
                        {
                            id: id,
                        },
                    ],
                },
            },
        ];
    }

    private makeRequestBodyContactUpdate(id: number, Contact: FindContactDto) {
        return {
            id: id,
            name: Contact.name,
            custom_fields_values: [
                {
                    field_id: 1443017,
                    values: [
                        {
                            value: Contact.phone,
                        },
                    ],
                },
                {
                    field_id: 1443019,
                    values: [
                        {
                            value: Contact.email,
                        },
                    ],
                },
            ],
        };
    }

    private makeRefreshBody() {
        return {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: tokens.refresh_token,
            redirect_uri: AMOCRM_REDIRECT_URL,
        };
    }

    private isTokenExpired() {
        const expireAt = new Date();
        expireAt.setSeconds(expireAt.getSeconds() + tokens.expires_in);
        const curDate = new Date();
        if (expireAt > curDate) return false;
        return true;
    }

    private writeNewTokenJson(res: AxiosResponse) {
        res.data.start_in = new Date();
        fs.writeFile('tokens.json', JSON.stringify(res.data), (err) => {
            if (err) throw err;
            console.log('complete');
        });
    }
}
