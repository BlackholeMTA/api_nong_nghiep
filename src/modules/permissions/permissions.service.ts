import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission } from '../roles/entities/role-permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { QueryPermissionDto } from './dto/query-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async findAll(query: QueryPermissionDto): Promise<{
    items: Permission[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Record<string, unknown> = {};

    if (query.phanHe) {
      where.phanHe = query.phanHe;
    }

    if (query.hanhDong) {
      where.hanhDong = query.hanhDong;
    }

    const [items, total] = await this.permissionRepository.findAndCount({
      where,
      order: {
        phanHe: 'ASC',
        hanhDong: 'ASC',
        ma: 'ASC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async create(dto: CreatePermissionDto): Promise<Permission> {
    await this.ensureCodeIsUnique(dto.ma);

    return this.permissionRepository.save(
      this.permissionRepository.create(dto),
    );
  }

  async update(id: string, dto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);

    if (dto.ma && dto.ma !== permission.ma) {
      await this.ensureCodeIsUnique(dto.ma);
    }

    Object.assign(permission, dto);
    return this.permissionRepository.save(permission);
  }

  async delete(id: string): Promise<Permission> {
    const permission = await this.findOne(id);
    const assigned = await this.rolePermissionRepository.exists({
      where: { quyenHanId: id },
    });

    if (assigned) {
      throw new ConflictException(
        'Permission is assigned to one or more roles',
      );
    }

    await this.permissionRepository.delete(id);
    return permission;
  }

  private async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  private async ensureCodeIsUnique(ma: string): Promise<void> {
    const exists = await this.permissionRepository.exists({
      where: { ma },
    });

    if (exists) {
      throw new ConflictException('Permission code already exists');
    }
  }
}
