import { User } from './entities/user.entity';

export type UserResponse = Omit<User, 'matKhauHash'>;

export function sanitizeUser(user: User): UserResponse {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { matKhauHash, ...safeUser } = user;
  return safeUser;
}

export function sanitizeUsers(users: User[]): UserResponse[] {
  return users.map((user) => sanitizeUser(user));
}
