import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import pdfParse from 'pdf-parse';

const extractionPrompt = `
Extract invoice data from the following text and return ONLY a valid JSON object with this exact structure:

{
  "vendor": {
    "name": "vendor company name",
    "address": "vendor address if available",
    "taxId": "tax ID if available"
  },
  "invoice": {
    "number": "invoice number",
    "date": "invoice date in YYYY-MM-DD format",
    "currency": "currency code like USD, EUR etc",
    "subtotal": 0,
    "taxPercent": 0,
    "total": 0,
    "poNumber": "purchase order number if available",
    "poDate": "PO date if available",
    "lineItems": [
      {
        "description": "item description",
        "unitPrice": 0,
        "quantity": 0,
        "total": 0
      }
    ]
  }
}

Text to extract from:
`;

export const extractWithGemini = async (pdfBuffer: Buffer): Promise<any> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Parse PDF to text
    const pdfData = await pdfParse(pdfBuffer);
    const text = pdfData.text;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(extractionPrompt + text);
    const response = await result.response;
    const extractedText = response.text();

    // Try to parse JSON from the response
    const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Gemini extraction error:', error);
    throw new Error('AI extraction failed');
  }
};

export const extractWithGroq = async (pdfBuffer: Buffer): Promise<any> => {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured');
    }

    // Parse PDF to text
    const pdfData = await pdfParse(pdfBuffer);
    const text = pdfData.text;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: extractionPrompt + text
        }
      ],
      model: "mixtral-8x7b-32768",
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from Groq');
    }

    // Try to parse JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Groq extraction error:', error);
    throw new Error('AI extraction failed');
  }
};
