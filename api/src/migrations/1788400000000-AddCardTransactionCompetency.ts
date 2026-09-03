import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddCardTransactionCompetency1788400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('card_transactions', 'competencyPeriod'))) {
      await queryRunner.addColumn(
        'card_transactions',
        new TableColumn({
          name: 'competencyPeriod',
          type: 'varchar',
          length: '7',
          isNullable: true,
        }),
      );

      await queryRunner.query(`
      UPDATE card_transactions ct
      SET "competencyPeriod" = CASE
        WHEN cc."dueDay" <= cc."closingDay"
          THEN TO_CHAR((ct."invoicePeriod" || '-01')::date + INTERVAL '1 month', 'YYYY-MM')
        ELSE ct."invoicePeriod"
      END
      FROM credit_cards cc
      WHERE cc.id = ct."creditCardId"
    `);

      await queryRunner.query(
        `ALTER TABLE card_transactions ALTER COLUMN "competencyPeriod" SET NOT NULL`,
      );
    }

    const table = await queryRunner.getTable('card_transactions');
    if (
      !table?.indices.some((index) => index.name === 'IDX_card_transactions_workspace_competency')
    ) {
      await queryRunner.createIndex(
        'card_transactions',
        new TableIndex({
          name: 'IDX_card_transactions_workspace_competency',
          columnNames: ['workspaceId', 'competencyPeriod'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('card_transactions');
    if (
      table?.indices.some((index) => index.name === 'IDX_card_transactions_workspace_competency')
    ) {
      await queryRunner.dropIndex(
        'card_transactions',
        'IDX_card_transactions_workspace_competency',
      );
    }
    if (await queryRunner.hasColumn('card_transactions', 'competencyPeriod')) {
      await queryRunner.dropColumn('card_transactions', 'competencyPeriod');
    }
  }
}
