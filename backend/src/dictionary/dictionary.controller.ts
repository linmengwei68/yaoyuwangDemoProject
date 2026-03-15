import { Controller, Get, Param } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';

@Controller('api/dictionary')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Get()
  findAll() {
    return this.dictionaryService.findAll();
  }

  @Get(':key')
  findByKey(@Param('key') key: string) {
    return this.dictionaryService.findByKey(key);
  }
}
