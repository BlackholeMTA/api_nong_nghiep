import { sanitizeUser } from './user-response';
import { User } from './entities/user.entity';

describe('sanitizeUser', () => {
  it('removes matKhauHash from user responses', () => {
    const user = {
      id: 'user-id',
      tenDangNhap: 'admin',
      matKhauHash: 'secret-hash',
    } as User;

    expect(sanitizeUser(user)).not.toHaveProperty('matKhauHash');
  });
});
