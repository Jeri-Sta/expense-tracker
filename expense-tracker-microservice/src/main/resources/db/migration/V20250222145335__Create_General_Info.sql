create table general_info (
    id UUID NOT NULL,
    payment_day integer NOT NULL
);

alter table general_info add constraint pk_general_info_id primary key (id);
