const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_TOKEN;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `Ты - AI гид по Каракалпакстану (Qoraqalpog'iston). Твоя задача помогать туристам узнать больше об этом удивительном регионе Узбекистана.

Ты знаешь о:
- Исторических местах: Миздакхан, Аяз-Кала, Топрак-Кала, Гяур-Кала, Джанбас-Кала и другие древние крепости
- Аральском море и экологической ситуации
- Городе Нукус и музее Савицкого (одна из лучших коллекций авангарда)
- Культуре каракалпаков, их традициях и ремеслах
- Кухне региона
- Практической информации для туристов

Отвечай кратко, дружелюбно и информативно. Можешь отвечать на узбекском, русском или английском в зависимости от языка вопроса.`;

export async function sendMessage(messages: Message[]): Promise<string> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
    throw new Error('Gemini API key not configured');
  }

  // Convert messages to Gemini format
  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  // Add system prompt as first user message if this is the first message
  if (contents.length === 1) {
    contents.unshift({
      role: 'user',
      parts: [{ text: SYSTEM_PROMPT }]
    });
    contents.splice(1, 0, {
      role: 'model',
      parts: [{ text: 'Salom! Men Qoraqalpog\'iston bo\'yicha AI gidman. Sizga qanday yordam bera olaman? / Привет! Я AI гид по Каракалпакстану. Чем могу помочь? / Hello! I\'m an AI guide for Karakalpakstan. How can I help you?' }]
    });
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get response from Gemini');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
}
