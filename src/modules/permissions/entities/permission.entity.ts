import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RolePermission } from '../../roles/entities/role-permission.entity';

@Entity('quyen_han')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'ma', type: 'varchar', length: 150 })
  ma!: string;

  @Index()
  @Column({ name: 'phan_he', type: 'varchar', length: 100 })
  phanHe!: string;

  @Index()
  @Column({ name: 'hanh_dong', type: 'varchar', length: 100 })
  hanhDong!: string;

  @Column({ name: 'ten', type: 'varchar', length: 255 })
  ten!: string;

  @Column({ name: 'tao_luc', type: 'timestamptz', default: () => 'now()' })
  taoLuc!: Date;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions!: RolePermission[];
}
