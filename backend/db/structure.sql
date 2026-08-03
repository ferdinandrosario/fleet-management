SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: btree_gist; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;


--
-- Name: EXTENSION btree_gist; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION btree_gist IS 'support for indexing common datatypes in GiST';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ar_internal_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ar_internal_metadata (
    key character varying NOT NULL,
    value character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: one_time_passwords; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.one_time_passwords (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    code_digest character varying NOT NULL,
    expires_at timestamp(6) without time zone NOT NULL,
    consumed_at timestamp(6) without time zone,
    attempts integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: one_time_passwords_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.one_time_passwords_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: one_time_passwords_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.one_time_passwords_id_seq OWNED BY public.one_time_passwords.id;


--
-- Name: owners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.owners (
    id bigint NOT NULL,
    uuid uuid NOT NULL,
    name character varying NOT NULL,
    slug character varying NOT NULL,
    status integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: owners_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.owners_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: owners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.owners_id_seq OWNED BY public.owners.id;


--
-- Name: plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plans (
    id bigint NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    tier integer DEFAULT 0 NOT NULL,
    price_paise integer DEFAULT 0 NOT NULL,
    "interval" integer DEFAULT 0 NOT NULL,
    limits jsonb DEFAULT '{}'::jsonb NOT NULL,
    razorpay_plan_id character varying,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: plans_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.plans_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.plans_id_seq OWNED BY public.plans.id;


--
-- Name: pricing_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pricing_rules (
    id bigint NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    vehicle_id bigint NOT NULL,
    min_duration_hours integer DEFAULT 0 NOT NULL,
    discount_percentage numeric(5,2) DEFAULT 0.0 NOT NULL,
    override_hourly_rate_cents integer,
    override_daily_rate_cents integer,
    start_date date,
    end_date date,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: pricing_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pricing_rules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pricing_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pricing_rules_id_seq OWNED BY public.pricing_rules.id;


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    jti character varying NOT NULL,
    family character varying NOT NULL,
    expires_at timestamp(6) without time zone NOT NULL,
    revoked_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id bigint NOT NULL,
    uuid uuid NOT NULL,
    owner_id bigint NOT NULL,
    status integer DEFAULT 0 NOT NULL,
    razorpay_subscription_id character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    plan_id bigint
);


--
-- Name: subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subscriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subscriptions_id_seq OWNED BY public.subscriptions.id;


--
-- Name: super_admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.super_admins (
    id bigint NOT NULL,
    uuid uuid NOT NULL,
    email character varying NOT NULL,
    password_digest character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: super_admins_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.super_admins_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: super_admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.super_admins_id_seq OWNED BY public.super_admins.id;


--
-- Name: tenant_registries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenant_registries (
    id bigint NOT NULL,
    owner_id bigint NOT NULL,
    slug character varying NOT NULL,
    schema_name character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: tenant_registries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tenant_registries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tenant_registries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tenant_registries_id_seq OWNED BY public.tenant_registries.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    phone character varying NOT NULL,
    role integer DEFAULT 0 NOT NULL,
    password_digest character varying NOT NULL,
    phone_verified_at timestamp(6) without time zone,
    locale character varying DEFAULT 'en'::character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vehicle_availabilities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicle_availabilities (
    id bigint NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    vehicle_id bigint NOT NULL,
    start_time timestamp(6) without time zone NOT NULL,
    end_time timestamp(6) without time zone NOT NULL,
    reason integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: vehicle_availabilities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vehicle_availabilities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vehicle_availabilities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vehicle_availabilities_id_seq OWNED BY public.vehicle_availabilities.id;


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicles (
    id bigint NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    category integer DEFAULT 0 NOT NULL,
    registration_number character varying NOT NULL,
    model_year integer,
    hourly_rate_cents integer DEFAULT 0 NOT NULL,
    daily_rate_cents integer DEFAULT 0 NOT NULL,
    status integer DEFAULT 0 NOT NULL,
    specs jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vehicles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vehicles_id_seq OWNED BY public.vehicles.id;


--
-- Name: one_time_passwords id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.one_time_passwords ALTER COLUMN id SET DEFAULT nextval('public.one_time_passwords_id_seq'::regclass);


--
-- Name: owners id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owners ALTER COLUMN id SET DEFAULT nextval('public.owners_id_seq'::regclass);


--
-- Name: plans id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plans ALTER COLUMN id SET DEFAULT nextval('public.plans_id_seq'::regclass);


--
-- Name: pricing_rules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_rules ALTER COLUMN id SET DEFAULT nextval('public.pricing_rules_id_seq'::regclass);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- Name: subscriptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions ALTER COLUMN id SET DEFAULT nextval('public.subscriptions_id_seq'::regclass);


--
-- Name: super_admins id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.super_admins ALTER COLUMN id SET DEFAULT nextval('public.super_admins_id_seq'::regclass);


--
-- Name: tenant_registries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_registries ALTER COLUMN id SET DEFAULT nextval('public.tenant_registries_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vehicle_availabilities id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_availabilities ALTER COLUMN id SET DEFAULT nextval('public.vehicle_availabilities_id_seq'::regclass);


--
-- Name: vehicles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles ALTER COLUMN id SET DEFAULT nextval('public.vehicles_id_seq'::regclass);


--
-- Name: ar_internal_metadata ar_internal_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);


--
-- Name: one_time_passwords one_time_passwords_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.one_time_passwords
    ADD CONSTRAINT one_time_passwords_pkey PRIMARY KEY (id);


--
-- Name: owners owners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.owners
    ADD CONSTRAINT owners_pkey PRIMARY KEY (id);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: pricing_rules pricing_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_rules
    ADD CONSTRAINT pricing_rules_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: super_admins super_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.super_admins
    ADD CONSTRAINT super_admins_pkey PRIMARY KEY (id);


--
-- Name: tenant_registries tenant_registries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_registries
    ADD CONSTRAINT tenant_registries_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vehicle_availabilities vehicle_availabilities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_availabilities
    ADD CONSTRAINT vehicle_availabilities_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: idx_vehicle_avail_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vehicle_avail_lookup ON public.vehicle_availabilities USING btree (vehicle_id, start_time, end_time);


--
-- Name: index_one_time_passwords_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_one_time_passwords_on_user_id ON public.one_time_passwords USING btree (user_id);


--
-- Name: index_owners_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_owners_on_slug ON public.owners USING btree (slug);


--
-- Name: index_owners_on_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_owners_on_status ON public.owners USING btree (status);


--
-- Name: index_owners_on_uuid; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_owners_on_uuid ON public.owners USING btree (uuid);


--
-- Name: index_plans_on_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_plans_on_active ON public.plans USING btree (active);


--
-- Name: index_plans_on_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_plans_on_name ON public.plans USING btree (name);


--
-- Name: index_plans_on_uuid; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_plans_on_uuid ON public.plans USING btree (uuid);


--
-- Name: index_pricing_rules_on_uuid; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_pricing_rules_on_uuid ON public.pricing_rules USING btree (uuid);


--
-- Name: index_pricing_rules_on_vehicle_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_pricing_rules_on_vehicle_id ON public.pricing_rules USING btree (vehicle_id);


--
-- Name: index_refresh_tokens_on_family; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_refresh_tokens_on_family ON public.refresh_tokens USING btree (family);


--
-- Name: index_refresh_tokens_on_jti; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_refresh_tokens_on_jti ON public.refresh_tokens USING btree (jti);


--
-- Name: index_refresh_tokens_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_refresh_tokens_on_user_id ON public.refresh_tokens USING btree (user_id);


--
-- Name: index_subscriptions_on_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_subscriptions_on_owner_id ON public.subscriptions USING btree (owner_id);


--
-- Name: index_subscriptions_on_plan_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_subscriptions_on_plan_id ON public.subscriptions USING btree (plan_id);


--
-- Name: index_subscriptions_on_razorpay_subscription_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_subscriptions_on_razorpay_subscription_id ON public.subscriptions USING btree (razorpay_subscription_id) WHERE (razorpay_subscription_id IS NOT NULL);


--
-- Name: index_subscriptions_on_uuid; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_subscriptions_on_uuid ON public.subscriptions USING btree (uuid);


--
-- Name: index_super_admins_on_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_super_admins_on_email ON public.super_admins USING btree (email);


--
-- Name: index_super_admins_on_uuid; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_super_admins_on_uuid ON public.super_admins USING btree (uuid);


--
-- Name: index_tenant_registries_on_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_tenant_registries_on_owner_id ON public.tenant_registries USING btree (owner_id);


--
-- Name: index_tenant_registries_on_schema_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_tenant_registries_on_schema_name ON public.tenant_registries USING btree (schema_name);


--
-- Name: index_tenant_registries_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_tenant_registries_on_slug ON public.tenant_registries USING btree (slug);


--
-- Name: index_users_on_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_phone ON public.users USING btree (phone);


--
-- Name: index_users_on_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_role ON public.users USING btree (role);


--
-- Name: index_users_on_uuid; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_uuid ON public.users USING btree (uuid);


--
-- Name: index_vehicle_availabilities_on_uuid; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_vehicle_availabilities_on_uuid ON public.vehicle_availabilities USING btree (uuid);


--
-- Name: index_vehicle_availabilities_on_vehicle_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_vehicle_availabilities_on_vehicle_id ON public.vehicle_availabilities USING btree (vehicle_id);


--
-- Name: index_vehicles_on_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_vehicles_on_category ON public.vehicles USING btree (category);


--
-- Name: index_vehicles_on_registration_number; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_vehicles_on_registration_number ON public.vehicles USING btree (registration_number);


--
-- Name: index_vehicles_on_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_vehicles_on_status ON public.vehicles USING btree (status);


--
-- Name: index_vehicles_on_uuid; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_vehicles_on_uuid ON public.vehicles USING btree (uuid);


--
-- Name: refresh_tokens fk_rails_279e9a0091; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT fk_rails_279e9a0091 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: pricing_rules fk_rails_3e9d476c18; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_rules
    ADD CONSTRAINT fk_rails_3e9d476c18 FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE CASCADE;


--
-- Name: subscriptions fk_rails_63d3df128b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT fk_rails_63d3df128b FOREIGN KEY (plan_id) REFERENCES public.plans(id);


--
-- Name: tenant_registries fk_rails_7bbfaabe01; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_registries
    ADD CONSTRAINT fk_rails_7bbfaabe01 FOREIGN KEY (owner_id) REFERENCES public.owners(id);


--
-- Name: subscriptions fk_rails_9fa38fb931; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT fk_rails_9fa38fb931 FOREIGN KEY (owner_id) REFERENCES public.owners(id);


--
-- Name: one_time_passwords fk_rails_afd10ae0cb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.one_time_passwords
    ADD CONSTRAINT fk_rails_afd10ae0cb FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: vehicle_availabilities fk_rails_ebe45553c7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_availabilities
    ADD CONSTRAINT fk_rails_ebe45553c7 FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

SET search_path TO "$user", public;

INSERT INTO "schema_migrations" (version) VALUES
('20260616000011'),
('20260616000010'),
('20260616000009'),
('20260616000008'),
('20260616000007'),
('20260616000006'),
('20260616000005'),
('20260616000004'),
('20260616000003'),
('20260616000002'),
('20260616000001');

