import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateApiKeysTable1712000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'api_keys',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'hashedKey',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'lastUsedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'workspaceId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP(6)',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP(6)',
            onUpdate: 'CURRENT_TIMESTAMP(6)',
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        indices: [
          {
            columnNames: ['workspaceId'],
          },
          {
            columnNames: ['workspaceId', 'isActive'],
            isUnique: true,
            where: '"isActive" = true',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'api_keys',
      new TableForeignKey({
        columnNames: ['workspaceId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'workspaces',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('api_keys');
    const foreignKey = table?.foreignKeys.find((fk) => fk.columnNames[0] === 'workspaceId');
    if (foreignKey) {
      await queryRunner.dropForeignKey('api_keys', foreignKey);
    }
    await queryRunner.dropTable('api_keys');
  }
}
