alter table card drop closing_date;
alter table card add closing_day INTEGER NOT NULL DEFAULT 2;