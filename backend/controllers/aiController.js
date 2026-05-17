import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import ChatSession from '../models/ChatSession.js';

// Controller for handling chat messages with clinical context memory
export const chatWithBot = async (req, res) => {
  const { message, context, sessionId } = req.body;
  try {
    let session;
    let history = [];

    // Fetch or create a ChatSession to maintain conversational context
    if (sessionId) {
      session = await ChatSession.findById(sessionId);
      if (session) {
        history = session.messages.map(msg => `${msg.sender === 'user' ? 'Student' : 'AI'}: ${msg.text}`);
      }
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `You are an expert AI tutor in Odontogenic Oral Pathology. 
    Context of what the student is reading: ${context || 'General Oral Pathology'}.
    Past Conversation History:
    ${history.join('\n')}
    
    Student's message: ${message}
    Provide a helpful, educational, and clinically accurate response.`;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    // Save the new interaction to the database session if it exists
    if (session) {
      session.messages.push({ sender: 'user', text: message });
      session.messages.push({ sender: 'ai', text: aiResponse });
      await session.save();
    }

    res.json({ reply: aiResponse, sessionId: session ? session._id : null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller for generating a quiz from uploaded file or plain text (Faculty)
export const generateQuizFromText = async (req, res) => {
  try {
    const numQuestions = parseInt(req.body.numQuestions) || 10;
    const plainText = req.body.text || '';
    let extractedText = '';

    if (req.file) {
      const ext = req.file.originalname.split('.').pop().toLowerCase();

      if (ext === 'pdf') {
        const data = await pdfParse(req.file.buffer);
        extractedText = data.text;
      } else if (ext === 'docx' || ext === 'doc') {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        extractedText = result.value;
      } else if (ext === 'txt') {
        extractedText = req.file.buffer.toString('utf-8');
      } else if (ext === 'ppt' || ext === 'pptx') {
        // For PPT files, send directly to Gemini as base64 with vision
        const base64 = req.file.buffer.toString('base64');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent([
          `Extract all text content from this PowerPoint presentation and return it as plain text.`,
          { inlineData: { mimeType: req.file.mimetype, data: base64 } }
        ]);
        extractedText = result.response.text();
      } else {
        // Fallback: try reading as plain text
        extractedText = req.file.buffer.toString('utf-8');
      }
    } else if (plainText.trim()) {
      extractedText = plainText;
    } else {
      return res.status(400).json({ message: 'Please provide a file or plain text content.' });
    }

    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(400).json({ message: 'Could not extract enough text from the provided content. Please try a different file.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Based on the following text from an oral pathology document, generate a ${numQuestions}-question multiple choice quiz.
    Format the output as a strict JSON array of objects with keys: text, options (array of 4 strings), correctAnswer (must exactly match one option), explanation, difficulty (one of: easy, medium, hard).
    Text: ${extractedText.substring(0, 12000)}`;

    const result = await model.generateContent(prompt);
    let rawData = result.response.text();
    rawData = rawData.replace(/```json/g, '').replace(/```/g, '').trim();

    const quizData = JSON.parse(rawData);
    res.json({ quiz: quizData, sourceText: extractedText.substring(0, 500) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate a sample practice quiz for students (from a topic/chapter)
export const generateSampleQuiz = async (req, res) => {
  const { topic, chapterTitle, numQuestions } = req.body;
  try {
    const count = parseInt(numQuestions) || 5;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `You are an expert in Odontogenic Oral Pathology. Generate a ${count}-question practice quiz about "${topic || chapterTitle || 'General Oral Pathology'}".
    This is a study tool for dental students, so include helpful explanations.
    Format the output as a strict JSON array of objects with keys: text, options (array of 4 strings), correctAnswer (must exactly match one option), explanation.
    Make questions educational and clinically relevant.`;

    const result = await model.generateContent(prompt);

    let rawData = result.response.text();
    rawData = rawData.replace(/```json/g, '').replace(/```/g, '').trim();

    const quizData = JSON.parse(rawData);
    res.json({ quiz: quizData, topic: topic || chapterTitle });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
