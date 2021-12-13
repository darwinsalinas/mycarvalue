import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUserService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    // Create a fake copy of userService
    fakeUserService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: ({ email, password }: CreateUserDto) => {
        const user = {
          id: Math.floor(Math.random() * 9999999),
          email,
          password,
        } as User;

        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUserService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instace of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('create a new user with salted and hash password', async () => {
    const user = await service.signup('test@gmail.com', '12345678');

    expect(user.password).not.toEqual('12345678');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('thows an error if users signs up with emal that is in use', async () => {
    fakeUserService.find = () =>
      Promise.resolve([{ id: 1, email: 'sdfsf', password: 'sdfsdf' } as User]);

    await expect(() =>
      service.signup('hola@test.com', '123'),
    ).rejects.toThrow();
  });

  it('throws if signin is called with an unsed email', async () => {
    await expect(
      service.signin('testsadf@test.com', '123123'),
    ).rejects.toThrow();
  });

  it('throws if an ivalid password is proveided', async () => {
    fakeUserService.find = () =>
      Promise.resolve([
        { id: 1, email: 'test@test.com', password: 'password.hasshed' } as User,
      ]);

    await expect(service.signin('test@test.com', '123')).rejects.toThrow();
  });

  it('returns a user if correct password is provided', async () => {
    const new_user = await service.signup('mail@test.com', '123');

    const user = await service.signin('mail@test.com', '123');

    expect(user).toBeDefined();
  });
});
