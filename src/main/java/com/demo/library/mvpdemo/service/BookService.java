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
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import static com.demo.library.mvpdemo.service.Authorities.ADMIN;
import static com.demo.library.mvpdemo.service.Authorities.USER;

@GraphQLApi
@Service
public class BookService {
    private final BookRepository crudRepository;
    private final ModelMapper mapper;

    public BookService(BookRepository crudRepository, ModelMapper mapper) {
        this.crudRepository = crudRepository;
        this.mapper = mapper;
    }

    @Secured({ADMIN})
    @GraphQLMutation(name = "delete_Book")
    @Transactional
    public void delete(@GraphQLNonNull Long id) {
        Book entity = crudRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(String.format("Unable to find entity by id: %s ", id)));

        crudRepository.delete(entity);
    }

    @Secured({ADMIN, USER})
    @GraphQLQuery(name = "findAll_Book")
    @Transactional(readOnly = true)
    public List<BookDetailsDto> findAll() {
        return crudRepository.findAll().stream()
                .map(e -> {
                    BookDetailsDto dto = mapper.map(e, BookDetailsDto.class);
                    sortBookAuthors(dto);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private void sortBookAuthors(BookDetailsDto dto) {
        if (dto.getAuthors() != null && dto.getAuthors().size() > 1) {
            dto.getAuthors().sort(Comparator.comparing(a -> a.getFirstName() + a.getLastName()));
        }
    }

    @Secured({ADMIN, USER})
    @GraphQLQuery(name = "byAuthor_Book")
    @Transactional(readOnly = true)
    public List<BookDto> findByAuthor(@GraphQLNonNull Long authorId) {
        return crudRepository.findByAuthors_IdOrderByNameAsc(authorId).stream()
                .map(e -> mapper.map(e, BookDto.class))
                .collect(Collectors.toList());
    }

    @Secured({ADMIN, USER})
    @GraphQLQuery(name = "findById_Book")
    @Transactional(readOnly = true)
    public BookDetailsDto findById(@GraphQLNonNull Long id) {
        return crudRepository.findById(id)
                .map(e -> mapper.map(e, BookDetailsDto.class))
                .orElseThrow(() -> new RuntimeException(String.format("Unable to find entity by id: %s ", id)));
    }

    @Secured({ADMIN})
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