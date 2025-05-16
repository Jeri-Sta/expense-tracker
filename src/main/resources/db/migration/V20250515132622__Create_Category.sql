create table category (
    id UUID NOT NULL,
    name varchar(100) NOT NULL,
    color varchar(7),
    fixed_expense bool NOT NULL,
    created_by varchar(100) NOT NULL,
    last_modified_by varchar(100) NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

alter table category add constraint pk_category_id primary key (id);
alter table category add constraint uk_category_name unique (name);