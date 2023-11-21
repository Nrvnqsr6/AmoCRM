import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { AmoCRMApi } from '../amocrm.api/amocrm-api.wrapper';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule],
    controllers: [ContactController],
    providers: [ContactService, AmoCRMApi],
})
export class ContactModule {}
