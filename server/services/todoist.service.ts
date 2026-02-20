import { db } from '../db';

export class TodoistService {
  private apiKey: string;
  private baseUrl = 'https://api.todoist.com/rest/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getTasks() {
    const response = await fetch(`${this.baseUrl}/tasks`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    return response.json();
  }

  async getProjects() {
    const response = await fetch(`${this.baseUrl}/projects`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    return response.json();
  }
}

export default TodoistService;
