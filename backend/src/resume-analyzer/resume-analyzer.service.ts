import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from '../jobs/schemas/job.schema';
import axios from 'axios';
import * as mammoth from 'mammoth';

@Injectable()
export class ResumeAnalyzerService {
  constructor(
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
  ) {}

  async analyzeResume(file?: any, resumeText?: string) {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new BadRequestException('GEMINI_API_KEY is not configured in the server .env file.');
    }

    let isMultimodal = false;
    let base64Data = '';
    let fileMimeType = '';

    // If file is provided, process based on mimetype
    if (file) {
      const mimetype = file.mimetype;
      
      if (mimetype === 'application/pdf' || mimetype.startsWith('image/')) {
        isMultimodal = true;
        base64Data = file.buffer.toString('base64');
        fileMimeType = mimetype;
      } else if (mimetype === 'text/plain') {
        resumeText = file.buffer.toString('utf-8');
      } else if (
        mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        mimetype === 'application/msword'
      ) {
        try {
          const docxResult = await mammoth.extractRawText({ buffer: file.buffer });
          resumeText = docxResult.value;
        } catch (docxError: any) {
          throw new BadRequestException(`Failed to read DOCX file: ${docxError.message}`);
        }
      } else {
        throw new BadRequestException('Unsupported file format. Please upload PDF, DOCX, TXT, or Image (PNG/JPEG).');
      }
    }

    // Ensure we have either text or a multimodal attachment
    if (!isMultimodal && (!resumeText || resumeText.trim().length < 20)) {
      throw new BadRequestException('Please paste your resume text or upload a valid resume file.');
    }

    const systemPrompt = `You are an expert Applicant Tracking System (ATS) evaluation expert and career coach.
Analyze the provided document or image and evaluate it.
First, perform a strict check to verify if the uploaded document is a valid personal resume, CV, or professional profile containing an individual person's details (such as their name, personal skills, career history, education, or projects).
Identify the exact document type (e.g., "resume", "driving license", "passport copy", "national ID card", "personal portrait photo", "landscape photo", "infographic poster", "YouTube thumbnail", "invoice", "syllabus", "text document", "source code", etc.) and return it in the "detectedDocumentType" field.

You must return the analysis strictly as a raw JSON object matching the following structure:
{
  "isValidResume": true,
  "detectedDocumentType": "resume",
  "invalidReason": "",
  "score": 75,
  "skills": ["JavaScript", "React", "Node.js", "Git"],
  "strengths": ["Clear work history and project descriptions", "Strong skill alignment for Software Development roles"],
  "improvements": ["Add concrete metrics or outcomes to your achievements (e.g. 'boosted efficiency by 20%')", "Include a professional summary at the top"],
  "missingKeywords": ["Docker", "TypeScript", "RESTful APIs"],
  "suggestedCategory": "IT Job",
  "keywordsForSearch": ["Software Developer", "Frontend Engineer", "Node Developer"]
}

CRITICAL RULES FOR VALIDATION:
1. To be a valid resume, the document MUST belong to an individual person and describe their personal skills, work history, projects, or education.
2. Landscape photos, YouTube thumbnails, general career posters, cartoon infographics about hiring (like "The Hiring Game Changed"), advertisements, course syllabus sheets, driving licenses, passport pages, or national ID cards are NOT valid resumes.
3. If you detect any of these non-resume documents, you MUST set "isValidResume" to false, set "detectedDocumentType" to the exact item you saw (e.g., "YouTube thumbnail", "driving license", "career poster"), and set "invalidReason" to a highly specific message, for example: "It looks like you uploaded a YouTube thumbnail or career poster about hiring. Please upload a valid personal resume instead."

Ensure that "suggestedCategory" is strictly one of these exact values: "IT Job", "Non IT Job", "Walk In Drive", "Govt Job", "Internship", "Part Time Job", "Remote Job".
Return only the raw JSON. Do not include markdown codeblocks like \`\`\`json or any other text before or after the JSON.`;

    const modelsToTry = [
      'gemini-2.0-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-flash-latest',
      'gemini-2.5-pro',
      'gemini-1.5-pro',
      'gemini-2.5-flash',
    ];

    let parsedData: any = null;
    let finalError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        
        let parts: any[] = [];
        parts.push({ text: systemPrompt });

        if (isMultimodal) {
          parts.push({
            inlineData: {
              mimeType: fileMimeType,
              data: base64Data
            }
          });
        } else {
          parts.push({ text: resumeText });
        }

        const requestPayload = {
          contents: [
            {
              parts: parts
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        };

        const response = await axios.post(url, requestPayload);
        const candidate = response.data?.candidates?.[0];
        const responseText = candidate?.content?.parts?.[0]?.text || '{}';
        
        parsedData = JSON.parse(responseText.trim());
        if (parsedData) {
          if (parsedData.isValidResume === false) {
            throw new BadRequestException(parsedData.invalidReason || 'The uploaded document does not appear to be a valid professional resume. Please upload a CV or resume.');
          }
          console.log(`Successfully analyzed resume using model: ${modelName}`);
          break; // Exit loop on success
        }
      } catch (error: any) {
        if (error instanceof BadRequestException) {
          throw error; // Rethrow validation failure immediately!
        }
        if (error.response?.status === 429) {
          console.warn(`Model ${modelName} hit rate limit (429). Retrying next fallback in 2 seconds...`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          finalError = error;
          continue; // Try the next model after 2 seconds
        }
        const errMsg = error.response?.data?.error?.message || error.message;
        console.warn(`Model ${modelName} failed: ${errMsg}`);
        finalError = error;
      }
    }

    if (!parsedData) {
      const isRateLimit = finalError?.response?.status === 429;
      const finalMsg = isRateLimit 
        ? 'Gemini API rate limit exceeded or quota exhausted. Please wait 10-15 seconds and try again.'
        : `Failed to analyze resume with all fallback models. Last error: ${finalError?.response?.data?.error?.message || finalError?.message}`;
      throw new BadRequestException(finalMsg);
    }

    // Extracted suggested category and search keywords
    const suggestedCategory = parsedData.suggestedCategory || 'IT Job';
    const keywordsForSearch = parsedData.keywordsForSearch || [];

      // Query matching open jobs in MongoDB
      const jobQuery: any = {
        status: 'Open',
        isDeleted: { $ne: true },
      };

      if (keywordsForSearch && keywordsForSearch.length > 0) {
        const regexes = keywordsForSearch.map(
          (kw: string) =>
            new RegExp(
              String(kw.trim()).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
              'i',
            ),
        );
        jobQuery.$or = [
          { category: suggestedCategory },
          { title: { $in: regexes } },
        ];
      } else {
        jobQuery.category = suggestedCategory;
      }

      const matchingJobs = await this.jobModel
        .find(jobQuery)
        .populate('postedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
        .exec();

      return {
        success: true,
        score: parsedData.score || 50,
        skills: parsedData.skills || [],
        strengths: parsedData.strengths || [],
        improvements: parsedData.improvements || [],
        missingKeywords: parsedData.missingKeywords || [],
        suggestedCategory,
        matchingJobs,
      };
  }
}
