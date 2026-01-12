import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableColumn } from 'typeorm';

export class CreateWorkspacesAndInvitations1705033200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create workspaces table
    await queryRunner.createTable(
      new Table({
        name: 'workspaces',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'ownerId',
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
            columnNames: ['ownerId'],
          },
          {
            columnNames: ['createdAt'],
          },
        ],
      }),
    );

    // Create invitations table
    await queryRunner.createTable(
      new Table({
        name: 'invitations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'workspaceId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'invitedEmail',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'invitedBy',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'ACCEPTED', 'DECLINED'],
            default: "'PENDING'",
          },
          {
            name: 'invitationToken',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
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
            columnNames: ['invitedEmail'],
          },
          {
            columnNames: ['status'],
          },
        ],
      }),
    );

    // Add foreign key for workspaces.ownerId -> users.id
    await queryRunner.createForeignKey(
      'workspaces',
      new TableForeignKey({
        columnNames: ['ownerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'RESTRICT',
      }),
    );

    // Add foreign keys for invitations
    await queryRunner.createForeignKey(
      'invitations',
      new TableForeignKey({
        columnNames: ['workspaceId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'workspaces',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'invitations',
      new TableForeignKey({
        columnNames: ['invitedBy'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'RESTRICT',
      }),
    );

    // Add workspace-related columns to users table
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'isInvitedUser',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'workspaceId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'invitedBy',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Add foreign key for users.workspaceId -> workspaces.id
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['workspaceId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'workspaces',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.addColumn(
      'installments',
      new TableColumn({
        name: 'userId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.query(
      `UPDATE installments SET "userId" = ip."userId"
   FROM installment_plans ip WHERE installments."installmentPlanId" = ip.id`,
    );

    await queryRunner.changeColumn(
      'installments',
      'userId',
      new TableColumn({
        name: 'userId',
        type: 'uuid',
        isNullable: false,
      }),
    );

    await queryRunner.createForeignKey(
      'installments',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create default workspace for each existing user and assign them to it
    const users = await queryRunner.query('SELECT id FROM users');

    for (const user of users) {
      await queryRunner.query(
        `INSERT INTO workspaces (id, name, "ownerId", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`,
        [`Personal Workspace of ${user.id}`, user.id],
      );

      // Get the created workspace ID
      const result = await queryRunner.query(
        `SELECT id FROM workspaces WHERE "ownerId" = $1 ORDER BY "createdAt" DESC LIMIT 1`,
        [user.id],
      );

      if (result.length > 0) {
        const createdWorkspaceId = result[0].id;
        await queryRunner.query(
          `UPDATE users SET "workspaceId" = $1, "isInvitedUser" = false WHERE id = $2`,
          [createdWorkspaceId, user.id],
        );
      }
    }

    // Add workspaceId to all existing data tables
    const tablesToUpdate = [
      'transactions',
      'categories',
      'recurring_transactions',
      'installment_plans',
      'credit_cards',
      'card_transactions',
      'invoices',
      'installments',
    ];

    for (const tableName of tablesToUpdate) {
      const hasColumn = await queryRunner.hasColumn(tableName, 'workspaceId');
      if (!hasColumn) {
        await queryRunner.addColumn(
          tableName,
          new TableColumn({
            name: 'workspaceId',
            type: 'uuid',
            isNullable: true,
          }),
        );

        // Populate workspaceId from users.workspaceId
        await queryRunner.query(
          `UPDATE ${tableName} SET "workspaceId" = u."workspaceId"
           FROM users u WHERE ${tableName}."userId" = u.id`,
        );

        // Make workspaceId NOT NULL only after data is populated
        await queryRunner.query(
          `ALTER TABLE "${tableName}" ALTER COLUMN "workspaceId" SET NOT NULL`,
        );

        // Add foreign key
        await queryRunner.createForeignKey(
          tableName,
          new TableForeignKey({
            columnNames: ['workspaceId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'workspaces',
            onDelete: 'CASCADE',
          }),
        );
      } else {
        // Column already exists - check if foreign key exists
        const table = await queryRunner.getTable(tableName);
        const hasForeignKey = table.foreignKeys.some((fk) => fk.columnNames[0] === 'workspaceId');
        if (!hasForeignKey) {
          await queryRunner.createForeignKey(
            tableName,
            new TableForeignKey({
              columnNames: ['workspaceId'],
              referencedColumnNames: ['id'],
              referencedTableName: 'workspaces',
              onDelete: 'CASCADE',
            }),
          );
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign keys from data tables
    const tablesToUpdate = [
      'transactions',
      'categories',
      'recurring_transactions',
      'installment_plans',
      'credit_cards',
      'card_transactions',
      'invoices',
      'installments',
    ];

    for (const tableName of tablesToUpdate) {
      const table = await queryRunner.getTable(tableName);
      const foreignKey = table.foreignKeys.find((fk) => fk.columnNames[0] === 'workspaceId');
      if (foreignKey) {
        await queryRunner.dropForeignKey(tableName, foreignKey);
      }
      await queryRunner.dropColumn(tableName, 'workspaceId');
    }

    // Remove workspace-related columns from users
    const userTable = await queryRunner.getTable('users');

    const workspaceIdFk = userTable.foreignKeys.find((fk) => fk.columnNames[0] === 'workspaceId');
    if (workspaceIdFk) {
      await queryRunner.dropForeignKey('users', workspaceIdFk);
    }

    await queryRunner.dropColumn('users', 'workspaceId');
    await queryRunner.dropColumn('users', 'isInvitedUser');
    await queryRunner.dropColumn('users', 'invitedBy');
    await queryRunner.dropColumn('installments', 'userId');

    // Drop invitations table
    await queryRunner.dropTable('invitations');

    // Drop workspaces table
    await queryRunner.dropTable('workspaces');
  }
}
