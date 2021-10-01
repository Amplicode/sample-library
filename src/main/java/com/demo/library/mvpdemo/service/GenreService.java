package com.demo.library.mvpdemo.service;

import com.demo.library.mvpdemo.dto.GenreDto;
import com.demo.library.mvpdemo.entity.Genre;
import com.demo.library.mvpdemo.graphql.ResourceNotFoundException;
import com.demo.library.mvpdemo.repository.GenreRepository;
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
public class GenreService {
    private final GenreRepository crudRepository;
    private final ModelMapper mapper;

    public GenreService(GenreRepository crudRepository, ModelMapper mapper) {
        this.crudRepository = crudRepository;
        this.mapper = mapper;
    }

    @GraphQLQuery(name = "allGenres")
    @Transactional(readOnly = true)
    public List<GenreDto> findAll() {
        return crudRepository.findAll().stream()
                .map(e -> mapper.map(e, GenreDto.class))
                .collect(Collectors.toList());
    }

    @GraphQLMutation(name = "update_Genre")
    @Transactional
    public GenreDto update(GenreDto input) {
        if (input.getId() != null) {
            if (!crudRepository.existsById(input.getId())) {
                throw ResourceNotFoundException.withId(input.getId());
            }
        }

        Genre entity = new Genre();
        mapper.map(input, entity);
        entity = crudRepository.save(entity);

        return mapper.map(entity, GenreDto.class);
    }

    @GraphQLMutation(name = "delete_Genre")
    @Transactional
    public void delete(@GraphQLNonNull Long id) {
        Genre entity = crudRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.withId(id));
        crudRepository.delete(entity);
    }

    @GraphQLQuery(name = "countGenres")
    @Transactional
    public long count() {
        return crudRepository.count();
    }

    @GraphQLQuery(name = "findGenre")
    @Transactional
    public GenreDto findById(@GraphQLNonNull Long id) {
        return crudRepository.findById(id)
                .map(e -> mapper.map(e, GenreDto.class))
                .orElseThrow(() -> new RuntimeException(String.format("Unable to find entity by id: %s ", id)));
    }
}
