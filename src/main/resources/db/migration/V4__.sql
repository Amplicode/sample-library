CREATE SEQUENCE IF NOT EXISTS hibernate_sequence START WITH 1 INCREMENT BY 1;

CREATE TABLE book
(
    id       BIGINT       NOT NULL,
    name     VARCHAR(255) NOT NULL,
    genre_id BIGINT       NOT NULL,
    CONSTRAINT pk_book PRIMARY KEY (id)
);

CREATE TABLE book_authors
(
    author_id BIGINT NOT NULL,
    book_id   BIGINT NOT NULL,
    CONSTRAINT pk_book_authors PRIMARY KEY (author_id, book_id)
);

ALTER TABLE book
    ADD CONSTRAINT FK_BOOK_ON_GENRE FOREIGN KEY (genre_id) REFERENCES genre (id);

ALTER TABLE book_authors
    ADD CONSTRAINT fk_booaut_on_author FOREIGN KEY (author_id) REFERENCES author (id);

ALTER TABLE book_authors
    ADD CONSTRAINT fk_booaut_on_book FOREIGN KEY (book_id) REFERENCES book (id);