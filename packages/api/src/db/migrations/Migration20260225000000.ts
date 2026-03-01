import { Migration } from '@mikro-orm/migrations';

export class Migration20260225000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "boards" add column "type" varchar(255) not null default 'kanban', add column "priority_level" smallint not null default 0;`
    );

    this.addSql(
      `create table "board_members" (
        "id" uuid not null default gen_random_uuid(),
        "board_id" uuid not null,
        "user_id" uuid not null,
        "role" varchar(255) not null default 'member',
        "is_favourite" boolean not null default false,
        "created_at" timestamptz not null,
        constraint "board_members_pkey" primary key ("id")
      );`
    );
    this.addSql(`create index "board_members_board_id_index" on "board_members" ("board_id");`);
    this.addSql(`create index "board_members_user_id_index" on "board_members" ("user_id");`);
    this.addSql(
      `alter table "board_members" add constraint "board_members_board_id_user_id_unique" unique ("board_id", "user_id");`
    );
    this.addSql(
      `alter table "board_members" add constraint "board_members_board_id_foreign" foreign key ("board_id") references "boards" ("id") on update cascade on delete cascade;`
    );
    this.addSql(
      `alter table "board_members" add constraint "board_members_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;`
    );

    // Backfill: add owner as board_member with role 'owner' for all existing boards
    this.addSql(
      `insert into "board_members" ("board_id", "user_id", "role", "is_favourite", "created_at")
       select "id", "owner_id", 'owner', false, "created_at" from "boards";`
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "board_members" drop constraint "board_members_user_id_foreign";`);
    this.addSql(`alter table "board_members" drop constraint "board_members_board_id_foreign";`);
    this.addSql(`alter table "board_members" drop constraint "board_members_board_id_user_id_unique";`);
    this.addSql(`drop table if exists "board_members" cascade;`);

    this.addSql(`alter table "boards" drop column "type", drop column "priority_level";`);
  }
}
