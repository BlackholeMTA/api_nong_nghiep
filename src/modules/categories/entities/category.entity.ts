import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('danh_muc')
@Unique('uq_danh_muc_ma_nhom_ma', ['maNhom', 'ma'])
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'ma_nhom', type: 'varchar', length: 100 })
  maNhom!: string;

  @Column({ name: 'ma', type: 'varchar', length: 100 })
  ma!: string;

  @Column({ name: 'ten', type: 'varchar', length: 255 })
  ten!: string;

  @Column({ name: 'mo_ta', type: 'text', nullable: true })
  moTa!: string | null;

  @Index()
  @Column({ name: 'cha_id', type: 'uuid', nullable: true })
  chaId!: string | null;

  @Column({ name: 'thu_tu_sap_xep', type: 'integer', default: 0 })
  thuTuSapXep!: number;

  @Index()
  @Column({ name: 'dang_hoat_dong', type: 'boolean', default: true })
  dangHoatDong!: boolean;

  @Column({ name: 'tao_luc', type: 'timestamptz', default: () => 'now()' })
  taoLuc!: Date;

  @Column({ name: 'cap_nhat_luc', type: 'timestamptz', default: () => 'now()' })
  capNhatLuc!: Date;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'cha_id' })
  parent!: Category | null;

  @OneToMany(() => Category, (category) => category.parent)
  children!: Category[];
}
