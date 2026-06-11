import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Permission } from '../../permissions/entities/permission.entity';
import { Role } from './role.entity';

@Entity('vai_tro_quyen_han')
export class RolePermission {
  @PrimaryColumn({ name: 'vai_tro_id', type: 'uuid' })
  vaiTroId!: string;

  @Index()
  @PrimaryColumn({ name: 'quyen_han_id', type: 'uuid' })
  quyenHanId!: string;

  @Column({ name: 'tao_luc', type: 'timestamptz', default: () => 'now()' })
  taoLuc!: Date;

  @ManyToOne(() => Role, (role) => role.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vai_tro_id' })
  role!: Role;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'quyen_han_id' })
  permission!: Permission;
}
