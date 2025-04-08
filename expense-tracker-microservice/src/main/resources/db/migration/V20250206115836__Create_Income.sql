create table income (
    id UUID NOT NULL,
    name varchar(100) NOT NULL,
    value numeric(19, 2)
);

alter table income add constraint pk_income_id primary key (id);
