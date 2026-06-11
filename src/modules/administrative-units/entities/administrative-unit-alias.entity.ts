import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AdministrativeUnit } from './administrative-unit.entity';

@Entity('bi_danh_don_vi_hanh_chinh')
export class AdministrativeUnitAlias {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'don_vi_hanh_chinh_id', type: 'uuid' })
  donViHanhChinhId!: string;

  @Index()
  @Column({ name: 'ten_bi_danh', type: 'varchar', length: 255 })
  tenBiDanh!: string;

  @Index()
  @Column({ name: 'loai_bi_danh', type: 'varchar', length: 100 })
  loaiBiDanh!: string;

  @Column({ name: 'tao_luc', type: 'timestamptz', default: () => 'now()' })
  taoLuc!: Date;

  @ManyToOne(() => AdministrativeUnit, (unit) => unit.aliases, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'don_vi_hanh_chinh_id' })
  administrativeUnit!: AdministrativeUnit;
}
