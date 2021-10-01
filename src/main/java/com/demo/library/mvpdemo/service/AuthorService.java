package com.demo.library.mvpdemo.service;

import com.demo.library.mvpdemo.dto.AuthorDto;
import com.demo.library.mvpdemo.dto.AuthorFilterDto;
import com.demo.library.mvpdemo.entity.Author;
import com.demo.library.mvpdemo.repository.AuthorRepository;
import io.leangen.graphql.annotations.GraphQLMutation;
import io.leangen.graphql.annotations.GraphQLNonNull;
import io.leangen.graphql.annotations.GraphQLQuery;
import io.leangen.graphql.spqr.spring.annotations.GraphQLApi;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ObjectUtils;

import java.util.List;
import java.util.stream.Collectors;

@GraphQLApi
@Service
public class AuthorService {
    private final AuthorRepository crudRepository;
    private final ModelMapper mapper;

    public AuthorService(AuthorRepository crudRepository, ModelMapper mapper) {
        this.crudRepository = crudRepository;
        this.mapper = mapper;
    }

    @GraphQLMutation(name = "delete_Author")
    @Transactional
    public void delete(@GraphQLNonNull Long id) {
        Author entity = crudRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(String.format("Unable to find entity by id: %s ", id)));

        crudRepository.delete(entity);
    }

    @GraphQLQuery(name = "list_Author")
    @Transactional(readOnly = true)
    public List<AuthorDto> findAll(@GraphQLNonNull AuthorFilterDto filter) {
        List<Author> authors;
        if (ObjectUtils.isEmpty(filter.getName())) {
            authors = crudRepository.findAll();
        } else {
            authors = crudRepository.findByFirstNameOrLastName(filter.getName(), filter.getName());
        }

        return authors.stream()
                .map(e -> mapper.map(e, AuthorDto.class))
                .collect(Collectors.toList());
    }

    @GraphQLQuery(name = "findByBook_Author")
    @Transactional(readOnly = true)
    public List<AuthorDto> findByBook(@GraphQLNonNull Long bookId) {
        return crudRepository.findByBooks_IdOrderByFirstNameAscLastNameAsc(bookId).stream()
                .map(e -> mapper.map(e, AuthorDto.class))
                .collect(Collectors.toList());
    }

    @GraphQLQuery(name = "loadById_Author")
    @Transactional(readOnly = true)
    public AuthorDto findById(@GraphQLNonNull Long id) {
        return crudRepository.findById(id)
                .map(e -> mapper.map(e, AuthorDto.class))
                .orElseThrow(() -> new RuntimeException(String.format("Unable to find entity by id: %s ", id)));
    }

    @GraphQLMutation(name = "save_Author")
    @Transactional
    public AuthorDto update(AuthorDto input) {
        if (input.getId() != null) {
            if (!crudRepository.existsById(input.getId())) {
                throw new RuntimeException(
                        String.format("Unable to find entity by id: %s ", input.getId()));
            }
        }
        Author entity = new Author();
        mapper.map(input, entity);
        entity = crudRepository.save(entity);

        return mapper.map(entity, AuthorDto.class);
    }
}