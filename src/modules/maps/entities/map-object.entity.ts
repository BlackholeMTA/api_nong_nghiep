import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MapLayer } from './map-layer.entity';

@Entity('doi_tuong_ban_do')
@Index('idx_doi_tuong_ban_do_nguon', ['bangNguon', 'banGhiNguonId'])
export class MapObject {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'lop_ban_do_id', type: 'uuid' })
  lopBanDoId!: string;

  @Column({ name: 'bang_nguon', type: 'varchar', length: 100, nullable: true })
  bangNguon!: string | null;

  @Column({ name: 'ban_ghi_nguon_id', type: 'uuid', nullable: true })
  banGhiNguonId!: string | null;

  @Column({ name: 'tieu_de', type: 'varchar', length: 255 })
  tieuDe!: string;

  @Column({ name: 'mo_ta', type: 'text', nullable: true })
  moTa!: string | null;

  @Column({
    name: 'du_lieu_cua_so_bat_len',
    type: 'jsonb',
    default: () => "'{}'::jsonb",
  })
  duLieuCuaSoBatLen!: Record<string, unknown>;

  @Index({ spatial: true })
  @Column({
    name: 'hinh_hoc',
    type: 'geometry',
    spatialFeatureType: 'Geometry',
    srid: 4326,
  })
  hinhHoc!: object;

  @Column({ name: 'vi_do', type: 'numeric', nullable: true })
  viDo!: string | null;

  @Column({ name: 'kinh_do', type: 'numeric', nullable: true })
  kinhDo!: string | null;

  @Index()
  @Column({ name: 'hien_thi', type: 'boolean', default: true })
  hienThi!: boolean;

  @Column({ name: 'tao_luc', type: 'timestamptz', default: () => 'now()' })
  taoLuc!: Date;

  @Column({ name: 'cap_nhat_luc', type: 'timestamptz', default: () => 'now()' })
  capNhatLuc!: Date;

  @ManyToOne(() => MapLayer, (mapLayer) => mapLayer.mapObjects, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'lop_ban_do_id' })
  mapLayer!: MapLayer;
}
