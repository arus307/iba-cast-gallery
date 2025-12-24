/**
 * Preview環境用のデータベーススキーマを作成し、マイグレーションを実行するスクリプト
 * PR番号を元にスキーマ名を生成し、各Preview環境が独立したDBスキーマを使用できるようにする
 */

const { Client } = require('pg');
const { execSync } = require('child_process');

async function createPreviewSchema() {
  const prNumber = process.env.PR_NUMBER;
  
  if (!prNumber) {
    console.error('Error: PR_NUMBER environment variable is required');
    process.exit(1);
  }

  const schemaName = `preview_pr_${prNumber}`;
  console.log(`Creating schema: ${schemaName}`);

  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // スキーマが既に存在するかチェック
    const checkQuery = `
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = $1
    `;
    const checkResult = await client.query(checkQuery, [schemaName]);

    if (checkResult.rows.length > 0) {
      console.log(`Schema ${schemaName} already exists. Dropping and recreating...`);
      await client.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
    }

    // スキーマを作成
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    console.log(`Schema ${schemaName} created successfully`);

    await client.end();
    console.log('Database connection closed');

    // マイグレーションを実行
    console.log('Running migrations...');
    execSync('yarn migrate', {
      stdio: 'inherit',
      env: {
        ...process.env,
        DB_SCHEMA: schemaName,
      },
    });
    console.log('Migrations completed successfully');

    console.log(`\n✅ Preview schema setup complete!`);
    console.log(`Schema name: ${schemaName}`);
    console.log(`\nSet the following environment variable in your preview deployment:`);
    console.log(`DB_SCHEMA=${schemaName}`);

  } catch (error) {
    console.error('Error creating preview schema:', error);
    process.exit(1);
  }
}

createPreviewSchema();
