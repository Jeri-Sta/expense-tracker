import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableCheck,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateSubscriptions1792362000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'subscriptions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'name', type: 'varchar', length: '255', isNullable: false },
          { name: 'amount', type: 'decimal', precision: 12, scale: 2, isNullable: false },
          { name: 'chargeDay', type: 'int', isNullable: false },
          { name: 'startDate', type: 'date', isNullable: false },
          { name: 'nextChargeDate', type: 'date', isNullable: false },
          { name: 'creditCardId', type: 'uuid', isNullable: false },
          { name: 'userId', type: 'uuid', isNullable: false },
          { name: 'workspaceId', type: 'uuid', isNullable: false },
          { name: 'isActive', type: 'boolean', default: true, isNullable: false },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP(6)' },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP(6)',
            onUpdate: 'CURRENT_TIMESTAMP(6)',
          },
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
        checks: [
          new TableCheck({
            name: 'CHK_subscriptions_charge_day',
            expression: '"chargeDay" BETWEEN 1 AND 31',
          }),
        ],
      }),
    );

    await queryRunner.createForeignKeys('subscriptions', [
      new TableForeignKey({
        name: 'FK_subscriptions_credit_card',
        columnNames: ['creditCardId'],
        referencedTableName: 'credit_cards',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
      new TableForeignKey({
        name: 'FK_subscriptions_user',
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
      new TableForeignKey({
        name: 'FK_subscriptions_workspace',
        columnNames: ['workspaceId'],
        referencedTableName: 'workspaces',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    ]);

    await queryRunner.createIndex(
      'subscriptions',
      new TableIndex({
        name: 'IDX_subscriptions_workspace_active_next_charge',
        columnNames: ['workspaceId', 'isActive', 'nextChargeDate'],
      }),
    );

    await queryRunner.addColumn(
      'card_transactions',
      new TableColumn({
        name: 'subscriptionId',
        type: 'uuid',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'card_transactions',
      new TableColumn({
        name: 'subscriptionChargeDate',
        type: 'date',
        isNullable: true,
      }),
    );
    await queryRunner.createForeignKey(
      'card_transactions',
      new TableForeignKey({
        name: 'FK_card_transactions_subscription',
        columnNames: ['subscriptionId'],
        referencedTableName: 'subscriptions',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
    await queryRunner.createIndex(
      'card_transactions',
      new TableIndex({
        name: 'UQ_card_transactions_subscription_charge_date',
        columnNames: ['subscriptionId', 'subscriptionChargeDate'],
        isUnique: true,
        where: '"subscriptionId" IS NOT NULL AND "subscriptionChargeDate" IS NOT NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const [{ count: subscriptionCount }] = await queryRunner.query(
      'SELECT COUNT(*)::int AS count FROM subscriptions',
    );
    const [{ count: provenanceCount }] = await queryRunner.query(
      'SELECT COUNT(*)::int AS count FROM card_transactions WHERE "subscriptionId" IS NOT NULL OR "subscriptionChargeDate" IS NOT NULL',
    );

    if (subscriptionCount > 0 || provenanceCount > 0) {
      throw new Error(
        'Cannot revert CreateSubscriptions while subscriptions or subscription-linked card transactions exist; archive these records and explicitly remove them before retrying.',
      );
    }

    await queryRunner.dropIndex(
      'card_transactions',
      'UQ_card_transactions_subscription_charge_date',
    );
    await queryRunner.dropForeignKey('card_transactions', 'FK_card_transactions_subscription');
    await queryRunner.dropColumn('card_transactions', 'subscriptionChargeDate');
    await queryRunner.dropColumn('card_transactions', 'subscriptionId');
    await queryRunner.dropTable('subscriptions');
  }
}
