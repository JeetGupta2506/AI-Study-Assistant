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
      throw new Error('Failed to generate quiz');
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