import { IsEmail, IsPhoneNumber, IsString } from 'class-validator';

export class FindContactDto {
    @IsString()
    readonly name: string;

    @IsEmail({}, { message: 'Некорретный формат данных' })
    readonly email: string;

    //валидными считаются только номера, содержащие country-code
    @IsPhoneNumber(null, { message: 'Некорректный формат данных' })
    readonly phone: string;
}
