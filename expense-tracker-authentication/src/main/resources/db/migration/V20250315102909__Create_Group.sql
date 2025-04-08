create table groups (
    id UUID NOT NULL,
    owner_email varchar(100) NOT NULL,
    schema_name varchar(100) NOT NULL
);

alter table groups add constraint pk_groups_id primary key (id);

alter table groups add constraint uk_owner_email_schema_name unique (owner_email, schema_name);
