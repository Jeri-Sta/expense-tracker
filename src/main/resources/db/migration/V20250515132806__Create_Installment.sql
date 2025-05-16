create table installment (
    id UUID NOT NULL,
    installment_number integer NOT NULL,
    installment_date date NOT NULL,
    expense UUID NOT NULL,
    card UUID NOT NULL,
    value numeric(19, 2),
    created_by varchar(100) NOT NULL,
    last_modified_by varchar(100) NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

alter table installment add constraint pk_installment_id primary key (id);

alter table installment add foreign key (expense) references expense (id) on delete cascade;
alter table installment add foreign key (card) references card (id);

alter table installment add constraint uk_installment_number_date_expense_card unique (installment_number, installment_date, expense, card);