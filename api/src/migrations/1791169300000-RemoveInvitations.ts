import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class RemoveInvitations1791169300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('invitations')) {
      await queryRunner.dropTable('invitations', true);
    }
    await queryRunner.query('DROP TYPE IF EXISTS "public"."invitations_status_enum"');

    if (await queryRunner.hasColumn('users', 'invitedBy')) {
      await queryRunner.dropColumn('users', 'invitedBy');
    }

    if (await queryRunner.hasColumn('users', 'isInvitedUser')) {
      await queryRunner.dropColumn('users', 'isInvitedUser');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('users', 'isInvitedUser'))) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'isInvitedUser',
          type: 'boolean',
          default: false,
        }),
      );
    }

    if (!(await queryRunner.hasColumn('users', 'invitedBy'))) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'invitedBy',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasTable('invitations'))) {
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
            { name: 'workspaceId', type: 'uuid' },
            { name: 'invitedEmail', type: 'varchar' },
            { name: 'invitedBy', type: 'uuid' },
            {
              name: 'status',
              type: 'enum',
              enum: ['PENDING', 'ACCEPTED', 'DECLINED'],
              default: "'PENDING'",
            },
            { name: 'invitationToken', type: 'varchar' },
            { name: 'expiresAt', type: 'timestamp' },
            { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP(6)' },
            {
              name: 'updatedAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP(6)',
              onUpdate: 'CURRENT_TIMESTAMP(6)',
            },
            { name: 'deletedAt', type: 'timestamp', isNullable: true },
          ],
          indices: [
            { columnNames: ['workspaceId'] },
            { columnNames: ['invitedEmail'] },
            { columnNames: ['status'] },
          ],
        }),
      );

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
    }
  }
}
