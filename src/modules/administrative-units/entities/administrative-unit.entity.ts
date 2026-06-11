import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AdministrativeUnitAlias } from './administrative-unit-alias.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { Report } from '../../reports/entities/report.entity';
import { DashboardMetric } from '../../dashboard/entities/dashboard-metric.entity';

@Entity('don_vi_hanh_chinh')
export class AdministrativeUnit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'ma', type: 'varchar', length: 50 })
  ma!: string;

  @Column({ name: 'ten', type: 'varchar', length: 255 })
  ten!: string;

  @Column({ name: 'ten_day_du', type: 'varchar', length: 500, nullable: true })
  tenDayDu!: string | null;

  @Index()
  @Column({ name: 'cap', type: 'varchar', length: 50 })
  cap!: string;

  @Index()
  @Column({ name: 'cha_id', type: 'uuid', nullable: true })
  chaId!: string | null;

  @Column({ name: 'la_du_lieu_cu', type: 'boolean', default: false })
  laDuLieuCu!: boolean;

  @Column({ name: 'hieu_luc_tu_ngay', type: 'date', nullable: true })
  hieuLucTuNgay!: string | null;

  @Column({ name: 'hieu_luc_den_ngay', type: 'date', nullable: true })
  hieuLucDenNgay!: string | null;

  @Index({ spatial: true })
  @Column({
    name: 'hinh_hoc',
    type: 'geometry',
    spatialFeatureType: 'MultiPolygon',
    srid: 4326,
    nullable: true,
  })
  hinhHoc!: object | null;

  @Column({ name: 'thu_tu_sap_xep', type: 'integer', default: 0 })
  thuTuSapXep!: number;

  @Index()
  @Column({ name: 'dang_hoat_dong', type: 'boolean', default: true })
  dangHoatDong!: boolean;

  @Column({ name: 'tao_luc', type: 'timestamptz', default: () => 'now()' })
  taoLuc!: Date;

  @Column({ name: 'cap_nhat_luc', type: 'timestamptz', default: () => 'now()' })
  capNhatLuc!: Date;

  @ManyToOne(() => AdministrativeUnit, (unit) => unit.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'cha_id' })
  parent!: AdministrativeUnit | null;

  @OneToMany(() => AdministrativeUnit, (unit) => unit.parent)
  children!: AdministrativeUnit[];

  @OneToMany(() => AdministrativeUnitAlias, (alias) => alias.administrativeUnit)
  aliases!: AdministrativeUnitAlias[];

  @OneToMany(
    () => Organization,
    (organization) => organization.administrativeUnit,
  )
  organizations!: Organization[];

  @OneToMany(() => User, (user) => user.administrativeUnit)
  users!: User[];

  @OneToMany(() => Report, (report) => report.administrativeUnit)
  reports!: Report[];

  @OneToMany(() => DashboardMetric, (metric) => metric.administrativeUnit)
  dashboardMetrics!: DashboardMetric[];
}
