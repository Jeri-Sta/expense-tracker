import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddBudgetGoals1782165671300 implements MigrationInterface {
  name = 'AddBudgetGoals1782165671300';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add monthlyBudget to categories
    await queryRunner.addColumn(
      'categories',
      new TableColumn({
        name: 'monthlyBudget',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
    );

    // 2. Add categoryId to installment_plans
    await queryRunner.addColumn(
      'installment_plans',
      new TableColumn({
        name: 'categoryId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'installment_plans',
      new TableForeignKey({
        name: 'FK_installment_plans_category',
        columnNames: ['categoryId'],
        referencedTableName: 'categories',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // 3. Seed existing installment plans with first active EXPENSE category per workspace
    await queryRunner.query(`
      UPDATE installment_plans ip
      SET "categoryId" = (
        SELECT c.id
        FROM categories c
        WHERE c."workspaceId" = ip."workspaceId"
          AND c.type = 'expense'
          AND c."isActive" = true
          AND c."deletedAt" IS NULL
        ORDER BY c."sortOrder" ASC, c.name ASC
        LIMIT 1
      )
      WHERE ip."categoryId" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('installment_plans', 'FK_installment_plans_category');
    // Column name depends on which migration run created it — try both
    const ipTable = await queryRunner.getTable('installment_plans');
    const colName = ipTable?.findColumnByName('categoryId') ? 'categoryId' : 'category_id';
    await queryRunner.dropColumn('installment_plans', colName);
    const catTable = await queryRunner.getTable('categories');
    const budgetCol = catTable?.findColumnByName('monthlyBudget') ? 'monthlyBudget' : 'monthly_budget';
    await queryRunner.dropColumn('categories', budgetCol);
  }
}
