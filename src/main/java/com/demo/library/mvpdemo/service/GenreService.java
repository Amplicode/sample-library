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
    private final GenreRepository genreRepository;
    private final ModelMapper modelMapper;

    public GenreService(GenreRepository genreRepository, ModelMapper modelMapper) {
        this.genreRepository = genreRepository;
        this.modelMapper = modelMapper;
    }

    @GraphQLQuery(name = "allGenres")
    @Transactional(readOnly = true)
    public List<GenreDto> findAll() {
        return genreRepository.findAll().stream()
                .map(e -> modelMapper.map(e, GenreDto.class))
                .collect(Collectors.toList());
    }

    @GraphQLMutation(name = "update_Genre")
    @Transactional
    public GenreDto update(GenreDto input) {
        if (input.getId() != null) {
            if (!genreRepository.existsById(input.getId())) {
                throw ResourceNotFoundException.withId(input.getId());
            }
        }

        Genre entity = new Genre();
        modelMapper.map(input, entity);
        entity = genreRepository.save(entity);

        return modelMapper.map(entity, GenreDto.class);
    }

    @GraphQLMutation(name = "delete_Genre")
    @Transactional
    public void delete(@GraphQLNonNull Long id) {
        Genre entity = genreRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.withId(id));
        genreRepository.delete(entity);
    }
}
