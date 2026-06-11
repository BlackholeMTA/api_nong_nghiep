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
import { User } from '../../users/entities/user.entity';
import { ReportStatus } from '../report-status.enum';

@Entity('bao_cao')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'ky_bao_cao_id', type: 'uuid' })
  kyBaoCaoId!: string;

  @Index()
  @Column({ name: 'phan_he', type: 'varchar', length: 100 })
  phanHe!: string;

  @Index()
  @Column({ name: 'don_vi_hanh_chinh_id', type: 'uuid', nullable: true })
  donViHanhChinhId!: string | null;

  @Index()
  @Column({ name: 'nguoi_gui_id', type: 'uuid', nullable: true })
  nguoiGuiId!: string | null;

  @Column({ name: 'gui_luc', type: 'timestamptz', nullable: true })
  guiLuc!: Date | null;

  @Index()
  @Column({ name: 'nguoi_duyet_id', type: 'uuid', nullable: true })
  nguoiDuyetId!: string | null;

  @Column({ name: 'duyet_luc', type: 'timestamptz', nullable: true })
  duyetLuc!: Date | null;

  @Index()
  @Column({ name: 'trang_thai', type: 'varchar', length: 50 })
  trangThai!: ReportStatus;

  @Column({ name: 'y_kien', type: 'text', nullable: true })
  yKien!: string | null;

  @Column({ name: 'tao_luc', type: 'timestamptz', default: () => 'now()' })
  taoLuc!: Date;

  @Column({ name: 'cap_nhat_luc', type: 'timestamptz', default: () => 'now()' })
  capNhatLuc!: Date;

  @ManyToOne(() => ReportingPeriod, (period) => period.reports, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'ky_bao_cao_id' })
  reportingPeriod!: ReportingPeriod;

  @ManyToOne(() => AdministrativeUnit, (unit) => unit.reports, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'don_vi_hanh_chinh_id' })
  administrativeUnit!: AdministrativeUnit | null;

  @ManyToOne(() => User, (user) => user.submittedReports, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'nguoi_gui_id' })
  submittedBy!: User | null;

  @ManyToOne(() => User, (user) => user.approvedReports, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'nguoi_duyet_id' })
  approvedBy!: User | null;
}
