import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

interface LoginData {
  username: string;
  password: string;
}

interface SignupData {
  username: string;
  password: string;
}

export const login = async (data: LoginData) => {
  const response = await axios.post(`${API_URL}/login`, data);
  return response.data;
};

export const signup = async (data: SignupData) => {
  const response = await axios.post(`${API_URL}/register`, data);
  return response.data;
};