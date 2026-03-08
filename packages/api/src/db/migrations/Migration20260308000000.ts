import { Migration } from '@mikro-orm/migrations';

export class Migration20260308000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "boards" add column "webhook_url" varchar(255) null;`);

    this.addSql(
      `create table "webhook_logs" (
        "id" uuid not null default gen_random_uuid(),
        "board_id" uuid not null,
        "webhook_url" varchar(255) not null,
        "event" varchar(64) not null,
        "request_payload" jsonb not null,
        "response_status" int null,
        "response_body" text null,
        "created_at" timestamptz not null,
        constraint "webhook_logs_pkey" primary key ("id")
      );`
    );
    this.addSql(`create index "webhook_logs_board_id_index" on "webhook_logs" ("board_id");`);
    this.addSql(`create index "webhook_logs_created_at_index" on "webhook_logs" ("created_at");`);
    this.addSql(
      `alter table "webhook_logs" add constraint "webhook_logs_board_id_foreign" foreign key ("board_id") references "boards" ("id") on update cascade on delete cascade;`
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "webhook_logs" drop constraint "webhook_logs_board_id_foreign";`);
    this.addSql(`drop table if exists "webhook_logs" cascade;`);
    this.addSql(`alter table "boards" drop column "webhook_url";`);
  }
}
