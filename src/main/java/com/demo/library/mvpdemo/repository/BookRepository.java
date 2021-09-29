package com.demo.library.mvpdemo.repository;

import com.demo.library.mvpdemo.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByAuthors_IdOrderByNameAsc(Long id);

}