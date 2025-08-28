--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-08-28 11:54:07

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
-- TOC entry 5043 (class 1262 OID 16417)
-- Name: rlbl; Type: DATABASE; Schema: -; Owner: postgres
--





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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 236 (class 1259 OID 16603)
-- Name: bracket; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bracket (
    id integer NOT NULL,
    season_id integer,
    round_name character varying(255),
    matchup_data jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- TOC entry 235 (class 1259 OID 16602)
-- Name: bracket_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.bracket ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.bracket_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 228 (class 1259 OID 16491)
-- Name: games; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.games (
    id integer NOT NULL,
    season_id integer NOT NULL,
    home_team_season_id integer NOT NULL,
    away_team_season_id integer NOT NULL,
    home_score integer DEFAULT 0,
    away_score integer DEFAULT 0,
    game_date timestamp without time zone,
    week integer,
    is_playoffs boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT games_check CHECK ((home_team_season_id <> away_team_season_id))
);



--
-- TOC entry 227 (class 1259 OID 16490)
-- Name: games_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.games ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.games_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 230 (class 1259 OID 16520)
-- Name: player_game_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.player_game_stats (
    id integer NOT NULL,
    game_id integer NOT NULL,
    player_id integer NOT NULL,
    team_season_id integer NOT NULL,
    points integer DEFAULT 0,
    goals integer DEFAULT 0,
    assists integer DEFAULT 0,
    saves integer DEFAULT 0,
    shots integer DEFAULT 0,
    mvps integer DEFAULT 0,
    demos integer DEFAULT 0,
    epic_saves integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- TOC entry 229 (class 1259 OID 16519)
-- Name: player_game_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.player_game_stats ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.player_game_stats_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 224 (class 1259 OID 16461)
-- Name: players; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.players (
    id integer NOT NULL,
    player_name character varying(255) NOT NULL,
    gamertag character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- TOC entry 223 (class 1259 OID 16460)
-- Name: players_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.players ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.players_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 234 (class 1259 OID 16581)
-- Name: power_rankings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.power_rankings (
    id integer NOT NULL,
    season_id integer NOT NULL,
    team_season_id integer NOT NULL,
    week integer NOT NULL,
    rank integer NOT NULL,
    reasoning text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- TOC entry 233 (class 1259 OID 16580)
-- Name: power_rankings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.power_rankings ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.power_rankings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 226 (class 1259 OID 16471)
-- Name: roster_memberships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roster_memberships (
    id integer NOT NULL,
    player_id integer NOT NULL,
    team_season_id integer NOT NULL
);



--
-- TOC entry 225 (class 1259 OID 16470)
-- Name: roster_memberships_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.roster_memberships ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.roster_memberships_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 218 (class 1259 OID 16419)
-- Name: seasons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seasons (
    id integer NOT NULL,
    season_name character varying(255) NOT NULL,
    start_date date,
    end_date date,
    is_active boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- TOC entry 217 (class 1259 OID 16418)
-- Name: seasons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.seasons ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.seasons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 232 (class 1259 OID 16555)
-- Name: standings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.standings (
    id integer NOT NULL,
    season_id integer NOT NULL,
    team_season_id integer NOT NULL,
    wins integer DEFAULT 0,
    losses integer DEFAULT 0,
    ties integer DEFAULT 0,
    points_for integer DEFAULT 0,
    points_against integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- TOC entry 231 (class 1259 OID 16554)
-- Name: standings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.standings ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.standings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 222 (class 1259 OID 16437)
-- Name: team_seasons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team_seasons (
    id integer NOT NULL,
    season_id integer NOT NULL,
    team_id integer NOT NULL,
    display_name text,
    primary_color character varying(7),
    secondary_color character varying(7),
    alt_logo_url character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ranking integer
);



--
-- TOC entry 221 (class 1259 OID 16436)
-- Name: team_seasons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.team_seasons ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.team_seasons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 220 (class 1259 OID 16427)
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    team_name character varying(255) NOT NULL,
    logo_url character varying(500),
    color character varying(7),
    secondary_color character varying(7),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- TOC entry 219 (class 1259 OID 16426)
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.teams ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.teams_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 5037 (class 0 OID 16603)
-- Dependencies: 236
-- Data for Name: bracket; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5029 (class 0 OID 16491)
-- Dependencies: 228
-- Data for Name: games; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5031 (class 0 OID 16520)
-- Dependencies: 230
-- Data for Name: player_game_stats; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5025 (class 0 OID 16461)
-- Dependencies: 224
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (1, 'Austin', 'austin', '2025-08-27 16:54:37.516604', '2025-08-27 16:54:37.516604') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (2, 'Keough', 'keough', '2025-08-27 16:54:37.522784', '2025-08-27 16:54:37.522784') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (3, 'Gup', 'gup', '2025-08-27 16:54:37.524604', '2025-08-27 16:54:37.524604') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (4, 'Sam', 'sam', '2025-08-27 16:54:37.525821', '2025-08-27 16:54:37.525821') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (5, 'Jake C.', 'jake_c.', '2025-08-27 16:54:37.526844', '2025-08-27 16:54:37.526844') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (6, 'Jake W.', 'jake_w.', '2025-08-27 16:54:37.52767', '2025-08-27 16:54:37.52767') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (7, 'A Rob', 'a_rob', '2025-08-27 16:54:37.528698', '2025-08-27 16:54:37.528698') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (8, 'Alex', 'alex', '2025-08-27 16:54:37.529456', '2025-08-27 16:54:37.529456') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (9, 'JohnnyG', 'johnnyg', '2025-08-27 16:54:37.529984', '2025-08-27 16:54:37.529984') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (10, 'Mason', 'mason', '2025-08-27 16:54:37.530506', '2025-08-27 16:54:37.530506') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (11, 'Dylan', 'dylan', '2025-08-27 16:54:37.530896', '2025-08-27 16:54:37.530896') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (12, 'Ben', 'ben', '2025-08-27 16:54:37.531227', '2025-08-27 16:54:37.531227') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (13, 'Pup*', 'pup*', '2025-08-27 16:54:37.531926', '2025-08-27 16:54:37.531926') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (14, 'Jack P*', 'jack_p*', '2025-08-27 16:54:37.532601', '2025-08-27 16:54:37.532601') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (15, 'Owen*', 'owen*', '2025-08-27 16:54:37.533323', '2025-08-27 16:54:37.533323') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (16, 'Vince', 'vince', '2025-08-27 16:54:37.534261', '2025-08-27 16:54:37.534261') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (17, 'Stan', 'stan', '2025-08-27 16:54:37.535472', '2025-08-27 16:54:37.535472') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (18, 'John C.', 'john_c.', '2025-08-27 16:54:37.536764', '2025-08-27 16:54:37.536764') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (19, 'Robert', 'robert', '2025-08-27 16:54:37.537286', '2025-08-27 16:54:37.537286') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (20, 'Quinn', 'quinn', '2025-08-27 16:54:37.537809', '2025-08-27 16:54:37.537809') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (21, 'Big Nick', 'big_nick', '2025-08-27 16:54:37.538405', '2025-08-27 16:54:37.538405') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (22, 'Dundee', 'dundee', '2025-08-27 16:54:37.538851', '2025-08-27 16:54:37.538851') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (23, 'Erica', 'erica', '2025-08-27 16:54:37.539232', '2025-08-27 16:54:37.539232') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (24, 'Collin*', 'collin*', '2025-08-27 16:54:37.53967', '2025-08-27 16:54:37.53967') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (25, 'Bogey', 'bogey', '2025-08-27 16:54:37.540008', '2025-08-27 16:54:37.540008') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (26, 'Ethan*', 'ethan*', '2025-08-27 16:54:37.540291', '2025-08-27 16:54:37.540291') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (27, 'Jack W', 'jack_w', '2025-08-27 16:54:37.540555', '2025-08-27 16:54:37.540555') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (28, 'Mario*', 'mario*', '2025-08-27 16:54:37.540808', '2025-08-27 16:54:37.540808') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (29, 'Tyler', 'tyler', '2025-08-28 11:35:11.46114', '2025-08-28 11:35:11.46114') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (30, 'Matt S', 'matt_s', '2025-08-28 11:35:11.470835', '2025-08-28 11:35:11.470835') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (31, 'Nathan', 'nathan', '2025-08-28 11:35:11.473488', '2025-08-28 11:35:11.473488') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (32, 'Jared', 'jared', '2025-08-28 11:35:11.477031', '2025-08-28 11:35:11.477031') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (33, 'Jax', 'jax', '2025-08-28 11:35:11.479379', '2025-08-28 11:35:11.479379') ON CONFLICT DO NOTHING;
INSERT INTO public.players OVERRIDING SYSTEM VALUE VALUES (34, 'Nick B', 'nick_b', '2025-08-28 11:35:11.480568', '2025-08-28 11:35:11.480568') ON CONFLICT DO NOTHING;


--
-- TOC entry 5035 (class 0 OID 16581)
-- Dependencies: 234
-- Data for Name: power_rankings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5027 (class 0 OID 16471)
-- Dependencies: 226
-- Data for Name: roster_memberships; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (1, 1, 8) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (2, 2, 8) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (3, 3, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (4, 4, 2) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (5, 5, 7) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (6, 6, 7) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (7, 7, 11) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (8, 8, 11) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (9, 9, 9) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (10, 10, 9) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (11, 11, 12) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (12, 12, 12) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (13, 13, 6) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (14, 14, 6) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (15, 15, 4) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (16, 16, 4) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (17, 17, 3) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (18, 18, 3) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (19, 19, 5) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (20, 20, 5) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (21, 21, 10) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (22, 22, 10) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (23, 25, 14) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (24, 26, 14) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (25, 27, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (26, 28, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (27, 23, 13) ON CONFLICT DO NOTHING;
INSERT INTO public.roster_memberships OVERRIDING SYSTEM VALUE VALUES (28, 24, 13) ON CONFLICT DO NOTHING;


--
-- TOC entry 5019 (class 0 OID 16419)
-- Dependencies: 218
-- Data for Name: seasons; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.seasons OVERRIDING SYSTEM VALUE VALUES (1, 'Fall 2024', '2024-10-28', '2024-12-22', false, '2025-08-28 09:51:23.691679') ON CONFLICT DO NOTHING;
INSERT INTO public.seasons OVERRIDING SYSTEM VALUE VALUES (2, 'Summer 2025', '2025-06-02', '2025-07-27', false, '2025-08-28 09:52:24.662715') ON CONFLICT DO NOTHING;
INSERT INTO public.seasons OVERRIDING SYSTEM VALUE VALUES (3, 'Fall 2025', '2025-09-08', '2025-11-02', false, '2025-08-28 09:52:50.944589') ON CONFLICT DO NOTHING;


--
-- TOC entry 5033 (class 0 OID 16555)
-- Dependencies: 232
-- Data for Name: standings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5023 (class 0 OID 16437)
-- Dependencies: 222
-- Data for Name: team_seasons; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (1, 3, 1, 'Nukes', '#808080', '#000000', NULL, '2025-08-27 16:54:37.515505', '2025-08-27 16:54:37.515505', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (2, 3, 2, 'Backdoor Bandits', '#FFFFFF', '#8B4513', NULL, '2025-08-27 16:54:37.492278', '2025-08-27 16:54:37.492278', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (3, 3, 3, 'LeJohn James', '#FFD700', '#800080', NULL, '2025-08-27 16:54:37.502437', '2025-08-27 16:54:37.502437', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (4, 3, 4, 'Vince Owen', '#00FF00', '#FFFF00', NULL, '2025-08-27 16:54:37.505599', '2025-08-27 16:54:37.505599', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (5, 3, 5, 'Cancun Baboons', '#00FF00', '#FF0000', NULL, '2025-08-27 16:54:37.507101', '2025-08-27 16:54:37.507101', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (6, 3, 6, 'Brain Aneurysm', '#808080', '#FFA500', NULL, '2025-08-27 16:54:37.508154', '2025-08-27 16:54:37.508154', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (7, 3, 7, 'Jakeing It!', '#000000', '#00FF00', NULL, '2025-08-27 16:54:37.509079', '2025-08-27 16:54:37.509079', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (8, 3, 8, 'Mid Boost', '#FFC0CB', '#ADD8E6', NULL, '2025-08-27 16:54:37.509856', '2025-08-27 16:54:37.509856', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (9, 3, 9, 'MJ', '#00FF00', '#000000', NULL, '2025-08-27 16:54:37.510544', '2025-08-27 16:54:37.510544', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (10, 3, 10, 'Nick Al Nite', '#FFA500', '#000000', NULL, '2025-08-27 16:54:37.511305', '2025-08-27 16:54:37.511305', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (11, 3, 11, 'A-Arob', '#000000', '#ADD8E6', NULL, '2025-08-27 16:54:37.51258', '2025-08-27 16:54:37.51258', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (12, 3, 12, 'Otters', '#000000', '#0000FF', NULL, '2025-08-27 16:54:37.513497', '2025-08-27 16:54:37.513497', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (13, 3, 13, 'Demo Daddies', '#000000', '#808080', NULL, '2025-08-27 16:54:37.514201', '2025-08-27 16:54:37.514201', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (14, 3, 14, 'Double Bogey', '#FFFFFF', '#FF0000', NULL, '2025-08-27 16:54:37.514837', '2025-08-27 16:54:37.514837', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (15, 1, 15, 'John & Tyler', '#699553', '#000000', NULL, '2025-08-28 11:33:00.71552', '2025-08-28 11:33:00.71552', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (16, 2, 15, 'John & Tyler', '#699553', '#000000', NULL, '2025-08-28 11:33:00.724175', '2025-08-28 11:33:00.724175', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (17, 1, 16, 'Style Boyz', '#ad5c3f', '#000000', NULL, '2025-08-28 11:33:00.727163', '2025-08-28 11:33:00.727163', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (18, 2, 16, 'Style Boyz', '#ad5c3f', '#000000', NULL, '2025-08-28 11:33:00.728629', '2025-08-28 11:33:00.728629', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (19, 1, 17, 'Drunken Goats', '#1163ae', '#000000', NULL, '2025-08-28 11:33:00.72994', '2025-08-28 11:33:00.72994', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (20, 2, 17, 'Drunken Goats', '#1163ae', '#000000', NULL, '2025-08-28 11:33:00.732176', '2025-08-28 11:33:00.732176', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (21, 1, 18, 'Non Chalant', '#e5c00d', '#000000', NULL, '2025-08-28 11:33:00.735056', '2025-08-28 11:33:00.735056', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (22, 2, 18, 'Non Chalant', '#e5c00d', '#000000', NULL, '2025-08-28 11:33:00.737386', '2025-08-28 11:33:00.737386', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (23, 1, 19, 'Overdosed Otters', '#539550', '#000000', NULL, '2025-08-28 11:33:00.739545', '2025-08-28 11:33:00.739545', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (24, 2, 19, 'Overdosed Otters', '#539550', '#000000', NULL, '2025-08-28 11:33:00.741914', '2025-08-28 11:33:00.741914', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (25, 1, 20, 'Chicken Jockeys', '#32499e', '#000000', NULL, '2025-08-28 11:33:00.743637', '2025-08-28 11:33:00.743637', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (26, 2, 20, 'Chicken Jockeys', '#32499e', '#000000', NULL, '2025-08-28 11:33:00.746013', '2025-08-28 11:33:00.746013', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (27, 1, 21, 'Pen15 Club', '#d1cdce', '#000000', NULL, '2025-08-28 11:33:00.747752', '2025-08-28 11:33:00.747752', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (28, 2, 21, 'Pen15 Club', '#d1cdce', '#000000', NULL, '2025-08-28 11:33:00.748552', '2025-08-28 11:33:00.748552', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (29, 1, 22, 'Bronny James', '#a6c7df', '#000000', NULL, '2025-08-28 11:33:00.749319', '2025-08-28 11:33:00.749319', 0) ON CONFLICT DO NOTHING;
INSERT INTO public.team_seasons OVERRIDING SYSTEM VALUE VALUES (30, 2, 22, 'Bronny James', '#a6c7df', '#000000', NULL, '2025-08-28 11:33:00.75011', '2025-08-28 11:33:00.75011', 0) ON CONFLICT DO NOTHING;


--
-- TOC entry 5021 (class 0 OID 16427)
-- Dependencies: 220
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.teams OVERRIDING SYSTEM VALUE VALUES (1, 'Nukes', NULL, '#808080', '#000000', '2025-08-27 16:54:37.515505', '2025-08-27 16:54:37.515505') ON CONFLICT DO NOTHING;
INSERT INTO public.teams OVERRIDING SYSTEM VALUE VALUES (2, 'Backdoor Bandits', NULL, '#FFFFFF', '#8B4513', '2025-08-27 16:54:37.492278', '2025-08-27 16:54:37.492278') ON CONFLICT DO NOTHING;
INSERT INTO public.teams OVERRIDING SYSTEM VALUE VALUES (3, 'LeJohn James', NULL, '#FFD700', '#800080', '2025-08-27 16:54:37.502437', '2025-08-27 16:54:37.502437') ON CONFLICT DO NOTHING;
INSERT INTO public.teams OVERRIDING SYSTEM VALUE VALUES (4, 'Vince Owen', NULL, '#00FF00', '#FFFF00', '2025-08-27 16:54:37.505599', '2025-08-27 16:54:37.505599') ON CONFLICT DO NOTHING;
INSERT INTO public.teams OVERRIDING SYSTEM VALUE VALUES (5, 'Cancun Baboons', NULL, '#00FF00', '#FF0000', '2025-08-27 16:54:37.507101', '2025-08-27 16:54:37.507101') ON CONFLICT DO NOTHING;
INSERT INTO public.teams OVERRIDING SYSTEM VALUE VALUES (6, 'Brain Aneurysm', NULL, '#808080', '#FFA500', '2025-08-27 16:54:37.508154', '2025-08-27 16:54:37.508154') ON CONFLICT DO NOTHING;
INSERT INTO public.teams OVERRIDING SYSTEM VALUE VALUES (7, 'Jakeing It!', NULL, '#000000', '#00FF00', '2025-08-27 16:54:37.509079', '2025-08-27 16:54:37.509079') ON CONFLICT DO NOTHING;
INSERT INTO public.teams OVERRIDING SYSTEM VALUE VALUES (8, 'Mid Boost', NULL, '#FFC0CB', '#ADD8E6', '2025-08-27 16:54:37.509856', '2025-08-27 16:54:37.509856') ON CONFLICT DO NOTHING;
INSERT INTO public.teams OVERRIDING SYSTEM VALUE VALUES (9, 'MJ', NULL, '#00FF00', '#000000', '2025-08-27 16:54:37.510544', '2025-08-27 16:54:37.510544') ON CONFLICT DO NOTHING;
INSERT INTO public.teams OVERRIDING SYSTEM VALUE VALUES (10, 'Nick Al Nite', NULL, '#FFA500', '#000000', '2025-08-27 16:54:37.511305', '2025-08-27 16:54:37.511305') ON CONFLICT DO NOTHING;
INSERT INTO public.teams OVERRIDING SYSTEM VALUE VALUES (11, 'A-Arob', NULL, '#000000', '#ADD8E6', '2025-08-27 16:54:37.51258', '2025-08-27 16:54:37.51258') ON CONFLICT DO NOTHING;
INSERT INTO public.teams OVERRIDING SYSTEM VALUE VALUES (12, 'Otters', NULL, '#000000', '#0000FF', '2025-08-27 16:54:37.513497', '2025-08-27 16:54:37.513497') ON CONFLICT DO NOTHING;
INSERT INTO public.teams OVERRIDING SYSTEM VALUE VALUES (13, 'Demo Daddies', NULL, '#000000', '#808080', '2025-08-27 16:54:37.514201', '2025-08-27 16:54:37.514201') ON CONFLICT DO NOTHING;
INSERT INTO public.teams OVERRIDING SYSTEM VALUE VALUES (14, 'Double Bogey', NULL, '#FFFFFF', '#FF0000', '2025-08-27 16:54:37.514837', '2025-08-27 16:54:37.514837') ON CONFLICT DO NOTHING;
INSERT INTO public.teams OVERRIDING SYSTEM VALUE VALUES (15, 'John & Tyler', NULL, '#699553', '#000000', '2025-08-28 11:32:26.4181', '2025-08-28 11:32:26.4181') ON CONFLICT DO NOTHING;
INSERT INTO public.teams OVERRIDING SYSTEM VALUE VALUES (16, 'Style Boyz', NULL, '#ad5c3f', '#000000', '2025-08-28 11:32:26.427486', '2025-08-28 11:32:26.427486') ON CONFLICT DO NOTHING;
INSERT INTO public.teams OVERRIDING SYSTEM VALUE VALUES (17, 'Drunken Goats', NULL, '#1163ae', '#000000', '2025-08-28 11:32:26.42865', '2025-08-28 11:32:26.42865') ON CONFLICT DO NOTHING;
INSERT INTO public.teams OVERRIDING SYSTEM VALUE VALUES (18, 'Non Chalant', NULL, '#e5c00d', '#000000', '2025-08-28 11:32:26.42933', '2025-08-28 11:32:26.42933') ON CONFLICT DO NOTHING;
INSERT INTO public.teams OVERRIDING SYSTEM VALUE VALUES (19, 'Overdosed Otters', NULL, '#539550', '#000000', '2025-08-28 11:32:26.42999', '2025-08-28 11:32:26.42999') ON CONFLICT DO NOTHING;
INSERT INTO public.teams OVERRIDING SYSTEM VALUE VALUES (20, 'Chicken Jockeys', NULL, '#32499e', '#000000', '2025-08-28 11:32:26.430877', '2025-08-28 11:32:26.430877') ON CONFLICT DO NOTHING;
INSERT INTO public.teams OVERRIDING SYSTEM VALUE VALUES (21, 'Pen15 Club', NULL, '#d1cdce', '#000000', '2025-08-28 11:32:26.431776', '2025-08-28 11:32:26.431776') ON CONFLICT DO NOTHING;
INSERT INTO public.teams OVERRIDING SYSTEM VALUE VALUES (22, 'Bronny James', NULL, '#a6c7df', '#000000', '2025-08-28 11:32:26.433074', '2025-08-28 11:32:26.433074') ON CONFLICT DO NOTHING;


--
-- TOC entry 5044 (class 0 OID 0)
-- Dependencies: 235
-- Name: bracket_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bracket_id_seq', 1, false);


--
-- TOC entry 5045 (class 0 OID 0)
-- Dependencies: 227
-- Name: games_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.games_id_seq', 1, false);


--
-- TOC entry 5046 (class 0 OID 0)
-- Dependencies: 229
-- Name: player_game_stats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.player_game_stats_id_seq', 1, false);


--
-- TOC entry 5047 (class 0 OID 0)
-- Dependencies: 223
-- Name: players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.players_id_seq', 34, true);


--
-- TOC entry 5048 (class 0 OID 0)
-- Dependencies: 233
-- Name: power_rankings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.power_rankings_id_seq', 1, false);


--
-- TOC entry 5049 (class 0 OID 0)
-- Dependencies: 225
-- Name: roster_memberships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roster_memberships_id_seq', 28, true);


--
-- TOC entry 5050 (class 0 OID 0)
-- Dependencies: 217
-- Name: seasons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seasons_id_seq', 3, true);


--
-- TOC entry 5051 (class 0 OID 0)
-- Dependencies: 231
-- Name: standings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.standings_id_seq', 1, false);


--
-- TOC entry 5052 (class 0 OID 0)
-- Dependencies: 221
-- Name: team_seasons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.team_seasons_id_seq', 30, true);


--
-- TOC entry 5053 (class 0 OID 0)
-- Dependencies: 219
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teams_id_seq', 22, true);


--
-- TOC entry 4857 (class 2606 OID 16610)
-- Name: bracket bracket_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bracket
    ADD CONSTRAINT bracket_pkey PRIMARY KEY (id);


--
-- TOC entry 4835 (class 2606 OID 16500)
-- Name: games games_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_pkey PRIMARY KEY (id);


--
-- TOC entry 4843 (class 2606 OID 16535)
-- Name: player_game_stats player_game_stats_game_id_player_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_game_stats
    ADD CONSTRAINT player_game_stats_game_id_player_id_key UNIQUE (game_id, player_id);


--
-- TOC entry 4845 (class 2606 OID 16533)
-- Name: player_game_stats player_game_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_game_stats
    ADD CONSTRAINT player_game_stats_pkey PRIMARY KEY (id);


--
-- TOC entry 4829 (class 2606 OID 16469)
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- TOC entry 4853 (class 2606 OID 16588)
-- Name: power_rankings power_rankings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.power_rankings
    ADD CONSTRAINT power_rankings_pkey PRIMARY KEY (id);


--
-- TOC entry 4855 (class 2606 OID 16590)
-- Name: power_rankings power_rankings_season_id_week_team_season_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.power_rankings
    ADD CONSTRAINT power_rankings_season_id_week_team_season_id_key UNIQUE (season_id, week, team_season_id);


--
-- TOC entry 4831 (class 2606 OID 16477)
-- Name: roster_memberships roster_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roster_memberships
    ADD CONSTRAINT roster_memberships_pkey PRIMARY KEY (id);


--
-- TOC entry 4833 (class 2606 OID 16479)
-- Name: roster_memberships roster_memberships_player_id_team_season_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roster_memberships
    ADD CONSTRAINT roster_memberships_player_id_team_season_id_key UNIQUE (player_id, team_season_id);


--
-- TOC entry 4819 (class 2606 OID 16425)
-- Name: seasons seasons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seasons
    ADD CONSTRAINT seasons_pkey PRIMARY KEY (id);


--
-- TOC entry 4848 (class 2606 OID 16566)
-- Name: standings standings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.standings
    ADD CONSTRAINT standings_pkey PRIMARY KEY (id);


--
-- TOC entry 4850 (class 2606 OID 16568)
-- Name: standings standings_season_id_team_season_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.standings
    ADD CONSTRAINT standings_season_id_team_season_id_key UNIQUE (season_id, team_season_id);


--
-- TOC entry 4825 (class 2606 OID 16445)
-- Name: team_seasons team_seasons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_seasons
    ADD CONSTRAINT team_seasons_pkey PRIMARY KEY (id);


--
-- TOC entry 4827 (class 2606 OID 16447)
-- Name: team_seasons team_seasons_season_id_team_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_seasons
    ADD CONSTRAINT team_seasons_season_id_team_id_key UNIQUE (season_id, team_id);


--
-- TOC entry 4821 (class 2606 OID 16435)
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- TOC entry 4836 (class 1259 OID 16518)
-- Name: idx_games_away_ts; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_games_away_ts ON public.games USING btree (away_team_season_id);


--
-- TOC entry 4837 (class 1259 OID 16517)
-- Name: idx_games_home_ts; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_games_home_ts ON public.games USING btree (home_team_season_id);


--
-- TOC entry 4838 (class 1259 OID 16516)
-- Name: idx_games_season_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_games_season_date ON public.games USING btree (season_id, game_date);


--
-- TOC entry 4839 (class 1259 OID 16551)
-- Name: idx_pgs_game; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pgs_game ON public.player_game_stats USING btree (game_id);


--
-- TOC entry 4840 (class 1259 OID 16552)
-- Name: idx_pgs_player; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pgs_player ON public.player_game_stats USING btree (player_id);


--
-- TOC entry 4841 (class 1259 OID 16553)
-- Name: idx_pgs_team_season; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pgs_team_season ON public.player_game_stats USING btree (team_season_id);


--
-- TOC entry 4851 (class 1259 OID 16601)
-- Name: idx_pr_season_week_ts; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pr_season_week_ts ON public.power_rankings USING btree (season_id, week, team_season_id);


--
-- TOC entry 4846 (class 1259 OID 16579)
-- Name: idx_standings_season_ts; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_standings_season_ts ON public.standings USING btree (season_id, team_season_id);


--
-- TOC entry 4822 (class 1259 OID 16458)
-- Name: idx_team_seasons_season; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_team_seasons_season ON public.team_seasons USING btree (season_id);


--
-- TOC entry 4823 (class 1259 OID 16459)
-- Name: idx_team_seasons_team; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_team_seasons_team ON public.team_seasons USING btree (team_id);


--
-- TOC entry 4872 (class 2606 OID 16611)
-- Name: bracket bracket_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bracket
    ADD CONSTRAINT bracket_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON DELETE CASCADE;


--
-- TOC entry 4862 (class 2606 OID 16511)
-- Name: games games_away_team_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_away_team_season_id_fkey FOREIGN KEY (away_team_season_id) REFERENCES public.team_seasons(id) ON DELETE RESTRICT;


--
-- TOC entry 4863 (class 2606 OID 16506)
-- Name: games games_home_team_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_home_team_season_id_fkey FOREIGN KEY (home_team_season_id) REFERENCES public.team_seasons(id) ON DELETE RESTRICT;


--
-- TOC entry 4864 (class 2606 OID 16501)
-- Name: games games_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON DELETE CASCADE;


--
-- TOC entry 4865 (class 2606 OID 16536)
-- Name: player_game_stats player_game_stats_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_game_stats
    ADD CONSTRAINT player_game_stats_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;


--
-- TOC entry 4866 (class 2606 OID 16541)
-- Name: player_game_stats player_game_stats_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_game_stats
    ADD CONSTRAINT player_game_stats_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;


--
-- TOC entry 4867 (class 2606 OID 16546)
-- Name: player_game_stats player_game_stats_team_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_game_stats
    ADD CONSTRAINT player_game_stats_team_season_id_fkey FOREIGN KEY (team_season_id) REFERENCES public.team_seasons(id) ON DELETE CASCADE;


--
-- TOC entry 4870 (class 2606 OID 16591)
-- Name: power_rankings power_rankings_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.power_rankings
    ADD CONSTRAINT power_rankings_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON DELETE CASCADE;


--
-- TOC entry 4871 (class 2606 OID 16596)
-- Name: power_rankings power_rankings_team_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.power_rankings
    ADD CONSTRAINT power_rankings_team_season_id_fkey FOREIGN KEY (team_season_id) REFERENCES public.team_seasons(id) ON DELETE CASCADE;


--
-- TOC entry 4860 (class 2606 OID 16480)
-- Name: roster_memberships roster_memberships_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roster_memberships
    ADD CONSTRAINT roster_memberships_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;


--
-- TOC entry 4861 (class 2606 OID 16485)
-- Name: roster_memberships roster_memberships_team_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roster_memberships
    ADD CONSTRAINT roster_memberships_team_season_id_fkey FOREIGN KEY (team_season_id) REFERENCES public.team_seasons(id) ON DELETE CASCADE;


--
-- TOC entry 4868 (class 2606 OID 16569)
-- Name: standings standings_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.standings
    ADD CONSTRAINT standings_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON DELETE CASCADE;


--
-- TOC entry 4869 (class 2606 OID 16574)
-- Name: standings standings_team_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.standings
    ADD CONSTRAINT standings_team_season_id_fkey FOREIGN KEY (team_season_id) REFERENCES public.team_seasons(id) ON DELETE CASCADE;


--
-- TOC entry 4858 (class 2606 OID 16448)
-- Name: team_seasons team_seasons_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_seasons
    ADD CONSTRAINT team_seasons_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON DELETE CASCADE;


--
-- TOC entry 4859 (class 2606 OID 16453)
-- Name: team_seasons team_seasons_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_seasons
    ADD CONSTRAINT team_seasons_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


-- Completed on 2025-08-28 11:54:11

--
-- PostgreSQL database dump complete
--


