import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class AddInvoiceImport1793000000000 implements MigrationInterface {
  name = 'AddInvoiceImport1793000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const cardTransactions = await queryRunner.getTable('card_transactions');

    if (!cardTransactions?.findColumnByName('importSource')) {
      await queryRunner.addColumns('card_transactions', [
        new TableColumn({
          name: 'importSource',
          type: 'varchar',
          length: '50',
          isNullable: true,
        }),
        new TableColumn({
          name: 'importFingerprint',
          type: 'varchar',
          length: '64',
          isNullable: true,
        }),
        new TableColumn({
          name: 'importSeriesKey',
          type: 'varchar',
          length: '64',
          isNullable: true,
        }),
      ]);
    }

    const updatedTable = await queryRunner.getTable('card_transactions');

    if (
      !updatedTable?.indices.some(
        (index) => index.name === 'UQ_card_transactions_import_fingerprint',
      )
    ) {
      await queryRunner.createIndex(
        'card_transactions',
        new TableIndex({
          name: 'UQ_card_transactions_import_fingerprint',
          columnNames: ['creditCardId', 'importFingerprint'],
          isUnique: true,
          where: '"importFingerprint" IS NOT NULL',
        }),
      );
    }

    if (
      !updatedTable?.indices.some((index) => index.name === 'IDX_card_transactions_import_series')
    ) {
      await queryRunner.createIndex(
        'card_transactions',
        new TableIndex({
          name: 'IDX_card_transactions_import_series',
          columnNames: ['creditCardId', 'importSeriesKey'],
          where: '"importSeriesKey" IS NOT NULL',
        }),
      );
    }

    if (!(await queryRunner.hasTable('merchant_category_rules'))) {
      await queryRunner.createTable(
        new Table({
          name: 'merchant_category_rules',
          columns: [
            { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
            { name: 'merchantKey', type: 'varchar', length: '255', isNullable: false },
            { name: 'pattern', type: 'varchar', length: '255', isNullable: false },
            {
              name: 'defaultDescription',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'source',
              type: 'varchar',
              length: '50',
              isNullable: false,
              default: "'nubank_csv'",
            },
            { name: 'categoryId', type: 'uuid', isNullable: false },
            { name: 'userId', type: 'uuid', isNullable: false },
            { name: 'workspaceId', type: 'uuid', isNullable: false },
            { name: 'lastUsedAt', type: 'timestamp', isNullable: true },
            { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP(6)' },
            {
              name: 'updatedAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP(6)',
              onUpdate: 'CURRENT_TIMESTAMP(6)',
            },
            { name: 'deletedAt', type: 'timestamp', isNullable: true },
          ],
        }),
      );

      await queryRunner.createForeignKeys('merchant_category_rules', [
        new TableForeignKey({
          name: 'FK_merchant_category_rules_category',
          columnNames: ['categoryId'],
          referencedTableName: 'categories',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
        new TableForeignKey({
          name: 'FK_merchant_category_rules_user',
          columnNames: ['userId'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'RESTRICT',
        }),
        new TableForeignKey({
          name: 'FK_merchant_category_rules_workspace',
          columnNames: ['workspaceId'],
          referencedTableName: 'workspaces',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      ]);

      await queryRunner.createIndex(
        'merchant_category_rules',
        new TableIndex({
          name: 'UQ_merchant_category_rules_key',
          columnNames: ['workspaceId', 'source', 'merchantKey'],
          isUnique: true,
          where: '"deletedAt" IS NULL',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('merchant_category_rules')) {
      await queryRunner.dropTable('merchant_category_rules');
    }

    const cardTransactions = await queryRunner.getTable('card_transactions');

    if (
      cardTransactions?.indices.some(
        (index) => index.name === 'UQ_card_transactions_import_fingerprint',
      )
    ) {
      await queryRunner.dropIndex('card_transactions', 'UQ_card_transactions_import_fingerprint');
    }

    if (
      cardTransactions?.indices.some(
        (index) => index.name === 'IDX_card_transactions_import_series',
      )
    ) {
      await queryRunner.dropIndex('card_transactions', 'IDX_card_transactions_import_series');
    }

    for (const column of ['importSource', 'importFingerprint', 'importSeriesKey']) {
      if (await queryRunner.hasColumn('card_transactions', column)) {
        await queryRunner.dropColumn('card_transactions', column);
      }
    }
  }
}
