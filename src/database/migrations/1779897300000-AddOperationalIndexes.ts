import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOperationalIndexes1779897300000 implements MigrationInterface {
  name = 'AddOperationalIndexes1779897300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX "idx_nhat_ky_thao_tac_tao_luc"
      ON "nhat_ky_thao_tac" ("tao_luc")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_chi_so_tong_hop_ky_phan_he_ma_don_vi"
      ON "chi_so_tong_hop_bang_dieu_khien" (
        "ky_bao_cao_id",
        "phan_he",
        "ma_chi_so",
        COALESCE("don_vi_hanh_chinh_id", '00000000-0000-0000-0000-000000000000'::uuid)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "uq_chi_so_tong_hop_ky_phan_he_ma_don_vi"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_nhat_ky_thao_tac_tao_luc"`,
    );
  }
}
