create table income (
    id UUID NOT NULL,
    name varchar(100) NOT NULL,
    value numeric(19, 2),
    income_date date NOT NULL,
    created_by varchar(100) NOT NULL,
    last_modified_by varchar(100) NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

alter table income add constraint pk_income_id primary key (id);