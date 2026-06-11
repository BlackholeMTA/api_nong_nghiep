import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('nhat_ky_thao_tac')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'nguoi_dung_id', type: 'uuid', nullable: true })
  nguoiDungId!: string | null;

  @Index()
  @Column({ name: 'hanh_dong', type: 'varchar', length: 100 })
  hanhDong!: string;

  @Index()
  @Column({ name: 'bang_nguon', type: 'varchar', length: 100 })
  bangNguon!: string;

  @Index()
  @Column({ name: 'ban_ghi_nguon_id', type: 'uuid' })
  banGhiNguonId!: string;

  @Column({ name: 'du_lieu_cu', type: 'jsonb', nullable: true })
  duLieuCu!: Record<string, unknown> | null;

  @Column({ name: 'du_lieu_moi', type: 'jsonb', nullable: true })
  duLieuMoi!: Record<string, unknown> | null;

  @Column({ name: 'dia_chi_ip', type: 'varchar', length: 100, nullable: true })
  diaChiIp!: string | null;

  @Column({ name: 'tac_nhan_nguoi_dung', type: 'text', nullable: true })
  tacNhanNguoiDung!: string | null;

  @Column({ name: 'tao_luc', type: 'timestamptz', default: () => 'now()' })
  taoLuc!: Date;

  @ManyToOne(() => User, (user) => user.auditLogs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'nguoi_dung_id' })
  user!: User | null;
}
