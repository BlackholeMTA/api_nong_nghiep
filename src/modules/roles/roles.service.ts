import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from '../permissions/entities/permission.entity';
import { AssignRolePermissionsDto } from './dto/assign-role-permissions.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolePermission } from './entities/role-permission.entity';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findAll(query: QueryRoleDto): Promise<{
    items: Role[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Record<string, unknown> = {};

    if (query.ma) {
      where.ma = query.ma;
    }

    if (query.ten) {
      where.ten = query.ten;
    }

    if (typeof query.dangHoatDong === 'boolean') {
      where.dangHoatDong = query.dangHoatDong;
    }

    const [items, total] = await this.roleRepository.findAndCount({
      where,
      order: {
        ten: 'ASC',
        ma: 'ASC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    await this.ensureCodeIsUnique(dto.ma);

    return this.roleRepository.save(this.roleRepository.create(dto));
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    if (dto.ma && dto.ma !== role.ma) {
      await this.ensureCodeIsUnique(dto.ma);
    }

    Object.assign(role, dto);
    return this.roleRepository.save(role);
  }

  async deactivate(id: string): Promise<Role> {
    const role = await this.findOne(id);

    role.dangHoatDong = false;
    return this.roleRepository.save(role);
  }

  async assignPermissions(
    id: string,
    dto: AssignRolePermissionsDto,
  ): Promise<Permission[]> {
    await this.ensureExists(id);
    const permissions = await this.findPermissionsByIds(dto.quyenHanIds);

    await this.rolePermissionRepository.manager.transaction(async (manager) => {
      await manager.delete(RolePermission, { vaiTroId: id });

      if (permissions.length > 0) {
        await manager.save(
          permissions.map((permission) =>
            this.rolePermissionRepository.create({
              vaiTroId: id,
              quyenHanId: permission.id,
            }),
          ),
        );
      }
    });

    return permissions;
  }

  async findPermissions(id: string): Promise<Permission[]> {
    await this.ensureExists(id);
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { vaiTroId: id },
      relations: {
        permission: true,
      },
      order: {
        taoLuc: 'ASC',
      },
    });

    return rolePermissions.map((rolePermission) => rolePermission.permission);
  }

  private async ensureExists(id: string): Promise<void> {
    const exists = await this.roleRepository.exists({ where: { id } });

    if (!exists) {
      throw new NotFoundException('Role not found');
    }
  }

  private async ensureCodeIsUnique(ma: string): Promise<void> {
    const exists = await this.roleRepository.exists({
      where: { ma },
    });

    if (exists) {
      throw new ConflictException('Role code already exists');
    }
  }

  private async findPermissionsByIds(ids: string[]): Promise<Permission[]> {
    if (ids.length === 0) {
      return [];
    }

    const permissions = await this.permissionRepository.find({
      where: {
        id: In(ids),
      },
    });

    if (permissions.length !== ids.length) {
      throw new NotFoundException('One or more permissions were not found');
    }

    return permissions;
  }
}
