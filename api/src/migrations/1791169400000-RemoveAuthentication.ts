import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveAuthentication1791169400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('users', 'password')) {
      await queryRunner.dropColumn('users', 'password');
    }

    if (await queryRunner.hasColumn('users', 'lastLoginAt')) {
      await queryRunner.dropColumn('users', 'lastLoginAt');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('users', 'password'))) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'password',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasColumn('users', 'lastLoginAt'))) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'lastLoginAt',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }
  }
}
