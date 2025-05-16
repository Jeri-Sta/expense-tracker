create table general_info (
    id UUID NOT NULL,
    payment_day integer NOT NULL,
    user_id UUID NOT NULL,
    created_by varchar(100) NOT NULL,
    last_modified_by varchar(100) NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

alter table general_info add constraint pk_general_info_id primary key (id);