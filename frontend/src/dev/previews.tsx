import React from "react";
import { ComponentPreview, Previews } from "@react-buddy/ide-toolbox";
import App from "../app/App";
import BookList from "../app/books/BookList";
import BookDetails from "../app/books/BookDetails";
import AuthorList from "../app/authors/AuthorList";

export const ComponentPreviews = () => {
    return (
        <Previews>
            <ComponentPreview path="/App">
                <App />
            </ComponentPreview>
            <ComponentPreview path="/BookList">
                <BookList/>
            </ComponentPreview>
            <ComponentPreview path="/BookDetails">
                <BookDetails/>
            </ComponentPreview>
            <ComponentPreview path="/AuthorList">
                <AuthorList/>
            </ComponentPreview>
        </Previews>
    );
};
