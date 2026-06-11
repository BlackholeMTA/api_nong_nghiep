import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdministrativeUnit } from '../administrative-units/entities/administrative-unit.entity';
import { ReportingPeriod } from '../reporting-periods/entities/reporting-period.entity';
import { CreateDashboardIndicatorDto } from './dto/create-dashboard-indicator.dto';
import { QueryDashboardIndicatorDto } from './dto/query-dashboard-indicator.dto';
import { QueryDashboardSummaryDto } from './dto/query-dashboard-summary.dto';
import { UpdateDashboardIndicatorDto } from './dto/update-dashboard-indicator.dto';
import { DashboardMetric } from './entities/dashboard-metric.entity';

export type DashboardSummary = {
  kyBaoCaoId: string;
  phanHe: string;
  reportingPeriod: ReportingPeriod;
  indicators: DashboardMetric[];
};

export type DashboardIndicatorResult = {
  items: DashboardMetric[];
  total: number;
  page: number;
  limit: number;
};

export type DashboardSummaryResult = {
  items: DashboardSummary[];
  total: number;
  page: number;
  limit: number;
};

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(DashboardMetric)
    private readonly dashboardMetricRepository: Repository<DashboardMetric>,
    @InjectRepository(ReportingPeriod)
    private readonly reportingPeriodRepository: Repository<ReportingPeriod>,
    @InjectRepository(AdministrativeUnit)
    private readonly administrativeUnitRepository: Repository<AdministrativeUnit>,
  ) {}

  async findIndicators(
    query: QueryDashboardIndicatorDto,
  ): Promise<DashboardIndicatorResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Record<string, unknown> = {};

    if (query.kyBaoCaoId) {
      where.kyBaoCaoId = query.kyBaoCaoId;
    }

    if (query.phanHe) {
      where.phanHe = query.phanHe;
    }

    if (query.donViHanhChinhId) {
      where.donViHanhChinhId = query.donViHanhChinhId;
    }

    const [items, total] = await this.dashboardMetricRepository.findAndCount({
      where,
      relations: {
        reportingPeriod: true,
        administrativeUnit: true,
      },
      order: {
        phanHe: 'ASC',
        maChiSo: 'ASC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async createIndicator(
    dto: CreateDashboardIndicatorDto,
  ): Promise<DashboardMetric> {
    await this.validateRelations(dto.kyBaoCaoId, dto.donViHanhChinhId);

    const indicator = this.dashboardMetricRepository.create({
      ...dto,
      giaTriChiSo: dto.giaTriChiSo ?? null,
      donViHanhChinhId: dto.donViHanhChinhId ?? null,
      tinhToanLuc: dto.tinhToanLuc ? new Date(dto.tinhToanLuc) : null,
    });

    return this.dashboardMetricRepository.save(indicator);
  }

  async updateIndicator(
    id: string,
    dto: UpdateDashboardIndicatorDto,
  ): Promise<DashboardMetric> {
    const indicator = await this.findOneIndicator(id);

    await this.validateRelations(dto.kyBaoCaoId, dto.donViHanhChinhId);

    Object.assign(indicator, {
      ...dto,
      giaTriChiSo:
        dto.giaTriChiSo === undefined ? indicator.giaTriChiSo : dto.giaTriChiSo,
      donViHanhChinhId:
        dto.donViHanhChinhId === undefined
          ? indicator.donViHanhChinhId
          : dto.donViHanhChinhId,
      tinhToanLuc:
        dto.tinhToanLuc === undefined
          ? indicator.tinhToanLuc
          : new Date(dto.tinhToanLuc),
    });

    return this.dashboardMetricRepository.save(indicator);
  }

  async deleteIndicator(id: string): Promise<DashboardMetric> {
    const indicator = await this.findOneIndicator(id);

    await this.dashboardMetricRepository.remove(indicator);
    return indicator;
  }

  async getSummary(
    query: QueryDashboardSummaryDto,
  ): Promise<DashboardSummaryResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const groupQb = this.dashboardMetricRepository
      .createQueryBuilder('metric')
      .select('metric.kyBaoCaoId', 'kyBaoCaoId')
      .addSelect('metric.phanHe', 'phanHe')
      .groupBy('metric.kyBaoCaoId')
      .addGroupBy('metric.phanHe')
      .orderBy('metric.kyBaoCaoId', 'ASC')
      .addOrderBy('metric.phanHe', 'ASC');

    if (query.kyBaoCaoId) {
      groupQb.andWhere('metric.kyBaoCaoId = :kyBaoCaoId', {
        kyBaoCaoId: query.kyBaoCaoId,
      });
    }

    if (query.phanHe) {
      groupQb.andWhere('metric.phanHe = :phanHe', {
        phanHe: query.phanHe,
      });
    }

    if (query.donViHanhChinhId) {
      groupQb.andWhere('metric.donViHanhChinhId = :donViHanhChinhId', {
        donViHanhChinhId: query.donViHanhChinhId,
      });
    }

    const allGroups = await groupQb.getRawMany<{
      kyBaoCaoId: string;
      phanHe: string;
    }>();
    const groups = allGroups.slice((page - 1) * limit, page * limit);

    if (groups.length === 0) {
      return { items: [], total: allGroups.length, page, limit };
    }

    const indicators = await this.dashboardMetricRepository.find({
      where: groups.map((group) => ({
        kyBaoCaoId: group.kyBaoCaoId,
        phanHe: group.phanHe,
        ...(query.donViHanhChinhId
          ? { donViHanhChinhId: query.donViHanhChinhId }
          : {}),
      })),
      relations: {
        reportingPeriod: true,
        administrativeUnit: true,
      },
      order: {
        phanHe: 'ASC',
        maChiSo: 'ASC',
      },
    });
    const summaryByKey = new Map<string, DashboardSummary>();

    for (const indicator of indicators) {
      const key = `${indicator.kyBaoCaoId}:${indicator.phanHe}`;
      const current = summaryByKey.get(key);

      if (current) {
        current.indicators.push(indicator);
        continue;
      }

      summaryByKey.set(key, {
        kyBaoCaoId: indicator.kyBaoCaoId,
        phanHe: indicator.phanHe,
        reportingPeriod: indicator.reportingPeriod,
        indicators: [indicator],
      });
    }

    return {
      items: groups
        .map((group) => summaryByKey.get(`${group.kyBaoCaoId}:${group.phanHe}`))
        .filter((summary): summary is DashboardSummary => Boolean(summary)),
      total: allGroups.length,
      page,
      limit,
    };
  }

  private async findOneIndicator(id: string): Promise<DashboardMetric> {
    const indicator = await this.dashboardMetricRepository.findOne({
      where: { id },
      relations: {
        reportingPeriod: true,
        administrativeUnit: true,
      },
    });

    if (!indicator) {
      throw new NotFoundException('Dashboard indicator not found');
    }

    return indicator;
  }

  private async validateRelations(
    kyBaoCaoId?: string,
    donViHanhChinhId?: string | null,
  ): Promise<void> {
    if (kyBaoCaoId) {
      const periodExists = await this.reportingPeriodRepository.exists({
        where: { id: kyBaoCaoId },
      });

      if (!periodExists) {
        throw new NotFoundException('Reporting period not found');
      }
    }

    if (donViHanhChinhId) {
      const unitExists = await this.administrativeUnitRepository.exists({
        where: { id: donViHanhChinhId },
      });

      if (!unitExists) {
        throw new NotFoundException('Administrative unit not found');
      }
    }
  }
}
