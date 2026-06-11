import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { WriteAuditLogDto } from './dto/write-audit-log.dto';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(query: QueryAuditLogDto): Promise<{
    items: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    this.validateDateRange(query.fromDate, query.toDate);

    const qb = this.auditLogRepository
      .createQueryBuilder('auditLog')
      .leftJoinAndSelect('auditLog.user', 'user')
      .orderBy('auditLog.taoLuc', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.nguoiDungId) {
      qb.andWhere('auditLog.nguoiDungId = :nguoiDungId', {
        nguoiDungId: query.nguoiDungId,
      });
    }

    if (query.hanhDong) {
      qb.andWhere('auditLog.hanhDong = :hanhDong', {
        hanhDong: query.hanhDong,
      });
    }

    if (query.bangNguon) {
      qb.andWhere('auditLog.bangNguon = :bangNguon', {
        bangNguon: query.bangNguon,
      });
    }

    if (query.banGhiNguonId) {
      qb.andWhere('auditLog.banGhiNguonId = :banGhiNguonId', {
        banGhiNguonId: query.banGhiNguonId,
      });
    }

    if (query.fromDate) {
      qb.andWhere('auditLog.taoLuc >= :fromDate', {
        fromDate: new Date(query.fromDate),
      });
    }

    if (query.toDate) {
      qb.andWhere('auditLog.taoLuc <= :toDate', {
        toDate: new Date(query.toDate),
      });
    }

    const [items, total] = await qb.getManyAndCount();

    return { items, total, page, limit };
  }

  async writeLog(dto: WriteAuditLogDto): Promise<AuditLog> {
    if (dto.nguoiDungId) {
      await this.ensureUserExists(dto.nguoiDungId);
    }

    const auditLog = this.auditLogRepository.create({
      nguoiDungId: dto.nguoiDungId ?? null,
      hanhDong: dto.hanhDong,
      bangNguon: dto.bangNguon,
      banGhiNguonId: dto.banGhiNguonId,
      duLieuCu: dto.duLieuCu ?? null,
      duLieuMoi: dto.duLieuMoi ?? null,
      diaChiIp: dto.diaChiIp ?? null,
      tacNhanNguoiDung: dto.tacNhanNguoiDung ?? null,
    });

    return this.auditLogRepository.save(auditLog);
  }

  async recordAction(dto: WriteAuditLogDto): Promise<AuditLog> {
    return this.writeLog(dto);
  }

  private async ensureUserExists(id: string): Promise<void> {
    const exists = await this.userRepository.exists({ where: { id } });

    if (!exists) {
      throw new NotFoundException('User not found');
    }
  }

  validateDateRange(fromDate?: string, toDate?: string): void {
    if (!fromDate || !toDate) {
      return;
    }

    if (new Date(fromDate).getTime() > new Date(toDate).getTime()) {
      throw new BadRequestException('fromDate must be before toDate');
    }
  }
}
