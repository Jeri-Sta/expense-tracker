create table bank (
    id UUID NOT NULL,
    name varchar(100) NOT NULL,
    balance numeric(19, 2) NOT NULL,
    created_by varchar(100) NOT NULL,
    last_modified_by varchar(100) NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

alter table bank add constraint pk_bank_id primary key (id);

alter table bank add constraint uk_bank_name unique (name);