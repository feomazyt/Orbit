import { Migration } from '@mikro-orm/migrations';

export class Migration20260220200914 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "users" ("id" uuid not null default gen_random_uuid(), "email" varchar(255) not null, "password_hash" text not null, "name" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "users_pkey" primary key ("id"));`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);

    this.addSql(`create table "boards" ("id" uuid not null default gen_random_uuid(), "owner_id" uuid not null, "title" varchar(255) not null, "description" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "boards_pkey" primary key ("id"));`);
    this.addSql(`create index "boards_owner_id_index" on "boards" ("owner_id");`);

    this.addSql(`create table "lists" ("id" uuid not null default gen_random_uuid(), "board_id" uuid not null, "title" varchar(255) not null, "position" numeric(10,2) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "lists_pkey" primary key ("id"));`);
    this.addSql(`create index "lists_board_id_index" on "lists" ("board_id");`);

    this.addSql(`create table "cards" ("id" uuid not null default gen_random_uuid(), "list_id" uuid not null, "title" varchar(255) not null, "description" text null, "position" numeric(10,2) not null, "due_date" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "cards_pkey" primary key ("id"));`);
    this.addSql(`create index "cards_list_id_index" on "cards" ("list_id");`);

    this.addSql(`create table "card_comments" ("id" uuid not null default gen_random_uuid(), "card_id" uuid not null, "user_id" uuid not null, "content" text not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "card_comments_pkey" primary key ("id"));`);
    this.addSql(`create index "card_comments_user_id_index" on "card_comments" ("user_id");`);
    this.addSql(`create index "card_comments_card_id_index" on "card_comments" ("card_id");`);

    this.addSql(`alter table "boards" add constraint "boards_owner_id_foreign" foreign key ("owner_id") references "users" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "lists" add constraint "lists_board_id_foreign" foreign key ("board_id") references "boards" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "cards" add constraint "cards_list_id_foreign" foreign key ("list_id") references "lists" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "card_comments" add constraint "card_comments_card_id_foreign" foreign key ("card_id") references "cards" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "card_comments" add constraint "card_comments_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "boards" drop constraint "boards_owner_id_foreign";`);

    this.addSql(`alter table "card_comments" drop constraint "card_comments_user_id_foreign";`);

    this.addSql(`alter table "lists" drop constraint "lists_board_id_foreign";`);

    this.addSql(`alter table "cards" drop constraint "cards_list_id_foreign";`);

    this.addSql(`alter table "card_comments" drop constraint "card_comments_card_id_foreign";`);

    this.addSql(`drop table if exists "users" cascade;`);

    this.addSql(`drop table if exists "boards" cascade;`);

    this.addSql(`drop table if exists "lists" cascade;`);

    this.addSql(`drop table if exists "cards" cascade;`);

    this.addSql(`drop table if exists "card_comments" cascade;`);
  }

}
