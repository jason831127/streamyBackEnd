const bookshelfFactory = require('bookshelf');


module.exports = function (server) {
  const bookshelf = bookshelfFactory(server.rds);


  const Student = bookshelf.Model.extend({
    tableName: 'students',
    homeworks: function () {
      return this.hasMany(Homework, 'student_id');
    },
  });

  const Homework = bookshelf.Model.extend({
    tableName: 'homeworks',
    student: function () {
      return this.belongsTo(Student, 'student_id');
    },
    pages: function () {
      return this.hasMany(Page, 'homework_id');
    },
  });

  const Page = bookshelf.Model.extend({
    tableName: 'pages',
    homework: function () {
      return this.belongsTo(Homework, 'homework_id');
    },
  });
  return { Student, Homework, Page };
};
