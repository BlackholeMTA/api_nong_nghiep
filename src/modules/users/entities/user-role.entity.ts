import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { User } from './user.entity';

@Entity('nguoi_dung_vai_tro')
export class UserRole {
  @PrimaryColumn({ name: 'nguoi_dung_id', type: 'uuid' })
  nguoiDungId!: string;

  @Index()
  @PrimaryColumn({ name: 'vai_tro_id', type: 'uuid' })
  vaiTroId!: string;

  @Column({ name: 'tao_luc', type: 'timestamptz', default: () => 'now()' })
  taoLuc!: Date;

  @ManyToOne(() => User, (user) => user.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nguoi_dung_id' })
  user!: User;

  @ManyToOne(() => Role, (role) => role.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vai_tro_id' })
  role!: Role;
}
