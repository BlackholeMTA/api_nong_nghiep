import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../reports/entities/report.entity';
import { CreateReportingPeriodDto } from './dto/create-reporting-period.dto';
import { QueryReportingPeriodDto } from './dto/query-reporting-period.dto';
import { UpdateReportingPeriodDto } from './dto/update-reporting-period.dto';
import { ReportingPeriod } from './entities/reporting-period.entity';

@Injectable()
export class ReportingPeriodsService {
  constructor(
    @InjectRepository(ReportingPeriod)
    private readonly reportingPeriodRepository: Repository<ReportingPeriod>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  async findAll(query: QueryReportingPeriodDto): Promise<{
    items: ReportingPeriod[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Record<string, unknown> = {};

    if (query.nam) {
      where.nam = query.nam;
    }

    if (query.loaiKy) {
      where.loaiKy = query.loaiKy;
    }

    if (typeof query.daKhoa === 'boolean') {
      where.daKhoa = query.daKhoa;
    }

    const [items, total] = await this.reportingPeriodRepository.findAndCount({
      where,
      order: {
        nam: 'DESC',
        thuTuSapXep: 'ASC',
        ngayBatDau: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async findOne(id: string): Promise<ReportingPeriod> {
    const reportingPeriod = await this.reportingPeriodRepository.findOne({
      where: { id },
    });

    if (!reportingPeriod) {
      throw new NotFoundException('Reporting period not found');
    }

    return reportingPeriod;
  }

  async create(dto: CreateReportingPeriodDto): Promise<ReportingPeriod> {
    await this.ensureCodeIsUnique(dto.ma);
    this.validateDateRange(dto.ngayBatDau, dto.ngayKetThuc);

    const reportingPeriod = this.reportingPeriodRepository.create(dto);
    return this.reportingPeriodRepository.save(reportingPeriod);
  }

  async update(
    id: string,
    dto: UpdateReportingPeriodDto,
  ): Promise<ReportingPeriod> {
    const reportingPeriod = await this.findOne(id);

    if (dto.ma && dto.ma !== reportingPeriod.ma) {
      await this.ensureCodeIsUnique(dto.ma);
    }

    this.validateDateRange(
      dto.ngayBatDau ?? reportingPeriod.ngayBatDau,
      dto.ngayKetThuc ?? reportingPeriod.ngayKetThuc,
    );

    Object.assign(reportingPeriod, dto);
    reportingPeriod.capNhatLuc = new Date();
    return this.reportingPeriodRepository.save(reportingPeriod);
  }

  async lock(id: string): Promise<ReportingPeriod> {
    const reportingPeriod = await this.findOne(id);
    reportingPeriod.daKhoa = true;
    reportingPeriod.capNhatLuc = new Date();
    return this.reportingPeriodRepository.save(reportingPeriod);
  }

  async unlock(id: string): Promise<ReportingPeriod> {
    const reportingPeriod = await this.findOne(id);
    reportingPeriod.daKhoa = false;
    reportingPeriod.capNhatLuc = new Date();
    return this.reportingPeriodRepository.save(reportingPeriod);
  }

  async delete(id: string): Promise<ReportingPeriod> {
    const reportingPeriod = await this.findOne(id);
    const reportCount = await this.reportRepository.count({
      where: { kyBaoCaoId: id },
    });

    if (reportCount > 0) {
      throw new ConflictException('Reporting period has reports');
    }

    await this.reportingPeriodRepository.remove(reportingPeriod);
    return reportingPeriod;
  }

  private validateDateRange(ngayBatDau: string, ngayKetThuc: string): void {
    if (new Date(ngayBatDau) > new Date(ngayKetThuc)) {
      throw new BadRequestException('Start date must be before end date');
    }
  }

  private async ensureCodeIsUnique(ma: string): Promise<void> {
    const exists = await this.reportingPeriodRepository.exists({
      where: { ma },
    });

    if (exists) {
      throw new ConflictException('Reporting period code already exists');
    }
  }
}
