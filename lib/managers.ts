export interface Manager {
  id: number;
  email: string;
  name: string;
  passwordHash: string;
}

// Mock manager data with bcrypt-hashed passwords
// Password for admin@store.local is: admin123
export const managers: Manager[] = [
  {
    id: 1,
    email: 'admin@store.local',
    name: '管理者',
    passwordHash: '$2b$12$qdDk89zB4/8PYKXPtJBG.eeycbOHOyRwB3qIxi6X7yttqEdviJrAS',
  },
];
