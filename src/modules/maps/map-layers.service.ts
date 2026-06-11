import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMapLayerDto } from './dto/create-map-layer.dto';
import { QueryMapLayerDto } from './dto/query-map-layer.dto';
import { UpdateMapLayerDto } from './dto/update-map-layer.dto';
import { MapLayer } from './entities/map-layer.entity';

@Injectable()
export class MapLayersService {
  constructor(
    @InjectRepository(MapLayer)
    private readonly mapLayerRepository: Repository<MapLayer>,
  ) {}

  async findAll(query: QueryMapLayerDto): Promise<{
    items: MapLayer[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const where: Record<string, unknown> = {};

    if (query.phanHe) {
      where.phanHe = query.phanHe;
    }

    if (query.loaiHinhHoc) {
      where.loaiHinhHoc = query.loaiHinhHoc;
    }

    if (typeof query.dangHoatDong === 'boolean') {
      where.dangHoatDong = query.dangHoatDong;
    }

    if (typeof query.macDinhHienThi === 'boolean') {
      where.macDinhHienThi = query.macDinhHienThi;
    }

    const [items, total] = await this.mapLayerRepository.findAndCount({
      where,
      order: {
        thuTuSapXep: 'ASC',
        chiSoZ: 'ASC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async findOne(id: string): Promise<MapLayer> {
    const mapLayer = await this.mapLayerRepository.findOne({ where: { id } });

    if (!mapLayer) {
      throw new NotFoundException('Map layer not found');
    }

    return mapLayer;
  }

  async create(dto: CreateMapLayerDto): Promise<MapLayer> {
    await this.ensureCodeIsUnique(dto.ma);

    const mapLayer = this.mapLayerRepository.create(dto);
    return this.mapLayerRepository.save(mapLayer);
  }

  async update(id: string, dto: UpdateMapLayerDto): Promise<MapLayer> {
    const mapLayer = await this.findOne(id);

    if (dto.ma && dto.ma !== mapLayer.ma) {
      await this.ensureCodeIsUnique(dto.ma);
    }

    Object.assign(mapLayer, dto);
    mapLayer.capNhatLuc = new Date();
    return this.mapLayerRepository.save(mapLayer);
  }

  async deactivate(id: string): Promise<MapLayer> {
    const mapLayer = await this.findOne(id);

    mapLayer.dangHoatDong = false;
    mapLayer.capNhatLuc = new Date();
    return this.mapLayerRepository.save(mapLayer);
  }

  private async ensureCodeIsUnique(ma: string): Promise<void> {
    const exists = await this.mapLayerRepository.exists({ where: { ma } });

    if (exists) {
      throw new ConflictException('Map layer code already exists');
    }
  }
}
