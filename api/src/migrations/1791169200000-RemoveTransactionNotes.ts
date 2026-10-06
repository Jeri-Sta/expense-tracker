import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveTransactionNotes1791169200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('transactions', 'notes')) {
      await queryRunner.dropColumn('transactions', 'notes');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('transactions', 'notes'))) {
      await queryRunner.addColumn(
        'transactions',
        new TableColumn({
          name: 'notes',
          type: 'text',
          isNullable: true,
        }),
      );
    }
  }
}
