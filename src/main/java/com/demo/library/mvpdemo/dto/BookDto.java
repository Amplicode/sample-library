package com.demo.library.mvpdemo.dto;

import java.io.Serializable;

public class BookDto implements Serializable {
    private Long id;
    private String name;
    private GenreDto genre;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public GenreDto getGenre() {
        return genre;
    }

    public void setGenre(GenreDto genre) {
        this.genre = genre;
    }
}
