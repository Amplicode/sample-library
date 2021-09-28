package com.demo.library.mvpdemo.service;

import io.leangen.graphql.annotations.GraphQLQuery;
import io.leangen.graphql.spqr.spring.annotations.GraphQLApi;
import org.springframework.stereotype.Service;

@GraphQLApi
@Service
public class TestService {
    @GraphQLQuery(name = "test")
    public String test() {
        return "Hello world";
    }
}
