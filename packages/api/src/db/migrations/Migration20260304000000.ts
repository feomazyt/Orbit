import { Migration } from '@mikro-orm/migrations';

export class Migration20260304000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "notifications" (
        "id" uuid not null default gen_random_uuid(),
        "user_id" uuid not null,
        "type" varchar(64) not null,
        "payload" jsonb not null,
        "read_at" timestamptz null,
        "created_at" timestamptz not null,
        constraint "notifications_pkey" primary key ("id")
      );`
    );
    this.addSql(`create index "notifications_user_id_index" on "notifications" ("user_id");`);
    this.addSql(`create index "notifications_created_at_index" on "notifications" ("created_at");`);
    this.addSql(
      `alter table "notifications" add constraint "notifications_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;`
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "notifications" drop constraint "notifications_user_id_foreign";`);
    this.addSql(`drop table if exists "notifications" cascade;`);
  }
}
