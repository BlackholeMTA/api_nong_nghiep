import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AdministrativeUnit } from '../../administrative-units/entities/administrative-unit.entity';
import { ReportingPeriod } from '../../reporting-periods/entities/reporting-period.entity';

@Entity('chi_so_tong_hop_bang_dieu_khien')
export class DashboardMetric {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'ky_bao_cao_id', type: 'uuid' })
  kyBaoCaoId!: string;

  @Index()
  @Column({ name: 'phan_he', type: 'varchar', length: 100 })
  phanHe!: string;

  @Index()
  @Column({ name: 'ma_chi_so', type: 'varchar', length: 150 })
  maChiSo!: string;

  @Column({ name: 'ten_chi_so', type: 'varchar', length: 255 })
  tenChiSo!: string;

  @Column({ name: 'gia_tri_chi_so', type: 'numeric', nullable: true })
  giaTriChiSo!: string | null;

  @Column({ name: 'don_vi_tinh', type: 'varchar', length: 100 })
  donViTinh!: string;

  @Index()
  @Column({ name: 'don_vi_hanh_chinh_id', type: 'uuid', nullable: true })
  donViHanhChinhId!: string | null;

  @Column({ name: 'tinh_toan_luc', type: 'timestamptz', nullable: true })
  tinhToanLuc!: Date | null;

  @ManyToOne(() => ReportingPeriod, (period) => period.dashboardMetrics, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ky_bao_cao_id' })
  reportingPeriod!: ReportingPeriod;

  @ManyToOne(() => AdministrativeUnit, (unit) => unit.dashboardMetrics, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'don_vi_hanh_chinh_id' })
  administrativeUnit!: AdministrativeUnit | null;
}
