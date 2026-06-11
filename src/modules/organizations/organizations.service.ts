import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { AdministrativeUnit } from '../administrative-units/entities/administrative-unit.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { QueryOrganizationDto } from './dto/query-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Organization } from './entities/organization.entity';

export type OrganizationTreeNode = Organization & {
  children: OrganizationTreeNode[];
};

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(AdministrativeUnit)
    private readonly administrativeUnitRepository: Repository<AdministrativeUnit>,
  ) {}

  async findAll(query: QueryOrganizationDto): Promise<{
    items: Organization[];
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

    if (query.loai) {
      where.loai = query.loai;
    }

    if (query.chaId) {
      where.chaId = query.chaId;
    }

    if (query.donViHanhChinhId) {
      where.donViHanhChinhId = query.donViHanhChinhId;
    }

    if (typeof query.dangHoatDong === 'boolean') {
      where.dangHoatDong = query.dangHoatDong;
    }

    const [items, total] = await this.organizationRepository.findAndCount({
      where,
      order: {
        ten: 'ASC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async findTree(): Promise<OrganizationTreeNode[]> {
    const organizations = await this.organizationRepository.find({
      order: {
        ten: 'ASC',
      },
    });
    const nodeById = new Map<string, OrganizationTreeNode>();
    const roots: OrganizationTreeNode[] = [];

    for (const organization of organizations) {
      nodeById.set(organization.id, {
        ...organization,
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

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: {
        parent: true,
        administrativeUnit: true,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async create(dto: CreateOrganizationDto): Promise<Organization> {
    await this.ensureCodeIsUnique(dto.ma);
    await this.validateRelations(dto.chaId, dto.donViHanhChinhId);

    const organization = this.organizationRepository.create(dto);
    return this.organizationRepository.save(organization);
  }

  async update(id: string, dto: UpdateOrganizationDto): Promise<Organization> {
    const organization = await this.findOne(id);

    if (dto.ma && dto.ma !== organization.ma) {
      await this.ensureCodeIsUnique(dto.ma);
    }

    if (dto.chaId === id) {
      throw new ConflictException('Organization cannot be its own parent');
    }

    await this.validateRelations(dto.chaId, dto.donViHanhChinhId);

    Object.assign(organization, dto);
    return this.organizationRepository.save(organization);
  }

  async deactivate(id: string): Promise<Organization> {
    const organization = await this.findOne(id);

    organization.dangHoatDong = false;
    return this.organizationRepository.save(organization);
  }

  private async validateRelations(
    chaId?: string,
    donViHanhChinhId?: string,
  ): Promise<void> {
    if (chaId) {
      await this.ensureExists(chaId);
    }

    if (donViHanhChinhId) {
      await this.ensureAdministrativeUnitExists(donViHanhChinhId);
    }
  }

  private async ensureExists(id: string): Promise<void> {
    const exists = await this.organizationRepository.exists({
      where: { id },
    });

    if (!exists) {
      throw new NotFoundException('Parent organization not found');
    }
  }

  private async ensureAdministrativeUnitExists(id: string): Promise<void> {
    const exists = await this.administrativeUnitRepository.exists({
      where: { id },
    });

    if (!exists) {
      throw new NotFoundException('Administrative unit not found');
    }
  }

  private async ensureCodeIsUnique(ma: string): Promise<void> {
    const exists = await this.organizationRepository.exists({
      where: { ma },
    });

    if (exists) {
      throw new ConflictException('Organization code already exists');
    }
  }
}
