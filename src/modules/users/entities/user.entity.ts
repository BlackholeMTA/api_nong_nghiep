import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AdministrativeUnit } from '../../administrative-units/entities/administrative-unit.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { UserRole } from './user-role.entity';
import { Report } from '../../reports/entities/report.entity';
import { AuditLog } from '../../audit-logs/entities/audit-log.entity';

@Entity('nguoi_dung')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'ten_dang_nhap', type: 'varchar', length: 100 })
  tenDangNhap!: string;

  @Column({
    name: 'mat_khau_hash',
    type: 'varchar',
    length: 255,
    select: false,
  })
  matKhauHash!: string;

  @Column({ name: 'ten_day_du', type: 'varchar', length: 255 })
  tenDayDu!: string;

  @Index('uq_nguoi_dung_email', { unique: true, where: '"email" IS NOT NULL' })
  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  @Column({ name: 'dien_thoai', type: 'varchar', length: 50, nullable: true })
  dienThoai!: string | null;

  @Index()
  @Column({ name: 'co_quan_don_vi_id', type: 'uuid', nullable: true })
  coQuanDonViId!: string | null;

  @Index()
  @Column({ name: 'don_vi_hanh_chinh_id', type: 'uuid', nullable: true })
  donViHanhChinhId!: string | null;

  @Index()
  @Column({ name: 'dang_hoat_dong', type: 'boolean', default: true })
  dangHoatDong!: boolean;

  @Column({ name: 'dang_nhap_cuoi_luc', type: 'timestamptz', nullable: true })
  dangNhapCuoiLuc!: Date | null;

  @Column({ name: 'tao_luc', type: 'timestamptz', default: () => 'now()' })
  taoLuc!: Date;

  @Column({ name: 'cap_nhat_luc', type: 'timestamptz', default: () => 'now()' })
  capNhatLuc!: Date;

  @ManyToOne(() => Organization, (organization) => organization.users, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'co_quan_don_vi_id' })
  organization!: Organization | null;

  @ManyToOne(() => AdministrativeUnit, (unit) => unit.users, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'don_vi_hanh_chinh_id' })
  administrativeUnit!: AdministrativeUnit | null;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles!: UserRole[];

  @OneToMany(() => Report, (report) => report.submittedBy)
  submittedReports!: Report[];

  @OneToMany(() => Report, (report) => report.approvedBy)
  approvedReports!: Report[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
  auditLogs!: AuditLog[];
}
