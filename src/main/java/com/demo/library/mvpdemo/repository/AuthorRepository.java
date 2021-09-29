package com.demo.library.mvpdemo.repository;

import com.demo.library.mvpdemo.entity.Author;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuthorRepository extends JpaRepository<Author, Long> {
    List<Author> findByFirstNameContainsIgnoreCaseOrLastNameContainsIgnoreCase(
            String firstName, String lastName);

    List<Author> findByBooks_IdOrderByFirstNameAscLastNameAsc(Long id);
}