import { Injectable } from '@nestjs/common';
import { FindContactDto } from './dto/find-Contact.dto';
import { AmoCRMApi } from '../amocrm.api/amocrm-api.wrapper';
import {
    ResponceContactEmbeddedID,
    ResponceContactNotEmbedded,
} from 'src/interfaces/amo-response.data';

@Injectable()
export class ContactService {
    constructor(private readonly amoCrm: AmoCRMApi) {}

    //пытается найти пользователя сначала по телефону, потом по email
    async FindOne(findContactDto: FindContactDto) {
        this.amoCrm.TryRefreshToken();
        let res = await this.amoCrm.GetContactByQuery(findContactDto.phone);

        if (res.status == 200) {
            return this.UpdateContact(res, findContactDto);
        } else if (res.status == 400) {
            return res.data;
        }

        res = await this.amoCrm.GetContactByQuery(findContactDto.email);
        if (res.status == 200) {
            return this.UpdateContact(res, findContactDto);
        } else if (res.status == 204) {
            return this.CreateContact(findContactDto);
        } else {
            return res.data;
        }
    }

    async CreateContact(findContactDto: FindContactDto) {
        const contact: ResponceContactEmbeddedID =
            await this.amoCrm.CreateContact(findContactDto);

        if (contact.status != 200) {
            return contact.data;
        }

        const lead = await this.amoCrm.CreateLead(
            contact.data._embedded.contacts[0].id,
        );
        return lead.data;
    }

    async UpdateContact(
        resContact: ResponceContactEmbeddedID,
        findContactDto: FindContactDto,
    ) {
        const contactID = resContact.data._embedded.contacts[0].id;
        const contact: ResponceContactNotEmbedded =
            await this.amoCrm.UpdateByContactID(contactID, findContactDto);

        const lead = await this.amoCrm.CreateLead(contact.data.id);
        return lead.data;
    }
}
