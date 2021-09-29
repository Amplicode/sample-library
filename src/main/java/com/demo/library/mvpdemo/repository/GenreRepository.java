package com.demo.library.mvpdemo.repository;

import com.demo.library.mvpdemo.entity.Genre;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GenreRepository extends JpaRepository<Genre, Long> {

}