import bookshelf from '../bookshelf';
import User from './user';

export default bookshelf.Model.extend({
    tableName: 'skills',
    skills: function() {
        return this.belongsTo(User);
    }
})