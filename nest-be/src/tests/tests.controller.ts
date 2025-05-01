import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Logger,
  ValidationPipe,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { TestsService } from './tests.service';
import { FindAllTestsQueryDto } from './dto/find-all-tests-query.dto';
import { JwtGuard } from '../auth/guards/auth.guard';

@UseGuards(JwtGuard)
@Controller('tests')
export class TestsController {
  private readonly logger = new Logger(TestsController.name);

  constructor(private readonly testsService: TestsService) {}

  @Get()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  )
  async findAllActive(@Query() queryDto: FindAllTestsQueryDto) {
    this.logger.log(
      `Received request for active tests list with query: ${JSON.stringify(queryDto)}`,
    );
    return this.testsService.findAllActive(queryDto);
  }

  @Get(':id')
  async findOneDetails(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(
      `Received request for test details (metadata only) with ID: ${id}`,
    );
    return this.testsService.findOneDetails(id);
  }

  @Get(':id/data-for-taking')
  async getTestDataForTaking(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(
      `Received request to get test data for taking UI with ID: ${id}`,
    );
    return this.testsService.getTestDataForTaking(id);
  }
}
