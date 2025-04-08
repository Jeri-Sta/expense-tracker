create table card (
    id UUID NOT NULL,
    bank UUID NOT NULL,
    card_limit numeric(19, 2) NOT NULL,
    closing_date date NOT NULL
);

alter table card add constraint pk_card_id primary key (id);

alter table card add foreign key (bank) references bank (id);