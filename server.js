const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require("graphql");
const app = express();

const authors = [
  { id: 1, name: "J. K. Rowling" },
  { id: 2, name: "J. R. R. Tolkien" },
];
const books = [
  { id: 1, name: "Harry Potter 1", authorId: 1 },
  { id: 2, name: "Harry Potter 2", authorId: 1 },
  { id: 3, name: "The Hobbit", authorId: 2 },
  { id: 4, name: "Leaf by Niggle", authorId: 2 },
];
// Schema difines the query section
// const schema = new GraphQLSchema({
//   query: new GraphQLObjectType({
//     name: "HelloWorld",
//     fields: () => ({
//       /* The query will return some of this actual information
//        by doing { loque } we will receive:
//        { "data": { "loque": "loky"} } */
//       message: { type: GraphQLString, resolve: () => "Hello World" },
//       loque: { type: GraphQLString, resolve: () => "loky" },
//     }),
//   }),
// });
const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    book: {
      type: BookType,
      description: "A Single Book",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) =>
        // Find the book that matches with the given id
        books.find((book) => book.id === args.id),
    },
    /* example of query by id{
      book(id:4) {
        name, author {name}
      }
      author(id:2) {
        name, books {name}
      }
    } */
    author: {
      type: AuthorType,
      description: "A Single Author",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) =>
        // Find the author that matches with the given id
        authors.find((author) => author.id === args.id),
    },
    books: {
      type: new GraphQLList(BookType),
      description: "List of all books",
      resolve: () => books,
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: "List of authors",
      resolve: () => authors,
    },
  }),
});
const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This represent a book written by an author",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLString) },
    author: {
      type: AuthorType,
      resolve: (book) => {
        //Check if the authorId matches with an id in the author array
        return authors.find((author) => author.id === book.authorId);
      },
    },
  }),
});
const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "This represents an author of a book",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: GraphQLList(BookType),
      resolve: (author) => {
        return books.filter((book) => book.authorId === author.id);
      },
    },
  }),
});
const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root of mutation",
  fields: () => ({
    addBook: {
      type: BookType,
      description: "Add a book",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const book = {
          id: books.length + 1,
          name: args.name,
          authorId: args.authorId,
        };
        books.push(book);
        return book;
      },
    },
    addAuthor: {
      type: AuthorType,
      description: "Add a author",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const author = {
          id: authors.length + 1,
          name: args.name,
        };
        authors.push(author);
        return author;
      },
    },
  }),
});
const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});
app.use("/graphql", graphqlHTTP({ schema, graphiql: true }));
app.listen(5000, () => console.log("Server Running"));
