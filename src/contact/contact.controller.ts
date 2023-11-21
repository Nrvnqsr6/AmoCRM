import { Controller, Get, Query } from '@nestjs/common';
import { FindContactDto } from './dto/find-Contact.dto';
import { ContactService } from './contact.service';

@Controller('contacts')
export class ContactController {
    constructor(private readonly сontactService: ContactService) {}

    @Get()
    findOne(@Query() findContactDto: FindContactDto) {
        return this.сontactService.FindOne(findContactDto);
    }
}
