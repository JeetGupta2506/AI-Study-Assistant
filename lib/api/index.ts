const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = {
  // Document endpoints
  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload document');
    }
    
    return response.json();
  },

  async generateSummary(text: string) {
    const response = await fetch(`${API_BASE_URL}/documents/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to generate summary');
    }
    
    return response.json();
  },

  // Chat endpoints
  async sendChatMessage(content: string, context: string) {
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, context }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    
    return response.json();
  },

  // Streaming chat endpoint
  async sendChatMessageStream(content: string, context: string, onChunk: (chunk: string) => void, onDone: () => void, onError: (error: string) => void) {
    const response = await fetch(`${API_BASE_URL}/chat/message/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, context }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'chunk') {
                onChunk(data.content);
              } else if (data.type === 'done') {
                onDone();
                return;
              } else if (data.type === 'error') {
                onError(data.message);
                return;
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },


  // Quiz endpoints
  async generateQuiz(text: string, numQuestions: number = 5) {
    const response = await fetch(`${API_BASE_URL}/quiz/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, num_questions: numQuestions }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to generate quiz' }));
      throw new Error(errorData.detail || 'Failed to generate quiz');
    }
    
    return response.json();
  },

  async checkQuizAnswer(quizId: string, questionId: string, answer: number) {
    const response = await fetch(`${API_BASE_URL}/quiz/check-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quiz_id: quizId, question_id: questionId, answer }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to check answer');
    }
    
    return response.json();
  },
};