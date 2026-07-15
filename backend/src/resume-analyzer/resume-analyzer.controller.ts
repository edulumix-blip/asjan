import { Controller, Post, Body, HttpCode, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeAnalyzerService } from './resume-analyzer.service';

@Controller('resume-analyzer')
export class ResumeAnalyzerController {
  constructor(private readonly resumeAnalyzerService: ResumeAnalyzerService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async analyze(
    @UploadedFile() file?: any,
    @Body('resumeText') resumeText?: string,
  ) {
    return this.resumeAnalyzerService.analyzeResume(file, resumeText);
  }
}
