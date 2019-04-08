const {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  graphql
} = require('graphql');



module.exports = function (server) {
  const { Student } = require('./models.js')(server);
  const BookshelfType = require('graphql-bookshelf').default;

  var PageType = new GraphQLObjectType(BookshelfType({
    name: 'Page',
    description: 'Pages of a homework',
    fields: (model) => ({
      id: model.attr({
        type: new GraphQLNonNull(GraphQLInt),
        description: 'The id of the page',
      }),
      content: model.attr({
        type: GraphQLString,
        description: 'The body of the page.',
      })
    })
  }));

  var HomeworkType = new GraphQLObjectType(BookshelfType({
    name: 'Homework',
    description: 'Homework submitted by the student.',
    fields: (model) => ({
      id: model.attr({
        type: new GraphQLNonNull(GraphQLInt),
        description: 'The id of the homework.',
      }),
      pages: model.hasMany({
        type: new GraphQLList(PageType),
        description: 'pages in the homework',
      }),
      subject: model.attr({
        type: GraphQLString,
        description: 'subject of the homework',
      })
    })
  }));

  var StudentType = new GraphQLObjectType(BookshelfType({
    name: 'Student',
    description: 'A humble student.',
    fields: (model) => ({
      id: model.attr({
        type: new GraphQLNonNull(GraphQLInt),
        description: 'The id of the student.',
      }),
      name: model.attr({
        type: GraphQLString,
        description: 'The id of the student.',
      }),
      homeworks: model.hasMany({
        type: new GraphQLList(HomeworkType),
        description: 'All the homework the student has submitted.',
      })
    })
  }));
  var schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'RootQueryType',
      fields: () => ({
        viewer: {
          type: StudentType,
          args: {
            id: {
              type: GraphQLInt,
              description: 'ID of the current student.'
            }
          },
          description: 'The current student.',
          resolve: (source, { id }) => {
            return Student.where({ id }).fetch();
          }
        }
      })
    })
  });
  return schema;
};
