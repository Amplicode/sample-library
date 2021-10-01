package com.demo.library.mvpdemo.repository;

import com.demo.library.mvpdemo.entity.Author;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AuthorRepository extends JpaRepository<Author, Long> {
    @Query("select a from Author a where upper(a.firstName) like upper(concat('%', ?1, '%')) or upper(a.lastName) like upper(concat('%', ?2, '%'))")
    List<Author> findByFirstNameOrLastName(String firstName, String lastName);

    List<Author> findByBooks_IdOrderByFirstNameAscLastNameAsc(Long id);
}