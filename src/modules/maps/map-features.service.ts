import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  CreateMapFeatureDto,
  GeoJsonGeometry,
  UpdateMapFeatureDto,
  UpdateMapFeaturePropertiesDto,
} from './dto/map-feature.dto';
import { QueryMapFeatureDto } from './dto/query-map-feature.dto';
import { MapLayer } from './entities/map-layer.entity';
import { MapObject } from './entities/map-object.entity';

export type GeoJsonFeature = {
  type: 'Feature';
  id: string;
  geometry: GeoJsonGeometry;
  properties: Record<string, unknown>;
};

export type GeoJsonFeatureCollection = {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
};

export type GeoJsonFeatureCollectionResult = {
  collection: GeoJsonFeatureCollection;
  total: number;
  page: number;
  limit: number;
};

type Bbox = [number, number, number, number];
const MAX_BBOX_AREA_DEGREES = 4;

type MapFeatureRow = {
  id: string;
  lopBanDoId: string;
  bangNguon: string | null;
  banGhiNguonId: string | null;
  tieuDe: string;
  moTa: string | null;
  duLieuCuaSoBatLen: Record<string, unknown>;
  geometry: string | GeoJsonGeometry;
  viDo: string | null;
  kinhDo: string | null;
  hienThi: boolean;
  taoLuc: Date;
  capNhatLuc: Date;
};

@Injectable()
export class MapFeaturesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(MapObject)
    private readonly mapObjectRepository: Repository<MapObject>,
    @InjectRepository(MapLayer)
    private readonly mapLayerRepository: Repository<MapLayer>,
  ) {}

  async findAll(
    query: QueryMapFeatureDto,
  ): Promise<GeoJsonFeatureCollectionResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 500;
    const qb = this.mapObjectRepository
      .createQueryBuilder('mapObject')
      .select([
        '"mapObject"."id" AS "id"',
        '"mapObject"."lop_ban_do_id" AS "lopBanDoId"',
        '"mapObject"."bang_nguon" AS "bangNguon"',
        '"mapObject"."ban_ghi_nguon_id" AS "banGhiNguonId"',
        '"mapObject"."tieu_de" AS "tieuDe"',
        '"mapObject"."mo_ta" AS "moTa"',
        '"mapObject"."du_lieu_cua_so_bat_len" AS "duLieuCuaSoBatLen"',
        'ST_AsGeoJSON("mapObject"."hinh_hoc") AS "geometry"',
        '"mapObject"."vi_do" AS "viDo"',
        '"mapObject"."kinh_do" AS "kinhDo"',
        '"mapObject"."hien_thi" AS "hienThi"',
        '"mapObject"."tao_luc" AS "taoLuc"',
        '"mapObject"."cap_nhat_luc" AS "capNhatLuc"',
      ]);

    if (query.lopBanDoId) {
      qb.andWhere('"mapObject"."lop_ban_do_id" = :lopBanDoId', {
        lopBanDoId: query.lopBanDoId,
      });
    }

    qb.andWhere('"mapObject"."hien_thi" = :hienThi', {
      hienThi: query.hienThi ?? true,
    });

    if (query.bbox) {
      const [minLng, minLat, maxLng, maxLat] = this.parseBbox(query.bbox);
      qb.andWhere(
        `ST_Intersects(
          "mapObject"."hinh_hoc",
          ST_MakeEnvelope(:minLng, :minLat, :maxLng, :maxLat, 4326)
        )`,
        { minLng, minLat, maxLng, maxLat },
      );
    }

    const total = await qb.getCount();
    const rows = await qb
      .orderBy('"mapObject"."id"', 'ASC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany<MapFeatureRow>();

    return {
      collection: {
        type: 'FeatureCollection',
        features: rows.map((row) => this.toFeature(row)),
      },
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<GeoJsonFeature> {
    return this.toFeature(await this.findRawById(id));
  }

  async create(dto: CreateMapFeatureDto): Promise<GeoJsonFeature> {
    this.validateGeometry(dto.geometry);
    this.validateCreateProperties(dto.properties);
    await this.ensureMapLayerExists(dto.properties.lopBanDoId);

    const properties = dto.properties;
    const rows = await this.queryFeatureRows(
      `
        INSERT INTO doi_tuong_ban_do (
          lop_ban_do_id,
          bang_nguon,
          ban_ghi_nguon_id,
          tieu_de,
          mo_ta,
          du_lieu_cua_so_bat_len,
          hinh_hoc,
          vi_do,
          kinh_do,
          hien_thi
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6::jsonb,
          ST_SetSRID(ST_GeomFromGeoJSON($7), 4326),
          $8,
          $9,
          $10
        )
        RETURNING
          id,
          lop_ban_do_id AS "lopBanDoId",
          bang_nguon AS "bangNguon",
          ban_ghi_nguon_id AS "banGhiNguonId",
          tieu_de AS "tieuDe",
          mo_ta AS "moTa",
          du_lieu_cua_so_bat_len AS "duLieuCuaSoBatLen",
          ST_AsGeoJSON(hinh_hoc) AS "geometry",
          vi_do AS "viDo",
          kinh_do AS "kinhDo",
          hien_thi AS "hienThi",
          tao_luc AS "taoLuc",
          cap_nhat_luc AS "capNhatLuc"
      `,
      [
        properties.lopBanDoId,
        properties.bangNguon ?? null,
        properties.banGhiNguonId ?? null,
        properties.tieuDe,
        properties.moTa ?? null,
        JSON.stringify(properties),
        JSON.stringify(dto.geometry),
        properties.viDo ?? null,
        properties.kinhDo ?? null,
        properties.hienThi ?? true,
      ],
    );

    return this.toFeature(rows[0]);
  }

  async update(id: string, dto: UpdateMapFeatureDto): Promise<GeoJsonFeature> {
    const current = await this.findRawById(id);
    this.validateUpdateProperties(dto.properties);
    const properties = this.mergeProperties(
      current.duLieuCuaSoBatLen,
      dto.properties,
    );

    if (properties.lopBanDoId) {
      await this.ensureMapLayerExists(properties.lopBanDoId);
    }

    if (dto.geometry) {
      this.validateGeometry(dto.geometry);
    }

    const geometrySet = dto.geometry
      ? 'hinh_hoc = ST_SetSRID(ST_GeomFromGeoJSON($11), 4326),'
      : '';
    const parameters: unknown[] = [
      properties.lopBanDoId ?? current.lopBanDoId,
      properties.bangNguon ?? current.bangNguon,
      properties.banGhiNguonId ?? current.banGhiNguonId,
      properties.tieuDe ?? current.tieuDe,
      properties.moTa ?? current.moTa,
      JSON.stringify(properties),
      properties.viDo ?? current.viDo,
      properties.kinhDo ?? current.kinhDo,
      properties.hienThi ?? current.hienThi,
      id,
    ];

    if (dto.geometry) {
      parameters.push(JSON.stringify(dto.geometry));
    }

    const rows = await this.queryFeatureRows(
      `
        UPDATE doi_tuong_ban_do
        SET
          lop_ban_do_id = $1,
          bang_nguon = $2,
          ban_ghi_nguon_id = $3,
          tieu_de = $4,
          mo_ta = $5,
          du_lieu_cua_so_bat_len = $6::jsonb,
          vi_do = $7,
          kinh_do = $8,
          hien_thi = $9,
          ${geometrySet}
          cap_nhat_luc = now()
        WHERE id = $10
        RETURNING
          id,
          lop_ban_do_id AS "lopBanDoId",
          bang_nguon AS "bangNguon",
          ban_ghi_nguon_id AS "banGhiNguonId",
          tieu_de AS "tieuDe",
          mo_ta AS "moTa",
          du_lieu_cua_so_bat_len AS "duLieuCuaSoBatLen",
          ST_AsGeoJSON(hinh_hoc) AS "geometry",
          vi_do AS "viDo",
          kinh_do AS "kinhDo",
          hien_thi AS "hienThi",
          tao_luc AS "taoLuc",
          cap_nhat_luc AS "capNhatLuc"
      `,
      parameters,
    );

    return this.toFeature(rows[0]);
  }

  async hide(id: string): Promise<GeoJsonFeature> {
    await this.findRawById(id);

    const rows = await this.queryFeatureRows(
      `
        UPDATE doi_tuong_ban_do
        SET hien_thi = false, cap_nhat_luc = now()
        WHERE id = $1
        RETURNING
          id,
          lop_ban_do_id AS "lopBanDoId",
          bang_nguon AS "bangNguon",
          ban_ghi_nguon_id AS "banGhiNguonId",
          tieu_de AS "tieuDe",
          mo_ta AS "moTa",
          du_lieu_cua_so_bat_len AS "duLieuCuaSoBatLen",
          ST_AsGeoJSON(hinh_hoc) AS "geometry",
          vi_do AS "viDo",
          kinh_do AS "kinhDo",
          hien_thi AS "hienThi",
          tao_luc AS "taoLuc",
          cap_nhat_luc AS "capNhatLuc"
      `,
      [id],
    );

    return this.toFeature(rows[0]);
  }

  private async findRawById(id: string): Promise<MapFeatureRow> {
    const rows = await this.queryFeatureRows(
      `
        SELECT
          id,
          lop_ban_do_id AS "lopBanDoId",
          bang_nguon AS "bangNguon",
          ban_ghi_nguon_id AS "banGhiNguonId",
          tieu_de AS "tieuDe",
          mo_ta AS "moTa",
          du_lieu_cua_so_bat_len AS "duLieuCuaSoBatLen",
          ST_AsGeoJSON(hinh_hoc) AS "geometry",
          vi_do AS "viDo",
          kinh_do AS "kinhDo",
          hien_thi AS "hienThi",
          tao_luc AS "taoLuc",
          cap_nhat_luc AS "capNhatLuc"
        FROM doi_tuong_ban_do
        WHERE id = $1
      `,
      [id],
    );

    if (!rows[0]) {
      throw new NotFoundException('Map feature not found');
    }

    return rows[0];
  }

  private async queryFeatureRows(
    sql: string,
    parameters: unknown[],
  ): Promise<MapFeatureRow[]> {
    try {
      return await this.dataSource.query<MapFeatureRow[]>(sql, parameters);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  private async ensureMapLayerExists(id: string): Promise<void> {
    const exists = await this.mapLayerRepository.exists({ where: { id } });

    if (!exists) {
      throw new NotFoundException('Map layer not found');
    }
  }

  private parseBbox(value: string): Bbox {
    const parts = value.split(',').map((part) => Number(part.trim()));

    if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
      throw new BadRequestException(
        'bbox must use format minLng,minLat,maxLng,maxLat',
      );
    }

    const [minLng, minLat, maxLng, maxLat] = parts;

    if (minLng >= maxLng || minLat >= maxLat) {
      throw new BadRequestException(
        'bbox minLng/minLat must be less than maxLng/maxLat',
      );
    }

    if ((maxLng - minLng) * (maxLat - minLat) > MAX_BBOX_AREA_DEGREES) {
      throw new BadRequestException('bbox is too large');
    }

    return [minLng, minLat, maxLng, maxLat];
  }

  private validateGeometry(geometry: GeoJsonGeometry): void {
    if (!geometry.type || typeof geometry.type !== 'string') {
      throw new BadRequestException('GeoJSON geometry.type is required');
    }

    const type = geometry.type;
    const geometryTypes = [
      'Point',
      'MultiPoint',
      'LineString',
      'MultiLineString',
      'Polygon',
      'MultiPolygon',
      'GeometryCollection',
    ];

    if (!geometryTypes.includes(type)) {
      throw new BadRequestException('Unsupported GeoJSON geometry.type');
    }

    if (type === 'GeometryCollection') {
      if (!Array.isArray(geometry.geometries)) {
        throw new BadRequestException(
          'GeoJSON GeometryCollection.geometries is required',
        );
      }

      for (const childGeometry of geometry.geometries) {
        this.validateGeometry(childGeometry as GeoJsonGeometry);
      }

      return;
    }

    if (!Array.isArray(geometry.coordinates)) {
      throw new BadRequestException('GeoJSON geometry.coordinates is required');
    }
  }

  private validateCreateProperties(
    properties: Record<string, unknown>,
  ): asserts properties is {
    lopBanDoId: string;
    tieuDe: string;
    [key: string]: unknown;
  } {
    if (
      typeof properties.lopBanDoId !== 'string' ||
      !this.isUuid(properties.lopBanDoId)
    ) {
      throw new BadRequestException(
        'Feature properties.lopBanDoId must be a UUID',
      );
    }

    if (typeof properties.tieuDe !== 'string' || !properties.tieuDe.trim()) {
      throw new BadRequestException('Feature properties.tieuDe is required');
    }

    this.validateOptionalFeatureProperties(properties);
  }

  private validateUpdateProperties(properties?: Record<string, unknown>): void {
    if (!properties) {
      return;
    }

    if (
      properties.lopBanDoId !== undefined &&
      (typeof properties.lopBanDoId !== 'string' ||
        !this.isUuid(properties.lopBanDoId))
    ) {
      throw new BadRequestException(
        'Feature properties.lopBanDoId must be a UUID',
      );
    }

    if (
      properties.tieuDe !== undefined &&
      (typeof properties.tieuDe !== 'string' || !properties.tieuDe.trim())
    ) {
      throw new BadRequestException(
        'Feature properties.tieuDe cannot be empty',
      );
    }

    this.validateOptionalFeatureProperties(properties);
  }

  private validateOptionalFeatureProperties(
    properties: Record<string, unknown>,
  ): void {
    if (
      properties.bangNguon !== undefined &&
      typeof properties.bangNguon !== 'string'
    ) {
      throw new BadRequestException(
        'Feature properties.bangNguon must be text',
      );
    }

    if (
      properties.banGhiNguonId !== undefined &&
      (typeof properties.banGhiNguonId !== 'string' ||
        !this.isUuid(properties.banGhiNguonId))
    ) {
      throw new BadRequestException(
        'Feature properties.banGhiNguonId must be a UUID',
      );
    }

    if (
      properties.hienThi !== undefined &&
      typeof properties.hienThi !== 'boolean'
    ) {
      throw new BadRequestException(
        'Feature properties.hienThi must be a boolean',
      );
    }
  }

  private mergeProperties(
    current: Record<string, unknown>,
    changes?: UpdateMapFeaturePropertiesDto,
  ): UpdateMapFeaturePropertiesDto {
    return {
      ...current,
      ...(changes ?? {}),
    };
  }

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );
  }

  private toFeature(row: MapFeatureRow): GeoJsonFeature {
    const properties = {
      ...row.duLieuCuaSoBatLen,
      lopBanDoId: row.lopBanDoId,
      bangNguon: row.bangNguon,
      banGhiNguonId: row.banGhiNguonId,
      tieuDe: row.tieuDe,
      moTa: row.moTa,
      viDo: row.viDo,
      kinhDo: row.kinhDo,
      hienThi: row.hienThi,
      taoLuc: row.taoLuc,
      capNhatLuc: row.capNhatLuc,
    };

    return {
      type: 'Feature',
      id: row.id,
      geometry:
        typeof row.geometry === 'string'
          ? (JSON.parse(row.geometry) as GeoJsonGeometry)
          : row.geometry,
      properties,
    };
  }
}
