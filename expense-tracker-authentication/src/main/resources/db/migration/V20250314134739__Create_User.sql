create table users (
    id UUID NOT NULL,
    name varchar(100) NOT NULL,
    email varchar(200) NOT NULL,
    password varchar(100) NOT NULL
);

alter table users add constraint pk_users_id primary key (id);

alter table users add constraint uk_users_email unique (email);