import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { CreateAdministrativeUnitAliasDto } from './dto/create-administrative-unit-alias.dto';
import { CreateAdministrativeUnitDto } from './dto/create-administrative-unit.dto';
import { QueryAdministrativeUnitDto } from './dto/query-administrative-unit.dto';
import { UpdateAdministrativeUnitDto } from './dto/update-administrative-unit.dto';
import { AdministrativeUnitAlias } from './entities/administrative-unit-alias.entity';
import { AdministrativeUnit } from './entities/administrative-unit.entity';

export type AdministrativeUnitTreeNode = AdministrativeUnit & {
  children: AdministrativeUnitTreeNode[];
};

@Injectable()
export class AdministrativeUnitsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(AdministrativeUnit)
    private readonly administrativeUnitRepository: Repository<AdministrativeUnit>,
    @InjectRepository(AdministrativeUnitAlias)
    private readonly administrativeUnitAliasRepository: Repository<AdministrativeUnitAlias>,
  ) {}

  async findAll(query: QueryAdministrativeUnitDto): Promise<{
    items: AdministrativeUnit[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Record<string, unknown> = {};

    if (query.ma) {
      where.ma = ILike(`%${query.ma}%`);
    }

    if (query.ten) {
      where.ten = ILike(`%${query.ten}%`);
    }

    if (query.cap) {
      where.cap = query.cap;
    }

    if (query.chaId) {
      where.chaId = query.chaId;
    }

    if (typeof query.dangHoatDong === 'boolean') {
      where.dangHoatDong = query.dangHoatDong;
    }

    const [items, total] = await this.administrativeUnitRepository.findAndCount(
      {
        where,
        order: {
          thuTuSapXep: 'ASC',
          ten: 'ASC',
        },
        skip: (page - 1) * limit,
        take: limit,
      },
    );

    return { items, total, page, limit };
  }

  async findTree(): Promise<AdministrativeUnitTreeNode[]> {
    const units = await this.administrativeUnitRepository.find({
      order: {
        thuTuSapXep: 'ASC',
        ten: 'ASC',
      },
    });
    const nodeById = new Map<string, AdministrativeUnitTreeNode>();
    const roots: AdministrativeUnitTreeNode[] = [];

    for (const unit of units) {
      nodeById.set(unit.id, {
        ...unit,
        children: [],
      });
    }

    for (const node of nodeById.values()) {
      if (node.chaId && nodeById.has(node.chaId)) {
        nodeById.get(node.chaId)?.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async findOne(id: string): Promise<AdministrativeUnit> {
    const unit = await this.administrativeUnitRepository.findOne({
      where: { id },
      relations: {
        parent: true,
        aliases: true,
      },
    });

    if (!unit) {
      throw new NotFoundException('Administrative unit not found');
    }

    return unit;
  }

  async create(dto: CreateAdministrativeUnitDto): Promise<AdministrativeUnit> {
    await this.ensureCodeIsUnique(dto.ma);

    if (dto.chaId) {
      await this.ensureExists(dto.chaId);
    }

    const { hinhHoc, ...data } = dto;
    const unit = await this.administrativeUnitRepository.save(
      this.administrativeUnitRepository.create(data),
    );

    if (hinhHoc) {
      await this.updateGeometry(unit.id, hinhHoc);
    }

    return this.findOne(unit.id);
  }

  async update(
    id: string,
    dto: UpdateAdministrativeUnitDto,
  ): Promise<AdministrativeUnit> {
    const unit = await this.findOne(id);

    if (dto.ma && dto.ma !== unit.ma) {
      await this.ensureCodeIsUnique(dto.ma);
    }

    if (dto.chaId) {
      if (dto.chaId === id) {
        throw new ConflictException(
          'Administrative unit cannot be its own parent',
        );
      }

      await this.ensureExists(dto.chaId);
    }

    const { hinhHoc, ...data } = dto;

    Object.assign(unit, data);
    const updatedUnit = await this.administrativeUnitRepository.save(unit);

    if (hinhHoc) {
      await this.updateGeometry(id, hinhHoc);
      return this.findOne(id);
    }

    return updatedUnit;
  }

  async deactivate(id: string): Promise<AdministrativeUnit> {
    const unit = await this.findOne(id);

    unit.dangHoatDong = false;
    return this.administrativeUnitRepository.save(unit);
  }

  async findAliases(id: string): Promise<AdministrativeUnitAlias[]> {
    await this.ensureExists(id);

    return this.administrativeUnitAliasRepository.find({
      where: {
        donViHanhChinhId: id,
      },
      order: {
        tenBiDanh: 'ASC',
      },
    });
  }

  async createAlias(
    id: string,
    dto: CreateAdministrativeUnitAliasDto,
  ): Promise<AdministrativeUnitAlias> {
    await this.ensureExists(id);

    const alias = this.administrativeUnitAliasRepository.create({
      ...dto,
      donViHanhChinhId: id,
    });

    return this.administrativeUnitAliasRepository.save(alias);
  }

  private async ensureExists(id: string): Promise<void> {
    const exists = await this.administrativeUnitRepository.exists({
      where: { id },
    });

    if (!exists) {
      throw new NotFoundException('Administrative unit not found');
    }
  }

  private async ensureCodeIsUnique(ma: string): Promise<void> {
    const exists = await this.administrativeUnitRepository.exists({
      where: { ma },
    });

    if (exists) {
      throw new ConflictException('Administrative unit code already exists');
    }
  }

  private async updateGeometry(
    id: string,
    geometry: Record<string, unknown>,
  ): Promise<void> {
    if (!geometry.type || typeof geometry.type !== 'string') {
      throw new BadRequestException('GeoJSON geometry.type is required');
    }

    if (!['Polygon', 'MultiPolygon'].includes(geometry.type)) {
      throw new BadRequestException(
        'Administrative unit geometry must be Polygon or MultiPolygon',
      );
    }

    await this.dataSource.query(
      `
        UPDATE don_vi_hanh_chinh
        SET
          hinh_hoc = ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)),
          cap_nhat_luc = now()
        WHERE id = $2
      `,
      [JSON.stringify(geometry), id],
    );
  }
}
