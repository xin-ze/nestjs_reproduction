--
-- Name: duplicate_users; Type: TABLE; Schema: public; Owner: jerry_test
-- Table only exists in Redshift
CREATE TABLE public.duplicate_users (
    user_id bigint NOT NULL,
    name character varying(200),
    ssn character varying(200),
    dl_num character varying(200),
    phone character varying(20),
    dob date,
    email character varying(200),
    signing_time timestamp with time zone NOT NULL
);

ALTER TABLE
    public.duplicate_users OWNER TO jerry_test;

--
-- Name: duplicate_users duplicate_users_pkey; Type: CONSTRAINT; Schema: public; Owner: jerry_test
--
ALTER TABLE
    ONLY public.duplicate_users
ADD
    CONSTRAINT duplicate_users_pkey PRIMARY KEY (user_id);

--
-- Name: connected_users; Type: TABLE; Schema: public; Owner: jerry_test
-- Table only exists in Redshift
CREATE TABLE public.connected_users (
    user_id bigint NOT NULL,
    initial_user_id bigint NOT NULL,
    connection_path text NOT NULL
);

ALTER TABLE
    public.connected_users OWNER TO jerry_test;
