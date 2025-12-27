import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRoleColumn1735295900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if role column already exists
    const table = await queryRunner.getTable('users');
    const roleColumn = table?.findColumnByName('role');

    if (!roleColumn) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'role',
          type: 'varchar',
          length: '50',
          default: "'user'",
          isNullable: false,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove role column
    await queryRunner.dropColumn('users', 'role');
  }
}
