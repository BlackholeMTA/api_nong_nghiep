import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from '../../users/entities/user-role.entity';
import { RolePermission } from './role-permission.entity';

@Entity('vai_tro')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'ma', type: 'varchar', length: 100 })
  ma!: string;

  @Column({ name: 'ten', type: 'varchar', length: 255 })
  ten!: string;

  @Column({ name: 'mo_ta', type: 'text', nullable: true })
  moTa!: string | null;

  @Index()
  @Column({ name: 'dang_hoat_dong', type: 'boolean', default: true })
  dangHoatDong!: boolean;

  @Column({ name: 'tao_luc', type: 'timestamptz', default: () => 'now()' })
  taoLuc!: Date;

  @Column({ name: 'cap_nhat_luc', type: 'timestamptz', default: () => 'now()' })
  capNhatLuc!: Date;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles!: UserRole[];

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions!: RolePermission[];
}
