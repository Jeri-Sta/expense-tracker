create table card (
    id UUID NOT NULL,
    bank UUID NOT NULL,
    card_limit numeric(19, 2) NOT NULL,
    closing_day integer NOT NULL,
    created_by varchar(100) NOT NULL,
    last_modified_by varchar(100) NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

alter table card add constraint pk_card_id primary key (id);

alter table card add foreign key (bank) references bank (id);