import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class CreateSuperAdmin1735296000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Hash the password
    const hashedPassword = await bcrypt.hash('Paskistan@123', 10);

    // Check if user already exists
    const existingUser = (await queryRunner.query(
      `SELECT id FROM users WHERE email = 'bilalpasha.dev@gmail.com'`,
    )) as Array<{ id: string }>;

    if (existingUser.length === 0) {
      // Insert super admin user
      await queryRunner.query(
        `INSERT INTO users (id, name, email, password, role, avatar, created_at, updated_at)
         VALUES (
           gen_random_uuid(),
           'Bilal Pasha',
           'bilalpasha.dev@gmail.com',
           $1,
           'super_admin',
           NULL,
           NOW(),
           NOW()
         )`,
        [hashedPassword],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove super admin user
    await queryRunner.query(
      `DELETE FROM users WHERE email = 'bilalpasha.dev@gmail.com'`,
    );
  }
}
