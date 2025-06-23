CREATE TABLE IF NOT EXISTS gapminder_data (
    id SERIAL PRIMARY KEY,
    country VARCHAR(255),
    continent VARCHAR(255),
    year INTEGER,
    life_exp FLOAT,
    pop BIGINT,
    gdp_per_cap FLOAT
);

COPY gapminder_data(country, continent, year, life_exp, pop, gdp_per_cap)
FROM '/docker-entrypoint-initdb.d/gapminder.csv'
DELIMITER ','
CSV HEADER;