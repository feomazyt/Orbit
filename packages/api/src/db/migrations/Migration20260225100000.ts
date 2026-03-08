import { Migration } from '@mikro-orm/migrations';

export class Migration20260225100000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "cards" add column "type" varchar(255) not null default 'task';`
    );

    this.addSql(
      `create table "card_assignees" (
        "id" uuid not null default gen_random_uuid(),
        "card_id" uuid not null,
        "user_id" uuid not null,
        constraint "card_assignees_pkey" primary key ("id")
      );`
    );
    this.addSql(`create index "card_assignees_card_id_index" on "card_assignees" ("card_id");`);
    this.addSql(`create index "card_assignees_user_id_index" on "card_assignees" ("user_id");`);
    this.addSql(
      `alter table "card_assignees" add constraint "card_assignees_card_id_user_id_unique" unique ("card_id", "user_id");`
    );
    this.addSql(
      `alter table "card_assignees" add constraint "card_assignees_card_id_foreign" foreign key ("card_id") references "cards" ("id") on update cascade on delete cascade;`
    );
    this.addSql(
      `alter table "card_assignees" add constraint "card_assignees_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;`
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "card_assignees" drop constraint "card_assignees_user_id_foreign";`);
    this.addSql(`alter table "card_assignees" drop constraint "card_assignees_card_id_foreign";`);
    this.addSql(`alter table "card_assignees" drop constraint "card_assignees_card_id_user_id_unique";`);
    this.addSql(`drop table if exists "card_assignees" cascade;`);
    this.addSql(`alter table "cards" drop column "type";`);
  }
}
