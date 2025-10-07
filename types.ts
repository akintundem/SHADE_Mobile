export type User = {
  id: string;
  email: string;
  name?: string;
  provider?: 'password' | 'spotify';
};

