import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCoreKimSonSchema1779897200000 implements MigrationInterface {
  name = 'CreateCoreKimSonSchema1779897200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "postgis"`);
    await queryRunner.query(
      `CREATE EXTENSION IF NOT EXISTS "postgis_topology"`,
    );

    await queryRunner.query(`
      CREATE TABLE "don_vi_hanh_chinh" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "ma" varchar(50) NOT NULL,
        "ten" varchar(255) NOT NULL,
        "ten_day_du" varchar(500),
        "cap" varchar(50) NOT NULL,
        "cha_id" uuid,
        "la_du_lieu_cu" boolean NOT NULL DEFAULT false,
        "hieu_luc_tu_ngay" date,
        "hieu_luc_den_ngay" date,
        "hinh_hoc" geometry(MultiPolygon, 4326),
        "thu_tu_sap_xep" integer NOT NULL DEFAULT 0,
        "dang_hoat_dong" boolean NOT NULL DEFAULT true,
        "tao_luc" timestamp with time zone NOT NULL DEFAULT now(),
        "cap_nhat_luc" timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "pk_don_vi_hanh_chinh" PRIMARY KEY ("id"),
        CONSTRAINT "uq_don_vi_hanh_chinh_ma" UNIQUE ("ma"),
        CONSTRAINT "fk_don_vi_hanh_chinh_cha" FOREIGN KEY ("cha_id") REFERENCES "don_vi_hanh_chinh"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "bi_danh_don_vi_hanh_chinh" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "don_vi_hanh_chinh_id" uuid NOT NULL,
        "ten_bi_danh" varchar(255) NOT NULL,
        "loai_bi_danh" varchar(100) NOT NULL,
        "tao_luc" timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "pk_bi_danh_don_vi_hanh_chinh" PRIMARY KEY ("id"),
        CONSTRAINT "fk_bi_danh_don_vi_hanh_chinh_don_vi" FOREIGN KEY ("don_vi_hanh_chinh_id") REFERENCES "don_vi_hanh_chinh"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "co_quan_don_vi" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "ma" varchar(50) NOT NULL,
        "ten" varchar(255) NOT NULL,
        "loai" varchar(100) NOT NULL,
        "cha_id" uuid,
        "don_vi_hanh_chinh_id" uuid,
        "dia_chi" varchar(500),
        "dien_thoai" varchar(50),
        "email" varchar(255),
        "dang_hoat_dong" boolean NOT NULL DEFAULT true,
        "tao_luc" timestamp with time zone NOT NULL DEFAULT now(),
        "cap_nhat_luc" timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "pk_co_quan_don_vi" PRIMARY KEY ("id"),
        CONSTRAINT "uq_co_quan_don_vi_ma" UNIQUE ("ma"),
        CONSTRAINT "fk_co_quan_don_vi_cha" FOREIGN KEY ("cha_id") REFERENCES "co_quan_don_vi"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_co_quan_don_vi_don_vi_hanh_chinh" FOREIGN KEY ("don_vi_hanh_chinh_id") REFERENCES "don_vi_hanh_chinh"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "ky_bao_cao" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "ma" varchar(50) NOT NULL,
        "ten" varchar(255) NOT NULL,
        "nam" integer NOT NULL,
        "loai_ky" varchar(50) NOT NULL,
        "so_ky" integer,
        "ngay_bat_dau" date NOT NULL,
        "ngay_ket_thuc" date NOT NULL,
        "da_khoa" boolean NOT NULL DEFAULT false,
        "thu_tu_sap_xep" integer NOT NULL DEFAULT 0,
        "tao_luc" timestamp with time zone NOT NULL DEFAULT now(),
        "cap_nhat_luc" timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "pk_ky_bao_cao" PRIMARY KEY ("id"),
        CONSTRAINT "uq_ky_bao_cao_ma" UNIQUE ("ma")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "danh_muc" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "ma_nhom" varchar(100) NOT NULL,
        "ma" varchar(100) NOT NULL,
        "ten" varchar(255) NOT NULL,
        "mo_ta" text,
        "cha_id" uuid,
        "thu_tu_sap_xep" integer NOT NULL DEFAULT 0,
        "dang_hoat_dong" boolean NOT NULL DEFAULT true,
        "tao_luc" timestamp with time zone NOT NULL DEFAULT now(),
        "cap_nhat_luc" timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "pk_danh_muc" PRIMARY KEY ("id"),
        CONSTRAINT "uq_danh_muc_ma_nhom_ma" UNIQUE ("ma_nhom", "ma"),
        CONSTRAINT "fk_danh_muc_cha" FOREIGN KEY ("cha_id") REFERENCES "danh_muc"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "lop_ban_do" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "ma" varchar(100) NOT NULL,
        "ten" varchar(255) NOT NULL,
        "phan_he" varchar(100) NOT NULL,
        "loai_hinh_hoc" varchar(50) NOT NULL,
        "duong_dan_bieu_tuong" varchar(500),
        "mau_sac" varchar(50),
        "do_mo" numeric,
        "chi_so_z" integer NOT NULL DEFAULT 0,
        "mac_dinh_hien_thi" boolean NOT NULL DEFAULT true,
        "dang_hoat_dong" boolean NOT NULL DEFAULT true,
        "thu_tu_sap_xep" integer NOT NULL DEFAULT 0,
        "tao_luc" timestamp with time zone NOT NULL DEFAULT now(),
        "cap_nhat_luc" timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "pk_lop_ban_do" PRIMARY KEY ("id"),
        CONSTRAINT "uq_lop_ban_do_ma" UNIQUE ("ma")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "doi_tuong_ban_do" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "lop_ban_do_id" uuid NOT NULL,
        "bang_nguon" varchar(100),
        "ban_ghi_nguon_id" uuid,
        "tieu_de" varchar(255) NOT NULL,
        "mo_ta" text,
        "du_lieu_cua_so_bat_len" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "hinh_hoc" geometry(Geometry, 4326) NOT NULL,
        "vi_do" numeric,
        "kinh_do" numeric,
        "hien_thi" boolean NOT NULL DEFAULT true,
        "tao_luc" timestamp with time zone NOT NULL DEFAULT now(),
        "cap_nhat_luc" timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "pk_doi_tuong_ban_do" PRIMARY KEY ("id"),
        CONSTRAINT "fk_doi_tuong_ban_do_lop_ban_do" FOREIGN KEY ("lop_ban_do_id") REFERENCES "lop_ban_do"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "nguoi_dung" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "ten_dang_nhap" varchar(100) NOT NULL,
        "mat_khau_hash" varchar(255) NOT NULL,
        "ten_day_du" varchar(255) NOT NULL,
        "email" varchar(255),
        "dien_thoai" varchar(50),
        "co_quan_don_vi_id" uuid,
        "don_vi_hanh_chinh_id" uuid,
        "dang_hoat_dong" boolean NOT NULL DEFAULT true,
        "dang_nhap_cuoi_luc" timestamp with time zone,
        "tao_luc" timestamp with time zone NOT NULL DEFAULT now(),
        "cap_nhat_luc" timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "pk_nguoi_dung" PRIMARY KEY ("id"),
        CONSTRAINT "uq_nguoi_dung_ten_dang_nhap" UNIQUE ("ten_dang_nhap"),
        CONSTRAINT "fk_nguoi_dung_co_quan_don_vi" FOREIGN KEY ("co_quan_don_vi_id") REFERENCES "co_quan_don_vi"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_nguoi_dung_don_vi_hanh_chinh" FOREIGN KEY ("don_vi_hanh_chinh_id") REFERENCES "don_vi_hanh_chinh"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "vai_tro" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "ma" varchar(100) NOT NULL,
        "ten" varchar(255) NOT NULL,
        "mo_ta" text,
        "dang_hoat_dong" boolean NOT NULL DEFAULT true,
        "tao_luc" timestamp with time zone NOT NULL DEFAULT now(),
        "cap_nhat_luc" timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "pk_vai_tro" PRIMARY KEY ("id"),
        CONSTRAINT "uq_vai_tro_ma" UNIQUE ("ma")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "quyen_han" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "ma" varchar(150) NOT NULL,
        "phan_he" varchar(100) NOT NULL,
        "hanh_dong" varchar(100) NOT NULL,
        "ten" varchar(255) NOT NULL,
        "tao_luc" timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "pk_quyen_han" PRIMARY KEY ("id"),
        CONSTRAINT "uq_quyen_han_ma" UNIQUE ("ma")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "nguoi_dung_vai_tro" (
        "nguoi_dung_id" uuid NOT NULL,
        "vai_tro_id" uuid NOT NULL,
        "tao_luc" timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "pk_nguoi_dung_vai_tro" PRIMARY KEY ("nguoi_dung_id", "vai_tro_id"),
        CONSTRAINT "fk_nguoi_dung_vai_tro_nguoi_dung" FOREIGN KEY ("nguoi_dung_id") REFERENCES "nguoi_dung"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_nguoi_dung_vai_tro_vai_tro" FOREIGN KEY ("vai_tro_id") REFERENCES "vai_tro"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "vai_tro_quyen_han" (
        "vai_tro_id" uuid NOT NULL,
        "quyen_han_id" uuid NOT NULL,
        "tao_luc" timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "pk_vai_tro_quyen_han" PRIMARY KEY ("vai_tro_id", "quyen_han_id"),
        CONSTRAINT "fk_vai_tro_quyen_han_vai_tro" FOREIGN KEY ("vai_tro_id") REFERENCES "vai_tro"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_vai_tro_quyen_han_quyen_han" FOREIGN KEY ("quyen_han_id") REFERENCES "quyen_han"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "bao_cao" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "ky_bao_cao_id" uuid NOT NULL,
        "phan_he" varchar(100) NOT NULL,
        "don_vi_hanh_chinh_id" uuid,
        "nguoi_gui_id" uuid,
        "gui_luc" timestamp with time zone,
        "nguoi_duyet_id" uuid,
        "duyet_luc" timestamp with time zone,
        "trang_thai" varchar(50) NOT NULL,
        "y_kien" text,
        "tao_luc" timestamp with time zone NOT NULL DEFAULT now(),
        "cap_nhat_luc" timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "pk_bao_cao" PRIMARY KEY ("id"),
        CONSTRAINT "fk_bao_cao_ky_bao_cao" FOREIGN KEY ("ky_bao_cao_id") REFERENCES "ky_bao_cao"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_bao_cao_don_vi_hanh_chinh" FOREIGN KEY ("don_vi_hanh_chinh_id") REFERENCES "don_vi_hanh_chinh"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_bao_cao_nguoi_gui" FOREIGN KEY ("nguoi_gui_id") REFERENCES "nguoi_dung"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_bao_cao_nguoi_duyet" FOREIGN KEY ("nguoi_duyet_id") REFERENCES "nguoi_dung"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "chi_so_tong_hop_bang_dieu_khien" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "ky_bao_cao_id" uuid NOT NULL,
        "phan_he" varchar(100) NOT NULL,
        "ma_chi_so" varchar(150) NOT NULL,
        "ten_chi_so" varchar(255) NOT NULL,
        "gia_tri_chi_so" numeric,
        "don_vi_tinh" varchar(100) NOT NULL,
        "don_vi_hanh_chinh_id" uuid,
        "tinh_toan_luc" timestamp with time zone,
        CONSTRAINT "pk_chi_so_tong_hop_bang_dieu_khien" PRIMARY KEY ("id"),
        CONSTRAINT "fk_chi_so_tong_hop_ky_bao_cao" FOREIGN KEY ("ky_bao_cao_id") REFERENCES "ky_bao_cao"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_chi_so_tong_hop_don_vi_hanh_chinh" FOREIGN KEY ("don_vi_hanh_chinh_id") REFERENCES "don_vi_hanh_chinh"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "nhat_ky_thao_tac" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "nguoi_dung_id" uuid,
        "hanh_dong" varchar(100) NOT NULL,
        "bang_nguon" varchar(100) NOT NULL,
        "ban_ghi_nguon_id" uuid NOT NULL,
        "du_lieu_cu" jsonb,
        "du_lieu_moi" jsonb,
        "dia_chi_ip" varchar(100),
        "tac_nhan_nguoi_dung" text,
        "tao_luc" timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "pk_nhat_ky_thao_tac" PRIMARY KEY ("id"),
        CONSTRAINT "fk_nhat_ky_thao_tac_nguoi_dung" FOREIGN KEY ("nguoi_dung_id") REFERENCES "nguoi_dung"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_don_vi_hanh_chinh_cha_id" ON "don_vi_hanh_chinh" ("cha_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_don_vi_hanh_chinh_cap" ON "don_vi_hanh_chinh" ("cap")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_don_vi_hanh_chinh_dang_hoat_dong" ON "don_vi_hanh_chinh" ("dang_hoat_dong")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_don_vi_hanh_chinh_hinh_hoc" ON "don_vi_hanh_chinh" USING GIST ("hinh_hoc")`,
    );

    await queryRunner.query(
      `CREATE INDEX "idx_bi_danh_don_vi_hanh_chinh_don_vi_id" ON "bi_danh_don_vi_hanh_chinh" ("don_vi_hanh_chinh_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_bi_danh_don_vi_hanh_chinh_ten" ON "bi_danh_don_vi_hanh_chinh" ("ten_bi_danh")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_bi_danh_don_vi_hanh_chinh_loai" ON "bi_danh_don_vi_hanh_chinh" ("loai_bi_danh")`,
    );

    await queryRunner.query(
      `CREATE INDEX "idx_co_quan_don_vi_cha_id" ON "co_quan_don_vi" ("cha_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_co_quan_don_vi_don_vi_hanh_chinh_id" ON "co_quan_don_vi" ("don_vi_hanh_chinh_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_co_quan_don_vi_loai" ON "co_quan_don_vi" ("loai")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_co_quan_don_vi_dang_hoat_dong" ON "co_quan_don_vi" ("dang_hoat_dong")`,
    );

    await queryRunner.query(
      `CREATE INDEX "idx_ky_bao_cao_nam" ON "ky_bao_cao" ("nam")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ky_bao_cao_loai_ky" ON "ky_bao_cao" ("loai_ky")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ky_bao_cao_da_khoa" ON "ky_bao_cao" ("da_khoa")`,
    );

    await queryRunner.query(
      `CREATE INDEX "idx_danh_muc_ma_nhom" ON "danh_muc" ("ma_nhom")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_danh_muc_cha_id" ON "danh_muc" ("cha_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_danh_muc_dang_hoat_dong" ON "danh_muc" ("dang_hoat_dong")`,
    );

    await queryRunner.query(
      `CREATE INDEX "idx_lop_ban_do_phan_he" ON "lop_ban_do" ("phan_he")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_lop_ban_do_loai_hinh_hoc" ON "lop_ban_do" ("loai_hinh_hoc")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_lop_ban_do_dang_hoat_dong" ON "lop_ban_do" ("dang_hoat_dong")`,
    );

    await queryRunner.query(
      `CREATE INDEX "idx_doi_tuong_ban_do_lop_ban_do_id" ON "doi_tuong_ban_do" ("lop_ban_do_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_doi_tuong_ban_do_hinh_hoc" ON "doi_tuong_ban_do" USING GIST ("hinh_hoc")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_doi_tuong_ban_do_hien_thi" ON "doi_tuong_ban_do" ("hien_thi")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_doi_tuong_ban_do_nguon" ON "doi_tuong_ban_do" ("bang_nguon", "ban_ghi_nguon_id")`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_nguoi_dung_email" ON "nguoi_dung" ("email") WHERE "email" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_nguoi_dung_co_quan_don_vi_id" ON "nguoi_dung" ("co_quan_don_vi_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_nguoi_dung_don_vi_hanh_chinh_id" ON "nguoi_dung" ("don_vi_hanh_chinh_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_nguoi_dung_dang_hoat_dong" ON "nguoi_dung" ("dang_hoat_dong")`,
    );

    await queryRunner.query(
      `CREATE INDEX "idx_vai_tro_dang_hoat_dong" ON "vai_tro" ("dang_hoat_dong")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_quyen_han_phan_he" ON "quyen_han" ("phan_he")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_quyen_han_hanh_dong" ON "quyen_han" ("hanh_dong")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_nguoi_dung_vai_tro_vai_tro_id" ON "nguoi_dung_vai_tro" ("vai_tro_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_vai_tro_quyen_han_quyen_han_id" ON "vai_tro_quyen_han" ("quyen_han_id")`,
    );

    await queryRunner.query(
      `CREATE INDEX "idx_bao_cao_ky_bao_cao_id" ON "bao_cao" ("ky_bao_cao_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_bao_cao_don_vi_hanh_chinh_id" ON "bao_cao" ("don_vi_hanh_chinh_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_bao_cao_nguoi_gui_id" ON "bao_cao" ("nguoi_gui_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_bao_cao_nguoi_duyet_id" ON "bao_cao" ("nguoi_duyet_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_bao_cao_phan_he" ON "bao_cao" ("phan_he")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_bao_cao_trang_thai" ON "bao_cao" ("trang_thai")`,
    );

    await queryRunner.query(
      `CREATE INDEX "idx_chi_so_tong_hop_ky_bao_cao_id" ON "chi_so_tong_hop_bang_dieu_khien" ("ky_bao_cao_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_chi_so_tong_hop_don_vi_hanh_chinh_id" ON "chi_so_tong_hop_bang_dieu_khien" ("don_vi_hanh_chinh_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_chi_so_tong_hop_phan_he" ON "chi_so_tong_hop_bang_dieu_khien" ("phan_he")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_chi_so_tong_hop_ma_chi_so" ON "chi_so_tong_hop_bang_dieu_khien" ("ma_chi_so")`,
    );

    await queryRunner.query(
      `CREATE INDEX "idx_nhat_ky_thao_tac_nguoi_dung_id" ON "nhat_ky_thao_tac" ("nguoi_dung_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_nhat_ky_thao_tac_hanh_dong" ON "nhat_ky_thao_tac" ("hanh_dong")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_nhat_ky_thao_tac_bang_nguon" ON "nhat_ky_thao_tac" ("bang_nguon")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_nhat_ky_thao_tac_ban_ghi_nguon_id" ON "nhat_ky_thao_tac" ("ban_ghi_nguon_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "nhat_ky_thao_tac"`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "chi_so_tong_hop_bang_dieu_khien"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "bao_cao"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vai_tro_quyen_han"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "nguoi_dung_vai_tro"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "quyen_han"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vai_tro"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "nguoi_dung"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "doi_tuong_ban_do"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "lop_ban_do"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "danh_muc"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ky_bao_cao"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "co_quan_don_vi"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bi_danh_don_vi_hanh_chinh"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "don_vi_hanh_chinh"`);
  }
}
