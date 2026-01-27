import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddOAuthFieldsToUsers1738000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make password nullable for OAuth users
    await queryRunner.changeColumn(
      'users',
      'password',
      new TableColumn({
        name: 'password',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    // Add OAuth provider field
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'oauth_provider',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
    );

    // Add OAuth ID field
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'oauth_id',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    // Create index on oauth_provider and oauth_id for faster lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_users_oauth_provider_id" ON "users" ("oauth_provider", "oauth_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`DROP INDEX "IDX_users_oauth_provider_id"`);

    // Remove OAuth columns
    await queryRunner.dropColumn('users', 'oauth_id');
    await queryRunner.dropColumn('users', 'oauth_provider');

    // Make password non-nullable again
    await queryRunner.changeColumn(
      'users',
      'password',
      new TableColumn({
        name: 'password',
        type: 'varchar',
        length: '255',
        isNullable: false,
      }),
    );
  }
}
