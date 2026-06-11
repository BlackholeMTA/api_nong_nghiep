import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { ILike, In, Repository } from 'typeorm';
import { AdministrativeUnit } from '../administrative-units/entities/administrative-unit.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Role } from '../roles/entities/role.entity';
import { AssignUserRolesDto } from './dto/assign-user-roles.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './entities/user-role.entity';
import { User } from './entities/user.entity';

const PASSWORD_SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(AdministrativeUnit)
    private readonly administrativeUnitRepository: Repository<AdministrativeUnit>,
  ) {}

  async findAll(query: QueryUserDto): Promise<{
    items: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Record<string, unknown> = {};

    if (query.tenDangNhap) {
      where.tenDangNhap = ILike(`%${query.tenDangNhap}%`);
    }

    if (query.tenDayDu) {
      where.tenDayDu = ILike(`%${query.tenDayDu}%`);
    }

    if (query.email) {
      where.email = ILike(`%${query.email}%`);
    }

    if (query.coQuanDonViId) {
      where.coQuanDonViId = query.coQuanDonViId;
    }

    if (query.donViHanhChinhId) {
      where.donViHanhChinhId = query.donViHanhChinhId;
    }

    if (typeof query.dangHoatDong === 'boolean') {
      where.dangHoatDong = query.dangHoatDong;
    }

    const [items, total] = await this.userRepository.findAndCount({
      where,
      order: {
        tenDayDu: 'ASC',
        tenDangNhap: 'ASC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        organization: true,
        administrativeUnit: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    await this.ensureUsernameIsUnique(dto.tenDangNhap);
    await this.ensureEmailIsUnique(dto.email);
    await this.validateRelations(dto.coQuanDonViId, dto.donViHanhChinhId);

    const user = this.userRepository.create({
      tenDangNhap: dto.tenDangNhap,
      matKhauHash: await hash(dto.password, PASSWORD_SALT_ROUNDS),
      tenDayDu: dto.tenDayDu,
      email: dto.email,
      dienThoai: dto.dienThoai,
      coQuanDonViId: dto.coQuanDonViId,
      donViHanhChinhId: dto.donViHanhChinhId,
      dangHoatDong: dto.dangHoatDong,
    });

    return this.userRepository.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (dto.tenDangNhap && dto.tenDangNhap !== user.tenDangNhap) {
      await this.ensureUsernameIsUnique(dto.tenDangNhap);
    }

    if (dto.email && dto.email !== user.email) {
      await this.ensureEmailIsUnique(dto.email);
    }

    await this.validateRelations(dto.coQuanDonViId, dto.donViHanhChinhId);

    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<User> {
    const user = await this.findOne(id);

    user.matKhauHash = await hash(dto.password, PASSWORD_SALT_ROUNDS);
    return this.userRepository.save(user);
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.findOne(id);

    user.dangHoatDong = false;
    return this.userRepository.save(user);
  }

  async assignRoles(id: string, dto: AssignUserRolesDto): Promise<Role[]> {
    await this.ensureExists(id);
    const roles = await this.findRolesByIds(dto.vaiTroIds);

    await this.userRoleRepository.manager.transaction(async (manager) => {
      await manager.delete(UserRole, { nguoiDungId: id });

      if (roles.length > 0) {
        await manager.save(
          roles.map((role) =>
            this.userRoleRepository.create({
              nguoiDungId: id,
              vaiTroId: role.id,
            }),
          ),
        );
      }
    });

    return roles;
  }

  async findRoles(id: string): Promise<Role[]> {
    await this.ensureExists(id);
    const userRoles = await this.userRoleRepository.find({
      where: { nguoiDungId: id },
      relations: {
        role: true,
      },
      order: {
        taoLuc: 'ASC',
      },
    });

    return userRoles.map((userRole) => userRole.role);
  }

  private async validateRelations(
    coQuanDonViId?: string,
    donViHanhChinhId?: string,
  ): Promise<void> {
    if (coQuanDonViId) {
      const exists = await this.organizationRepository.exists({
        where: { id: coQuanDonViId },
      });

      if (!exists) {
        throw new NotFoundException('Organization not found');
      }
    }

    if (donViHanhChinhId) {
      const exists = await this.administrativeUnitRepository.exists({
        where: { id: donViHanhChinhId },
      });

      if (!exists) {
        throw new NotFoundException('Administrative unit not found');
      }
    }
  }

  private async ensureExists(id: string): Promise<void> {
    const exists = await this.userRepository.exists({ where: { id } });

    if (!exists) {
      throw new NotFoundException('User not found');
    }
  }

  private async ensureUsernameIsUnique(tenDangNhap: string): Promise<void> {
    const exists = await this.userRepository.exists({
      where: { tenDangNhap },
    });

    if (exists) {
      throw new ConflictException('Username already exists');
    }
  }

  private async ensureEmailIsUnique(email?: string): Promise<void> {
    if (!email) {
      return;
    }

    const exists = await this.userRepository.exists({
      where: { email },
    });

    if (exists) {
      throw new ConflictException('Email already exists');
    }
  }

  private async findRolesByIds(ids: string[]): Promise<Role[]> {
    if (ids.length === 0) {
      return [];
    }

    const roles = await this.roleRepository.find({
      where: {
        id: In(ids),
      },
    });

    if (roles.length !== ids.length) {
      throw new NotFoundException('One or more roles were not found');
    }

    return roles;
  }
}
