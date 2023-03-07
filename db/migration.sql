CREATE TABLE IF NOT EXISTS public.companies (
    id integer NOT NULL DEFAULT nextval('companies_id_seq'::regclass),
    name character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT companies_pkey PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS public.videogames (
    id integer NOT NULL DEFAULT nextval('videogames_id_seq'::regclass),
    name character varying(255) COLLATE pg_catalog."default",
    company_id integer,
    year date,
    CONSTRAINT videogames_pkey PRIMARY KEY (id),
    CONSTRAINT company_fk FOREIGN KEY (company_id) REFERENCES public.companies (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION NOT VALID
);