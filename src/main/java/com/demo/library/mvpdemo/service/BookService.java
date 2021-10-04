package com.demo.library.mvpdemo.service;

import com.demo.library.mvpdemo.dto.BookDetailsDto;
import com.demo.library.mvpdemo.dto.BookDto;
import com.demo.library.mvpdemo.entity.Book;
import com.demo.library.mvpdemo.repository.BookRepository;
import io.leangen.graphql.annotations.GraphQLMutation;
import io.leangen.graphql.annotations.GraphQLNonNull;
import io.leangen.graphql.annotations.GraphQLQuery;
import io.leangen.graphql.spqr.spring.annotations.GraphQLApi;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@GraphQLApi
@Service
public class BookService {
    private final BookRepository crudRepository;
    private final ModelMapper mapper;

    public BookService(BookRepository crudRepository, ModelMapper mapper) {
        this.crudRepository = crudRepository;
        this.mapper = mapper;
    }

    @GraphQLMutation(name = "delete_Book")
    @Transactional
    public void delete(@GraphQLNonNull Long id) {
        Book entity = crudRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(String.format("Unable to find entity by id: %s ", id)));

        crudRepository.delete(entity);
    }

    @GraphQLQuery(name = "findAll_Book")
    @Transactional(readOnly = true)
    public List<BookDetailsDto> findAll() {
        return crudRepository.findAll().stream()
                .map(e -> mapper.map(e, BookDetailsDto.class))
                .collect(Collectors.toList());
    }

    @GraphQLQuery(name = "byAuthor_Book")
    @Transactional(readOnly = true)
    public List<BookDto> findByAuthor(@GraphQLNonNull Long authorId) {
        return crudRepository.findByAuthors_IdOrderByNameAsc(authorId).stream()
                .map(e -> mapper.map(e, BookDto.class))
                .collect(Collectors.toList());
    }

    @GraphQLQuery(name = "findById_Book")
    @Transactional(readOnly = true)
    public BookDetailsDto findById(@GraphQLNonNull Long id) {
        return crudRepository.findById(id)
                .map(e -> mapper.map(e, BookDetailsDto.class))
                .orElseThrow(() -> new RuntimeException(String.format("Unable to find entity by id: %s ", id)));
    }

    @GraphQLMutation(name = "save_Book")
    @Transactional
    public BookDetailsDto update(BookDetailsDto input) {
        if (input.getId() != null) {
            if (!crudRepository.existsById(input.getId())) {
                throw new RuntimeException(
                        String.format("Unable to find entity by id: %s ", input.getId()));
            }
        }
        Book entity = new Book();
        mapper.map(input, entity);
        entity = crudRepository.save(entity);

        return mapper.map(entity, BookDetailsDto.class);
    }
}