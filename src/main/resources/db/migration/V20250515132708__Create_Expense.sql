create table expense (
    id UUID NOT NULL,
    name varchar(100) NOT NULL,
    category UUID,
    card UUID,
    value numeric(19, 2),
    installments int,
    expense_date date NOT NULL,
    created_by varchar(100) NOT NULL,
    last_modified_by varchar(100) NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

alter table expense add constraint pk_expense_id primary key (id);

alter table expense add foreign key (category) references category (id);
alter table expense add foreign key (card) references card (id);