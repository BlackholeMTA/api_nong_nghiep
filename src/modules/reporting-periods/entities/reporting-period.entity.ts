import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Report } from '../../reports/entities/report.entity';
import { DashboardMetric } from '../../dashboard/entities/dashboard-metric.entity';

@Entity('ky_bao_cao')
export class ReportingPeriod {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'ma', type: 'varchar', length: 50 })
  ma!: string;

  @Column({ name: 'ten', type: 'varchar', length: 255 })
  ten!: string;

  @Index()
  @Column({ name: 'nam', type: 'integer' })
  nam!: number;

  @Index()
  @Column({ name: 'loai_ky', type: 'varchar', length: 50 })
  loaiKy!: string;

  @Column({ name: 'so_ky', type: 'integer', nullable: true })
  soKy!: number | null;

  @Column({ name: 'ngay_bat_dau', type: 'date' })
  ngayBatDau!: string;

  @Column({ name: 'ngay_ket_thuc', type: 'date' })
  ngayKetThuc!: string;

  @Index()
  @Column({ name: 'da_khoa', type: 'boolean', default: false })
  daKhoa!: boolean;

  @Column({ name: 'thu_tu_sap_xep', type: 'integer', default: 0 })
  thuTuSapXep!: number;

  @Column({ name: 'tao_luc', type: 'timestamptz', default: () => 'now()' })
  taoLuc!: Date;

  @Column({ name: 'cap_nhat_luc', type: 'timestamptz', default: () => 'now()' })
  capNhatLuc!: Date;

  @OneToMany(() => Report, (report) => report.reportingPeriod)
  reports!: Report[];

  @OneToMany(() => DashboardMetric, (metric) => metric.reportingPeriod)
  dashboardMetrics!: DashboardMetric[];
}
