import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MapObject } from './map-object.entity';

@Entity('lop_ban_do')
export class MapLayer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'ma', type: 'varchar', length: 100 })
  ma!: string;

  @Column({ name: 'ten', type: 'varchar', length: 255 })
  ten!: string;

  @Index()
  @Column({ name: 'phan_he', type: 'varchar', length: 100 })
  phanHe!: string;

  @Index()
  @Column({ name: 'loai_hinh_hoc', type: 'varchar', length: 50 })
  loaiHinhHoc!: string;

  @Column({
    name: 'duong_dan_bieu_tuong',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  duongDanBieuTuong!: string | null;

  @Column({ name: 'mau_sac', type: 'varchar', length: 50, nullable: true })
  mauSac!: string | null;

  @Column({ name: 'do_mo', type: 'numeric', nullable: true })
  doMo!: string | null;

  @Column({ name: 'chi_so_z', type: 'integer', default: 0 })
  chiSoZ!: number;

  @Column({ name: 'mac_dinh_hien_thi', type: 'boolean', default: true })
  macDinhHienThi!: boolean;

  @Index()
  @Column({ name: 'dang_hoat_dong', type: 'boolean', default: true })
  dangHoatDong!: boolean;

  @Column({ name: 'thu_tu_sap_xep', type: 'integer', default: 0 })
  thuTuSapXep!: number;

  @Column({ name: 'tao_luc', type: 'timestamptz', default: () => 'now()' })
  taoLuc!: Date;

  @Column({ name: 'cap_nhat_luc', type: 'timestamptz', default: () => 'now()' })
  capNhatLuc!: Date;

  @OneToMany(() => MapObject, (mapObject) => mapObject.mapLayer)
  mapObjects!: MapObject[];
}
