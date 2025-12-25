/**
 * Preview環境用のデータベーススキーマを削除するスクリプト
 * PR番号を元にスキーマ名を特定し、クローズされたPRのスキーマをクリーンアップする
 */

const { Client } = require('pg');

async function deletePreviewSchema() {
  const prNumber = process.env.PR_NUMBER;
  
  if (!prNumber) {
    console.error('Error: PR_NUMBER environment variable is required');
    process.exit(1);
  }

  const schemaName = `preview_pr_${prNumber}`;
  console.log(`Deleting schema: ${schemaName}`);

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

    // スキーマが存在するかチェック
    const checkQuery = `
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = $1
    `;
    const checkResult = await client.query(checkQuery, [schemaName]);

    if (checkResult.rows.length === 0) {
      console.log(`Schema ${schemaName} does not exist. Nothing to delete.`);
      await client.end();
      return;
    }

    // スキーマを削除（CASCADE オプションで関連オブジェクトも削除）
    await client.query(`DROP SCHEMA "${schemaName}" CASCADE`);
    console.log(`Schema ${schemaName} deleted successfully`);

    await client.end();
    console.log('Database connection closed');

    console.log(`\n✅ Preview schema cleanup complete!`);
    console.log(`Deleted schema: ${schemaName}`);

  } catch (error) {
    console.error('Error deleting preview schema:', error);
    process.exit(1);
  }
}

deletePreviewSchema();
