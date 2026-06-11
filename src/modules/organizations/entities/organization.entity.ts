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
import { User } from '../../users/entities/user.entity';

@Entity('co_quan_don_vi')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'ma', type: 'varchar', length: 50 })
  ma!: string;

  @Column({ name: 'ten', type: 'varchar', length: 255 })
  ten!: string;

  @Index()
  @Column({ name: 'loai', type: 'varchar', length: 100 })
  loai!: string;

  @Index()
  @Column({ name: 'cha_id', type: 'uuid', nullable: true })
  chaId!: string | null;

  @Index()
  @Column({ name: 'don_vi_hanh_chinh_id', type: 'uuid', nullable: true })
  donViHanhChinhId!: string | null;

  @Column({ name: 'dia_chi', type: 'varchar', length: 500, nullable: true })
  diaChi!: string | null;

  @Column({ name: 'dien_thoai', type: 'varchar', length: 50, nullable: true })
  dienThoai!: string | null;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  @Index()
  @Column({ name: 'dang_hoat_dong', type: 'boolean', default: true })
  dangHoatDong!: boolean;

  @Column({ name: 'tao_luc', type: 'timestamptz', default: () => 'now()' })
  taoLuc!: Date;

  @Column({ name: 'cap_nhat_luc', type: 'timestamptz', default: () => 'now()' })
  capNhatLuc!: Date;

  @ManyToOne(() => Organization, (organization) => organization.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'cha_id' })
  parent!: Organization | null;

  @OneToMany(() => Organization, (organization) => organization.parent)
  children!: Organization[];

  @ManyToOne(() => AdministrativeUnit, (unit) => unit.organizations, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'don_vi_hanh_chinh_id' })
  administrativeUnit!: AdministrativeUnit | null;

  @OneToMany(() => User, (user) => user.organization)
  users!: User[];
}
