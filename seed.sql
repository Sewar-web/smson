DROP TABLE IF EXISTS smson;
CREATE TABLE smson
(
    id SERIAL PRIMARY KEY,
    quote  VARCHAR(255),
    character VARCHAR(255),
    image VARCHAR(255),
    characterDirection VARCHAR(255)
     
);

