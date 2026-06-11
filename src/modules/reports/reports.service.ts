import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdministrativeUnit } from '../administrative-units/entities/administrative-unit.entity';
import { ReportingPeriod } from '../reporting-periods/entities/reporting-period.entity';
import { User } from '../users/entities/user.entity';
import { ApproveReportDto } from './dto/approve-report.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { QueryReportDto } from './dto/query-report.dto';
import { RejectReportDto } from './dto/reject-report.dto';
import { SubmitReportDto } from './dto/submit-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Report } from './entities/report.entity';
import { ReportStatus } from './report-status.enum';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(ReportingPeriod)
    private readonly reportingPeriodRepository: Repository<ReportingPeriod>,
    @InjectRepository(AdministrativeUnit)
    private readonly administrativeUnitRepository: Repository<AdministrativeUnit>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(query: QueryReportDto): Promise<{
    items: Report[];
    total: number;
    page: number;
    limit: number;
  }> {
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

    if (query.trangThai) {
      where.trangThai = query.trangThai;
    }

    const [items, total] = await this.reportRepository.findAndCount({
      where,
      relations: {
        reportingPeriod: true,
        administrativeUnit: true,
        submittedBy: true,
        approvedBy: true,
      },
      order: {
        taoLuc: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async findOne(id: string): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: {
        reportingPeriod: true,
        administrativeUnit: true,
        submittedBy: true,
        approvedBy: true,
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async create(dto: CreateReportDto): Promise<Report> {
    const { lyDoThaoTacKhiKyDaKhoa, ...data } = dto;
    const reportingPeriod = await this.ensureReportingPeriodExists(
      dto.kyBaoCaoId,
    );
    this.ensurePeriodAllowsReportChange(
      reportingPeriod,
      lyDoThaoTacKhiKyDaKhoa,
    );
    await this.validateAdministrativeUnit(dto.donViHanhChinhId);

    const report = this.reportRepository.create({
      ...data,
      trangThai: data.trangThai ?? ReportStatus.Draft,
    });

    return this.reportRepository.save(report);
  }

  async update(id: string, dto: UpdateReportDto): Promise<Report> {
    const { lyDoSuaKhiKyDaKhoa, lyDoThaoTacKhiKyDaKhoa, ...data } = dto;
    const report = await this.findOne(id);
    const reason = lyDoSuaKhiKyDaKhoa ?? lyDoThaoTacKhiKyDaKhoa;

    this.ensurePeriodAllowsReportChange(report.reportingPeriod, reason);

    if (data.kyBaoCaoId && data.kyBaoCaoId !== report.kyBaoCaoId) {
      const targetPeriod = await this.ensureReportingPeriodExists(
        data.kyBaoCaoId,
      );
      this.ensurePeriodAllowsReportChange(targetPeriod, reason);
    }

    await this.validateAdministrativeUnit(data.donViHanhChinhId);

    Object.assign(report, data);
    report.capNhatLuc = new Date();
    return this.reportRepository.save(report);
  }

  async submit(id: string, dto: SubmitReportDto): Promise<Report> {
    const report = await this.findOne(id);
    this.ensurePeriodAllowsReportChange(
      report.reportingPeriod,
      dto.lyDoThaoTacKhiKyDaKhoa,
    );
    await this.ensureUserExists(dto.nguoiGuiId, 'Submitter not found');

    report.nguoiGuiId = dto.nguoiGuiId;
    report.guiLuc = new Date();
    report.trangThai = ReportStatus.Submitted;
    report.capNhatLuc = new Date();
    return this.reportRepository.save(report);
  }

  async approve(id: string, dto: ApproveReportDto): Promise<Report> {
    const report = await this.findOne(id);
    this.ensurePeriodAllowsReportChange(
      report.reportingPeriod,
      dto.lyDoThaoTacKhiKyDaKhoa,
    );
    await this.ensureUserExists(dto.nguoiDuyetId, 'Approver not found');

    report.nguoiDuyetId = dto.nguoiDuyetId;
    report.duyetLuc = new Date();
    report.trangThai = ReportStatus.Approved;
    report.yKien = dto.yKien ?? null;
    report.capNhatLuc = new Date();
    return this.reportRepository.save(report);
  }

  async reject(id: string, dto: RejectReportDto): Promise<Report> {
    const report = await this.findOne(id);
    this.ensurePeriodAllowsReportChange(
      report.reportingPeriod,
      dto.lyDoThaoTacKhiKyDaKhoa,
    );
    await this.ensureUserExists(dto.nguoiDuyetId, 'Approver not found');

    report.nguoiDuyetId = dto.nguoiDuyetId;
    report.duyetLuc = new Date();
    report.trangThai = ReportStatus.Rejected;
    report.yKien = dto.yKien;
    report.capNhatLuc = new Date();
    return this.reportRepository.save(report);
  }

  private async ensureReportingPeriodExists(
    id: string,
  ): Promise<ReportingPeriod> {
    const reportingPeriod = await this.reportingPeriodRepository.findOne({
      where: { id },
    });

    if (!reportingPeriod) {
      throw new NotFoundException('Reporting period not found');
    }

    return reportingPeriod;
  }

  private ensurePeriodAllowsReportChange(
    reportingPeriod: ReportingPeriod,
    reason?: string,
  ): void {
    if (reportingPeriod.daKhoa && !reason?.trim()) {
      throw new ConflictException(
        'Reporting period is locked; a clear reason is required to change reports',
      );
    }
  }

  private async validateAdministrativeUnit(id?: string): Promise<void> {
    if (!id) {
      return;
    }

    const exists = await this.administrativeUnitRepository.exists({
      where: { id },
    });

    if (!exists) {
      throw new NotFoundException('Administrative unit not found');
    }
  }

  private async ensureUserExists(id: string, message: string): Promise<void> {
    const exists = await this.userRepository.exists({
      where: { id },
    });

    if (!exists) {
      throw new NotFoundException(message);
    }
  }
}
